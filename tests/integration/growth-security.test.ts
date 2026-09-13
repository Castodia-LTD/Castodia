import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertSafeEnvironment,
  client,
  makeOrg,
  makeServiceUser,
  makeUser,
  signIn,
  TEST_SERVICE_ROLE_KEY,
} from "./test-helpers";

let admin: SupabaseClient;
let managerA: SupabaseClient;
let managerB: SupabaseClient;
let supportA: SupabaseClient;
let unassignedSupportA: SupabaseClient;
let familyA: SupabaseClient;
let orgA = "";
let orgB = "";
let serviceUserA = "";
let serviceUserB = "";
let managerAId = "";
let supportAId = "";
let unassignedSupportAId = "";
let familyAId = "";
const authIds: string[] = [];

async function createFamilyIdentity() {
  const suffix = randomUUID();
  const email = `castodia-growth-family-${suffix}@example.test`;
  const password = `Castodia-Test-${suffix}!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Could not create family user: ${error?.message}`);
  authIds.push(data.user.id);
  familyAId = data.user.id;
  const link = await admin.from("family_users").insert({
    auth_user_id: familyAId,
    service_user_id: serviceUserA,
    organisation_id: orgA,
    full_name: "Growth Family",
    email,
    relationship: "Family",
    is_active: true,
    created_by_user_id: managerAId,
  });
  if (link.error) throw link.error;
  return signIn({ email, password });
}

beforeAll(async () => {
  assertSafeEnvironment();
  if (!TEST_SERVICE_ROLE_KEY) throw new Error("Missing service role key");
  admin = client(TEST_SERVICE_ROLE_KEY);
  orgA = await makeOrg(admin, "Growth A");
  orgB = await makeOrg(admin, "Growth B");
  const managerAIdentity = await makeUser(admin, orgA, "manager", "growth-manager-a");
  const managerBIdentity = await makeUser(admin, orgB, "manager", "growth-manager-b");
  const supportAIdentity = await makeUser(admin, orgA, "support", "growth-support-a");
  const unassignedIdentity = await makeUser(admin, orgA, "support", "growth-support-unassigned");
  authIds.push(managerAIdentity.id, managerBIdentity.id, supportAIdentity.id, unassignedIdentity.id);
  managerAId = managerAIdentity.id;
  supportAId = supportAIdentity.id;
  unassignedSupportAId = unassignedIdentity.id;
  serviceUserA = await makeServiceUser(admin, orgA, "Growth-A");
  serviceUserB = await makeServiceUser(admin, orgB, "Growth-B");
  const assignment = await admin.from("staff_service_user_access").insert({
    staff_id: supportAId,
    service_user_id: serviceUserA,
  });
  if (assignment.error) throw assignment.error;
  [managerA, managerB, supportA, unassignedSupportA] = await Promise.all([
    signIn(managerAIdentity),
    signIn(managerBIdentity),
    signIn(supportAIdentity),
    signIn(unassignedIdentity),
  ]);
  familyA = await createFamilyIdentity();
}, 30_000);

afterAll(async () => {
  if (!admin) return;
  if (serviceUserA) await admin.from("growth_goal_evidence").delete().eq("organisation_id", orgA);
  if (serviceUserA) await admin.from("growth_goal_events").delete().eq("organisation_id", orgA);
  if (serviceUserA) await admin.from("growth_observations").delete().eq("organisation_id", orgA);
  if (serviceUserA) await admin.from("growth_goals").delete().eq("organisation_id", orgA);
  if (familyAId) await admin.from("family_users").delete().eq("auth_user_id", familyAId);
  if (serviceUserA || serviceUserB) {
    await admin.from("service_users").delete().in("id", [serviceUserA, serviceUserB].filter(Boolean));
  }
  for (const id of authIds) {
    await admin.from("profiles").delete().eq("id", id);
    await admin.auth.admin.deleteUser(id);
  }
  if (orgA || orgB) await admin.from("organisations").delete().in("id", [orgA, orgB].filter(Boolean));
}, 30_000);

describe("Castodia Growth security and idempotency", () => {
  test("manager creates a goal and another organisation cannot read it", async () => {
    const { data: goalId, error } = await managerA.rpc("create_growth_goal", {
      p_service_user_id: serviceUserA,
      p_title: "Choose and attend a weekly activity",
      p_desired_outcome: "More confidence making community choices",
      p_support_approach: "Offer two accessible options",
      p_domain: "community_participation",
      p_status: "active",
      p_start_date: "2026-09-12",
      p_target_date: null,
    });
    expect(error).toBeNull();
    expect(goalId).toEqual(expect.any(String));

    const own = await managerA.from("growth_goals").select("id").eq("id", goalId);
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);
    const other = await managerB.from("growth_goals").select("id").eq("id", goalId);
    expect(other.error).toBeNull();
    expect(other.data).toEqual([]);
  });

  test("assigned support can create and read goals but cannot update them", async () => {
    const created = await supportA.rpc("create_growth_goal", {
      p_service_user_id: serviceUserA,
      p_title: "Choose a household task",
      p_desired_outcome: "More independence at home",
      p_support_approach: "Offer a choice of two tasks",
      p_domain: "independent_living",
      p_status: "active",
      p_start_date: "2026-09-13",
      p_target_date: null,
    });
    expect(created.error).toBeNull();
    expect(created.data).toEqual(expect.any(String));

    const assigned = await supportA.from("growth_goals").select("id").eq("service_user_id", serviceUserA);
    expect(assigned.error).toBeNull();
    expect(assigned.data?.length).toBeGreaterThan(0);
    const unassigned = await unassignedSupportA.from("growth_goals").select("id").eq("service_user_id", serviceUserA);
    expect(unassigned.error).toBeNull();
    expect(unassigned.data).toEqual([]);
    const mutation = await supportA.from("growth_goals")
      .update({ title: "Forbidden support edit", updated_by_user_id: supportAId })
      .eq("service_user_id", serviceUserA).select("id");
    expect(mutation.error).not.toBeNull();
  });

  test("monthly review write-through is idempotent and leaves source JSON intact", async () => {
    const embeddedId = randomUUID();
    const review = {
      service_user_id: serviceUserA,
      reviewer_id: managerAId,
      review_month: "2026-09-01",
      meeting_date: "2026-09-12",
      responses: { agreedGoals: [{
        id: embeddedId,
        title: "Prepare one chosen meal",
        desiredOutcome: "More independence at home",
        targetDate: null,
        status: "active",
        source: "monthly_check_in",
        agreedAt: "2026-09-12T12:00:00.000Z",
      }] },
      consent: {}, actions: [], completed_at: "2026-09-12T12:00:00.000Z",
      reviewer_name: "Growth Manager", service_user_name: "Growth Person",
    };
    const first = await managerA.rpc("save_monthly_review_with_growth", { p_review: review });
    const editedReview = {
      ...review,
      responses: {
        agreedGoals: [{
          ...review.responses.agreedGoals[0],
          title: "Prepare two chosen meals",
        }],
      },
    };
    const second = await managerA.rpc("save_monthly_review_with_growth", { p_review: editedReview });
    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
    expect(second.data).toBe(first.data);
    const goals = await managerA.from("growth_goals").select("id,title")
      .eq("source_review_id", first.data).eq("source_external_id", embeddedId);
    expect(goals.error).toBeNull();
    expect(goals.data).toHaveLength(1);
    expect(goals.data?.[0]?.title).toBe("Prepare two chosen meals");
    const source = await managerA.from("monthly_service_user_reviews").select("responses")
      .eq("id", first.data).single();
    expect(source.error).toBeNull();
    expect(source.data?.responses).toEqual(editedReview.responses);
  });

  test("monthly reviews are tenant-scoped and assigned support can create goals through them", async () => {
    const own = await managerA.from("monthly_service_user_reviews")
      .select("id").eq("service_user_id", serviceUserA);
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);

    const crossTenant = await managerB.from("monthly_service_user_reviews")
      .select("id").eq("service_user_id", serviceUserA);
    expect(crossTenant.error).toBeNull();
    expect(crossTenant.data).toEqual([]);

    const embeddedId = randomUUID();
    const supportReview = await supportA.rpc("save_monthly_review_with_growth", {
      p_review: {
        service_user_id: serviceUserA,
        reviewer_id: supportAId,
        review_month: "2026-10-01",
        meeting_date: "2026-10-12",
        responses: { agreedGoals: [{
          id: embeddedId,
          title: "Choose a weekly community activity",
          desiredOutcome: "More confidence making community choices",
          targetDate: null,
          status: "active",
          source: "monthly_check_in",
          agreedAt: "2026-10-12T12:00:00.000Z",
        }] },
        consent: {}, actions: [], completed_at: "2026-10-12T12:00:00.000Z",
        reviewer_name: "Growth Support", service_user_name: "Growth Person",
      },
    });
    expect(supportReview.error).toBeNull();

    const createdGoal = await supportA.from("growth_goals").select("id,created_by_user_id")
      .eq("source_review_id", supportReview.data).eq("source_external_id", embeddedId).single();
    expect(createdGoal.error).toBeNull();
    expect(createdGoal.data?.created_by_user_id).toBe(supportAId);

    for (const [client, actorId, target] of [
      [unassignedSupportA, unassignedSupportAId, serviceUserA],
      [supportA, supportAId, serviceUserB],
    ] as const) {
      const forbidden = await client.rpc("save_monthly_review_with_growth", {
        p_review: {
          service_user_id: target,
          reviewer_id: actorId,
          review_month: "2026-11-01",
          meeting_date: "2026-11-12",
          responses: { agreedGoals: [] },
          consent: {}, actions: [], completed_at: "2026-11-12T12:00:00.000Z",
          reviewer_name: "Growth Support", service_user_name: "Growth Person",
        },
      });
      expect(forbidden.error).not.toBeNull();
    }
  });

  test("family sees only separately authorised goals", async () => {
    const hidden = await familyA.from("growth_goals").select("id").eq("service_user_id", serviceUserA);
    expect(hidden.error).toBeNull();
    expect(hidden.data).toEqual([]);
    const goal = await managerA.from("growth_goals").select("id")
      .eq("service_user_id", serviceUserA).limit(1).single();
    expect(goal.error).toBeNull();
    const visible = await managerA.from("growth_goals")
      .update({ family_visible: true, updated_by_user_id: managerAId })
      .eq("id", goal.data?.id).select("id");
    expect(visible.error).toBeNull();
    const familyRows = await familyA.from("growth_goals").select("id").eq("id", goal.data?.id);
    expect(familyRows.error).toBeNull();
    expect(familyRows.data).toHaveLength(1);

    const evidenceSave = await managerA.rpc("save_timeline_entry_with_growth", {
      p_service_user_id: serviceUserA,
      p_entry_type: "Activity",
      p_content: "Took part in a chosen activity",
      p_metadata: {},
      p_event_time: "2026-09-12T14:00:00.000Z",
      p_growth: {
        domain: "community_participation",
        progressType: "milestone",
        relatedGoalIds: [goal.data?.id],
        summary: "Chose and joined the activity independently",
      },
    });
    expect(evidenceSave.error).toBeNull();
    const observation = await managerA.from("growth_observations")
      .select("id").eq("timeline_entry_id", evidenceSave.data).single();
    expect(observation.error).toBeNull();
    const hiddenEvidence = await familyA.from("growth_observations")
      .select("id").eq("id", observation.data?.id);
    expect(hiddenEvidence.error).toBeNull();
    expect(hiddenEvidence.data).toEqual([]);
    const evidenceLink = await managerA.from("growth_goal_evidence")
      .update({ family_visible: true }).eq("observation_id", observation.data?.id).select("id").single();
    expect(evidenceLink.error).toBeNull();
    const sharedEvidence = await familyA.from("growth_observations")
      .select("id").eq("id", observation.data?.id);
    expect(sharedEvidence.error).toBeNull();
    expect(sharedEvidence.data).toHaveLength(1);

    const revoke = await admin.from("family_users")
      .update({ is_active: false }).eq("auth_user_id", familyAId);
    expect(revoke.error).toBeNull();
    const afterRevocation = await familyA.from("growth_goals")
      .select("id").eq("id", goal.data?.id);
    expect(afterRevocation.error).toBeNull();
    expect(afterRevocation.data).toEqual([]);
  });

  test("support cannot create a goal without person access or across organisations", async () => {
    for (const [client, target] of [[unassignedSupportA, serviceUserA], [supportA, serviceUserB]] as const) {
      const result = await client.rpc("create_growth_goal", {
        p_service_user_id: target,
        p_title: "Forbidden",
        p_desired_outcome: null,
        p_support_approach: null,
        p_domain: "independent_living",
        p_status: "active",
        p_start_date: "2026-09-12",
        p_target_date: null,
      });
      expect(result.error).not.toBeNull();
    }
  });
});
