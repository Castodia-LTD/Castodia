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
let supportA: SupabaseClient;
let managerB: SupabaseClient;
let orgA = "";
let orgB = "";
let serviceUserA = "";
let serviceUserB = "";
let assessmentA = "";
const authIds: string[] = [];

function assessmentPayload(
  organisationId: string,
  serviceUserId: string,
  assessorId: string,
) {
  return {
    organisation_id: organisationId,
    service_user_id: serviceUserId,
    title: "Medication assessment",
    decision: "Can the person decide whether to take their morning medicine?",
    assessment_date: "2026-09-12",
    review_date: "2026-12-12",
    outcome: "has_capacity",
    status: "completed",
    version: 1,
    assessment_data: {
      reasonForAssessment: "A decision-specific assessment is required.",
      practicableSupport: "Easy-read information and additional time were provided.",
      impairmentDetails: "Documented impairment affecting cognition.",
      impairmentNature: "permanent",
      relevantInformation: "Purpose, benefits, risks and alternatives were explained.",
      understand: { result: "demonstrated", evidence: "The person explained the information back." },
      retain: { result: "demonstrated", evidence: "The person retained it during the discussion." },
      useOrWeigh: { result: "demonstrated", evidence: "The person compared the benefits and risks." },
      communicate: { result: "demonstrated", evidence: "The person communicated a consistent choice." },
      causalLink: "No decision-making inability caused by the impairment was identified.",
      conclusionReasoning: "The functional evidence supports capacity for this decision now.",
      capacityMayFluctuate: false,
      personViews: "The person wishes to make this decision themselves.",
    },
    template_snapshot: {
      framework: "castodia_mca_v1",
      title: "Castodia decision-specific capacity assessment",
    },
    assessor_id: assessorId,
    assessor_name: "Integration Test Manager",
    completed_at: new Date().toISOString(),
    created_by: assessorId,
  };
}

beforeAll(async () => {
  assertSafeEnvironment();
  if (!TEST_SERVICE_ROLE_KEY) throw new Error("Missing staging service key");

  admin = client(TEST_SERVICE_ROLE_KEY);
  orgA = await makeOrg(admin, "MCA A");
  orgB = await makeOrg(admin, "MCA B");

  const managerAIdentity = await makeUser(admin, orgA, "manager", "mca-manager-a");
  const supportAIdentity = await makeUser(admin, orgA, "support", "mca-support-a");
  const managerBIdentity = await makeUser(admin, orgB, "manager", "mca-manager-b");
  authIds.push(managerAIdentity.id, supportAIdentity.id, managerBIdentity.id);

  managerA = await signIn(managerAIdentity);
  supportA = await signIn(supportAIdentity);
  managerB = await signIn(managerBIdentity);
  serviceUserA = await makeServiceUser(admin, orgA, "MCA-A");
  serviceUserB = await makeServiceUser(admin, orgB, "MCA-B");

  const { data, error } = await managerA
    .from("mental_capacity_assessments")
    .insert(assessmentPayload(orgA, serviceUserA, managerAIdentity.id))
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Could not create MCA fixture: ${error?.message}`);
  }
  assessmentA = data.id as string;
}, 45_000);

afterAll(async () => {
  if (!admin) return;
  await admin.from("mental_capacity_assessments").delete().in("organisation_id", [orgA, orgB].filter(Boolean));
  await admin.from("service_users").delete().in("id", [serviceUserA, serviceUserB].filter(Boolean));

  for (const id of authIds) {
    await admin.from("profiles").delete().eq("id", id);
    await admin.auth.admin.deleteUser(id);
  }
  await admin.from("organisations").delete().in("id", [orgA, orgB].filter(Boolean));
}, 45_000);

describe("Mental capacity assessment security", () => {
  test("support can read a completed assessment in their organisation", async () => {
    const { data, error } = await supportA
      .from("mental_capacity_assessments")
      .select("id")
      .eq("id", assessmentA);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  test("support cannot create an assessment", async () => {
    const { error } = await supportA
      .from("mental_capacity_assessments")
      .insert(assessmentPayload(orgA, serviceUserA, authIds[1]));

    expect(error).not.toBeNull();
  });

  test("support cannot change a completed assessment", async () => {
    const { data, error } = await supportA
      .from("mental_capacity_assessments")
      .update({ title: "Forbidden change" })
      .eq("id", assessmentA)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("managers cannot change completed assessments", async () => {
    const { data, error } = await managerA
      .from("mental_capacity_assessments")
      .update({ title: "Forbidden manager change" })
      .eq("id", assessmentA)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("a manager cannot create an assessment for another organisation's service user", async () => {
    const { error } = await managerA
      .from("mental_capacity_assessments")
      .insert(assessmentPayload(orgA, serviceUserB, authIds[0]));

    expect(error).not.toBeNull();
  });

  test("another organisation cannot read the assessment", async () => {
    const { data, error } = await managerB
      .from("mental_capacity_assessments")
      .select("id")
      .eq("id", assessmentA);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
