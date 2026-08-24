import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.test.local" });

export const TEST_URL = process.env.SUPABASE_TEST_URL;
export const TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
export const TEST_SERVICE_ROLE_KEY = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const ALLOW = process.env.CASTODIA_ALLOW_TEST_DATABASE;
const PROD = "ijlvsfypeesmlognujbs";

export function assertSafeEnvironment() {
  if (!TEST_URL || !TEST_ANON_KEY || !TEST_SERVICE_ROLE_KEY)
    throw new Error("Missing Castodia integration-test environment variables.");
  if (ALLOW !== "YES")
    throw new Error("CASTODIA_ALLOW_TEST_DATABASE must be exactly YES.");
  if (TEST_URL.includes(PROD))
    throw new Error("REFUSING TO RUN against Castodia production.");
  if (!TEST_URL.startsWith("https://"))
    throw new Error("SUPABASE_TEST_URL must be a valid HTTPS Supabase URL.");
}

export function client(key: string): SupabaseClient {
  if (!TEST_URL) throw new Error("Missing SUPABASE_TEST_URL");
  return createClient(TEST_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function makeOrg(admin: SupabaseClient, label: string) {
  const { data, error } = await admin.from("organisations").insert({
    name: `Castodia Test ${label} ${randomUUID().slice(0,8)}`,
    uses_houses: false, is_active: true, status: "active",
  }).select("id").single();
  if (error || !data?.id) throw new Error(`Could not create organisation: ${error?.message}`);
  return data.id as string;
}

export async function makeUser(admin: SupabaseClient, org: string, role: "manager"|"support", label: string) {
  const suffix = randomUUID();
  const email = `castodia-test-${label}-${suffix}@example.test`;
  const password = `Castodia-Test-${suffix}!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Could not create Auth user: ${error?.message}`);
  const p = await admin.from("profiles").insert({
    id: data.user.id, full_name: `Integration Test ${label}`, role, organisation_id: org,
  });
  if (p.error) throw new Error(`Could not create profile: ${p.error.message}`);
  return { id: data.user.id, email, password, org };
}

export async function signIn(identity: {email:string,password:string}) {
  if (!TEST_ANON_KEY) throw new Error("Missing SUPABASE_TEST_ANON_KEY");
  const c = client(TEST_ANON_KEY);
  const { error } = await c.auth.signInWithPassword(identity);
  if (error) throw error;
  return c;
}

export async function makeServiceUser(admin: SupabaseClient, org: string, label: string) {
  const suffix = randomUUID().slice(0,8);
  const { data, error } = await admin.from("service_users").insert({
    first_name: `Test-${label}`, surname: `User-${suffix}`,
    full_name: `Test-${label} User-${suffix}`, house_name: "Test House",
    organisation_id: org, is_active: true, continence_care_enabled: false,
    track_pad_changes: false, track_bristol_stool_chart: false,
  }).select("id").single();
  if (error || !data?.id) throw new Error(`Could not create service user: ${error?.message}`);
  return data.id as string;
}
