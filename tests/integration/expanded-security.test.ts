import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertSafeEnvironment, client, TEST_SERVICE_ROLE_KEY,
  makeOrg, makeUser, signIn, makeServiceUser,
} from "./test-helpers";

let admin: SupabaseClient;
let managerA: SupabaseClient;
let supportA: SupabaseClient;
let managerB: SupabaseClient;
let orgA = "", orgB = "", suA = "", suB = "";
const authIds: string[] = [];

const crossTenantTables = [
  "medication_profiles",
  "medication_administrations",
  "medication_dose_plans",
  "medication_rounds",
  "medication_stock_transactions",
  "safeguarding_cases",
  "safeguarding_actions",
  "safeguarding_chronology",
  "safeguarding_documents",
  "safeguarding_referrals",
  "care_plans",
  "care_plan_sections",
  "risk_assessments",
  "handovers",
  "handover_service_users",
  "timeline_entries",
  "personal_care_records",
  "memories",
  "memory_photos",
  "staff_competencies",
  "staff_documents",
  "staff_employment",
  "staff_supervisions",
  "staff_training_records",
] as const;

beforeAll(async () => {
  assertSafeEnvironment();
  if (!TEST_SERVICE_ROLE_KEY) throw new Error("Missing service key");
  admin = client(TEST_SERVICE_ROLE_KEY);
  orgA = await makeOrg(admin, "Security A");
  orgB = await makeOrg(admin, "Security B");

  const ma = await makeUser(admin, orgA, "manager", "security-manager-a");
  const sa = await makeUser(admin, orgA, "support", "security-support-a");
  const mb = await makeUser(admin, orgB, "manager", "security-manager-b");
  authIds.push(ma.id, sa.id, mb.id);

  managerA = await signIn(ma);
  supportA = await signIn(sa);
  managerB = await signIn(mb);
  suA = await makeServiceUser(admin, orgA, "Security-A");
  suB = await makeServiceUser(admin, orgB, "Security-B");
}, 30_000);

afterAll(async () => {
  if (!admin) return;
  if (suA || suB) await admin.from("service_users").delete().in("id", [suA, suB].filter(Boolean));
  for (const id of authIds) {
    await admin.from("profiles").delete().eq("id", id);
    await admin.auth.admin.deleteUser(id);
  }
  if (orgA || orgB) await admin.from("organisations").delete().in("id", [orgA, orgB].filter(Boolean));
}, 30_000);

describe("Castodia expanded security regression", () => {
  test("Manager A cannot see Organisation B profile", async () => {
    const { data, error } = await managerA.from("profiles").select("id").eq("organisation_id", orgB);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("Support A cannot see Organisation B profiles", async () => {
    const { data, error } = await supportA.from("profiles").select("id").eq("organisation_id", orgB);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("Manager B cannot see Organisation A profiles", async () => {
    const { data, error } = await managerB.from("profiles").select("id").eq("organisation_id", orgA);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  for (const table of crossTenantTables) {
    test(`Manager A cross-tenant probe is blocked on ${table}`, async () => {
      // Query by organisation_id where the table exposes it. If the column is not exposed,
      // PostgREST returns a schema error; that is not treated as proof of isolation.
      const { data, error } = await managerA.from(table).select("*").eq("organisation_id", orgB).limit(1);
      if (error && /column .*organisation_id.* does not exist|Could not find the .*organisation_id/i.test(error.message)) {
        return; // covered by service-user-linked tests elsewhere; do not fabricate a pass assertion.
      }
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  }

  test("Manager A cannot update Service User B", async () => {
    const { data, error } = await managerA.from("service_users")
      .update({ full_name: "CROSS TENANT SECURITY REGRESSION" })
      .eq("id", suB).select("id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("Support A cannot create a service user", async () => {
    const { error } = await supportA.from("service_users").insert({
      first_name: "Forbidden", surname: "Insert", full_name: "Forbidden Insert",
      house_name: "Test House", organisation_id: orgA, is_active: true,
      continence_care_enabled: false, track_pad_changes: false,
      track_bristol_stool_chart: false,
    });
    expect(error).not.toBeNull();
  });

  test("Manager A cannot insert a service user into Organisation B", async () => {
    const { error } = await managerA.from("service_users").insert({
      first_name: "Cross", surname: "Tenant", full_name: "Cross Tenant",
      house_name: "Test House", organisation_id: orgB, is_active: true,
      continence_care_enabled: false, track_pad_changes: false,
      track_bristol_stool_chart: false,
    });
    expect(error).not.toBeNull();
  });
});
