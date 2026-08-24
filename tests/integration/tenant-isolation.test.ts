import { randomUUID } from "node:crypto";

import { config } from "dotenv";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

config({
  path: ".env.test.local",
});

const TEST_URL =
  process.env.SUPABASE_TEST_URL;

const TEST_ANON_KEY =
  process.env.SUPABASE_TEST_ANON_KEY;

const TEST_SERVICE_ROLE_KEY =
  process.env
    .SUPABASE_TEST_SERVICE_ROLE_KEY;

const ALLOW_TEST_DATABASE =
  process.env
    .CASTODIA_ALLOW_TEST_DATABASE;

/*
 * Production project reference supplied during the
 * August 2026 technical review.
 *
 * This is an additional safety belt. The tests should
 * NEVER be run against production.
 */
const PRODUCTION_PROJECT_REF =
  "ijlvsfypeesmlognujbs";

function assertSafeEnvironment() {
  if (
    !TEST_URL ||
    !TEST_ANON_KEY ||
    !TEST_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      [
        "Missing Castodia integration-test environment variables.",
        "Copy .env.test.example to .env.test.local and use a",
        "DEDICATED NON-PRODUCTION Supabase project.",
      ].join(" "),
    );
  }

  if (ALLOW_TEST_DATABASE !== "YES") {
    throw new Error(
      "CASTODIA_ALLOW_TEST_DATABASE must be exactly YES.",
    );
  }

  if (
    TEST_URL.includes(
      PRODUCTION_PROJECT_REF,
    )
  ) {
    throw new Error(
      "REFUSING TO RUN: SUPABASE_TEST_URL points at the known Castodia production project.",
    );
  }

  if (
    !TEST_URL.startsWith(
      "https://",
    )
  ) {
    throw new Error(
      "SUPABASE_TEST_URL must be a valid HTTPS Supabase URL.",
    );
  }
}

type TestIdentity = {
  userId: string;
  email: string;
  password: string;
  organisationId: string;
};

type ServiceUserFixture = {
  id: string;
  fullName: string;
};

let admin:
  | SupabaseClient
  | undefined;

let managerA:
  | SupabaseClient
  | undefined;

let supportA:
  | SupabaseClient
  | undefined;

let managerB:
  | SupabaseClient
  | undefined;

let managerAIdentity:
  | TestIdentity
  | undefined;

let supportAIdentity:
  | TestIdentity
  | undefined;

let managerBIdentity:
  | TestIdentity
  | undefined;

let serviceUserA:
  | ServiceUserFixture
  | undefined;

let serviceUserB:
  | ServiceUserFixture
  | undefined;

const createdAuthUserIds:
  string[] = [];

const createdOrganisationIds:
  string[] = [];

function requireFixture<T>(
  value: T | undefined,
  name: string,
): T {
  if (!value) {
    throw new Error(
      `Missing test fixture: ${name}`,
    );
  }

  return value;
}

function newClient(
  key: string,
) {
  return createClient(
    requireFixture(
      TEST_URL,
      "SUPABASE_TEST_URL",
    ),
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function createOrganisation(
  name: string,
) {
  const client =
    requireFixture(
      admin,
      "admin client",
    );

  const {
    data,
    error,
  } = await client
    .from("organisations")
    .insert({
      name,
      uses_houses: false,
      is_active: true,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create test organisation: ${error?.message ?? "unknown error"}`,
    );
  }

  createdOrganisationIds.push(
    data.id,
  );

  return data.id as string;
}

async function createIdentity(
  role: "manager" | "support",
  organisationId: string,
  label: string,
): Promise<TestIdentity> {
  const client =
    requireFixture(
      admin,
      "admin client",
    );

  const suffix =
    randomUUID();

  const email =
    `castodia-test-${label}-${suffix}@example.test`;

  const password =
    `Castodia-Test-${suffix}!`;

  const {
    data: authData,
    error: authError,
  } =
    await client.auth.admin.createUser(
      {
        email,
        password,
        email_confirm: true,
      },
    );

  if (
    authError ||
    !authData.user
  ) {
    throw new Error(
      `Could not create ${label} Auth user: ${authError?.message ?? "unknown error"}`,
    );
  }

  createdAuthUserIds.push(
    authData.user.id,
  );

  const {
    error: profileError,
  } = await client
    .from("profiles")
    .insert({
      id: authData.user.id,
      full_name:
        `Integration Test ${label}`,
      role,
      organisation_id:
        organisationId,
    });

  if (profileError) {
    throw new Error(
      `Could not create ${label} profile: ${profileError.message}`,
    );
  }

  return {
    userId: authData.user.id,
    email,
    password,
    organisationId,
  };
}

async function signedInClient(
  identity: TestIdentity,
) {
  const client =
    newClient(
      requireFixture(
        TEST_ANON_KEY,
        "SUPABASE_TEST_ANON_KEY",
      ),
    );

  const {
    error,
  } =
    await client.auth.signInWithPassword(
      {
        email: identity.email,
        password:
          identity.password,
      },
    );

  if (error) {
    throw new Error(
      `Could not sign in ${identity.email}: ${error.message}`,
    );
  }

  return client;
}

async function createServiceUser(
  organisationId: string,
  label: string,
): Promise<ServiceUserFixture> {
  const client =
    requireFixture(
      admin,
      "admin client",
    );

  const suffix =
    randomUUID().slice(0, 8);

  const firstName =
    `Test-${label}`;

  const surname =
    `User-${suffix}`;

  const fullName =
    `${firstName} ${surname}`;

  const {
    data,
    error,
  } = await client
    .from("service_users")
    .insert({
      first_name: firstName,
      surname,
      full_name: fullName,
      house_name: "Test House",
      organisation_id:
        organisationId,
      is_active: true,
      continence_care_enabled:
        false,
      track_pad_changes: false,
      track_bristol_stool_chart:
        false,
    })
    .select("id, full_name")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create ${label} service user: ${error?.message ?? "unknown error"}`,
    );
  }

  return {
    id: data.id as string,
    fullName:
      data.full_name as string,
  };
}

beforeAll(async () => {
  assertSafeEnvironment();

  admin =
    newClient(
      requireFixture(
        TEST_SERVICE_ROLE_KEY,
        "SUPABASE_TEST_SERVICE_ROLE_KEY",
      ),
    );

  const runId =
    randomUUID().slice(0, 8);

  const organisationAId =
    await createOrganisation(
      `Castodia Test Org A ${runId}`,
    );

  const organisationBId =
    await createOrganisation(
      `Castodia Test Org B ${runId}`,
    );

  managerAIdentity =
    await createIdentity(
      "manager",
      organisationAId,
      "manager-a",
    );

  supportAIdentity =
    await createIdentity(
      "support",
      organisationAId,
      "support-a",
    );

  managerBIdentity =
    await createIdentity(
      "manager",
      organisationBId,
      "manager-b",
    );

  managerA =
    await signedInClient(
      managerAIdentity,
    );

  supportA =
    await signedInClient(
      supportAIdentity,
    );

  managerB =
    await signedInClient(
      managerBIdentity,
    );

  serviceUserA =
    await createServiceUser(
      organisationAId,
      "Alpha",
    );

  serviceUserB =
    await createServiceUser(
      organisationBId,
      "Beta",
    );
}, 30_000);

afterAll(async () => {
  if (!admin) {
    return;
  }

  /*
   * Remove organisation-owned rows first.
   * Service users cascade/dependency behaviour can
   * differ as the schema evolves, so cleanup is best-effort.
   */
  if (
    serviceUserA ||
    serviceUserB
  ) {
    await admin
      .from("service_users")
      .delete()
      .in(
        "id",
        [
          serviceUserA?.id,
          serviceUserB?.id,
        ].filter(Boolean),
      );
  }

  for (
    const userId
    of createdAuthUserIds
  ) {
    await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    await admin.auth.admin
      .deleteUser(userId);
  }

  for (
    const organisationId
    of createdOrganisationIds
  ) {
    await admin
      .from("organisations")
      .delete()
      .eq(
        "id",
        organisationId,
      );
  }
}, 30_000);

describe(
  "Castodia cross-tenant RLS",
  () => {
    test(
      "Manager A can read their own organisation service user",
      async () => {
        const client =
          requireFixture(
            managerA,
            "manager A client",
          );

        const ownUser =
          requireFixture(
            serviceUserA,
            "service user A",
          );

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .select(
            "id, organisation_id",
          )
          .eq("id", ownUser.id);

        expect(error).toBeNull();
        expect(data).toHaveLength(1);

        expect(
          data?.[0]
            ?.organisation_id,
        ).toBe(
          requireFixture(
            managerAIdentity,
            "manager A identity",
          ).organisationId,
        );
      },
    );

    test(
      "Manager A cannot read Organisation B service user",
      async () => {
        const client =
          requireFixture(
            managerA,
            "manager A client",
          );

        const otherUser =
          requireFixture(
            serviceUserB,
            "service user B",
          );

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .select("id")
          .eq(
            "id",
            otherUser.id,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A can read their own organisation service user",
      async () => {
        const client =
          requireFixture(
            supportA,
            "support A client",
          );

        const ownUser =
          requireFixture(
            serviceUserA,
            "service user A",
          );

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .select("id")
          .eq("id", ownUser.id);

        expect(error).toBeNull();
        expect(data).toHaveLength(1);
      },
    );

    test(
      "Support A cannot read Organisation B service user",
      async () => {
        const client =
          requireFixture(
            supportA,
            "support A client",
          );

        const otherUser =
          requireFixture(
            serviceUserB,
            "service user B",
          );

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .select("id")
          .eq(
            "id",
            otherUser.id,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Manager A cannot update Organisation B service user",
      async () => {
        const client =
          requireFixture(
            managerA,
            "manager A client",
          );

        const otherUser =
          requireFixture(
            serviceUserB,
            "service user B",
          );

        const originalName =
          otherUser.fullName;

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .update({
            full_name:
              "CROSS TENANT CHANGE",
          })
          .eq(
            "id",
            otherUser.id,
          )
          .select("id");

        expect(error).toBeNull();
        expect(data).toEqual([]);

        const adminClient =
          requireFixture(
            admin,
            "admin client",
          );

        const {
          data: verified,
          error:
            verifyError,
        } = await adminClient
          .from("service_users")
          .select(
            "id, full_name",
          )
          .eq(
            "id",
            otherUser.id,
          )
          .single();

        expect(
          verifyError,
        ).toBeNull();

        expect(
          verified?.full_name,
        ).toBe(originalName);
      },
    );

    test(
      "Manager A cannot insert a service user into Organisation B",
      async () => {
        const client =
          requireFixture(
            managerA,
            "manager A client",
          );

        const orgB =
          requireFixture(
            managerBIdentity,
            "manager B identity",
          ).organisationId;

        const {
          error,
        } = await client
          .from("service_users")
          .insert({
            first_name:
              "Cross",
            surname:
              "Tenant",
            full_name:
              "Cross Tenant",
            house_name: "Test House",
            organisation_id:
              orgB,
            is_active: true,
            continence_care_enabled:
              false,
            track_pad_changes:
              false,
            track_bristol_stool_chart:
              false,
          });

        expect(error).not.toBeNull();
      },
    );

    test(
      "Support A cannot create a service user even inside Organisation A",
      async () => {
        const client =
          requireFixture(
            supportA,
            "support A client",
          );

        const orgA =
          requireFixture(
            supportAIdentity,
            "support A identity",
          ).organisationId;

        const {
          error,
        } = await client
          .from("service_users")
          .insert({
            first_name:
              "Support",
            surname:
              "Attempt",
            full_name:
              "Support Attempt",
            house_name: "Test House",
            organisation_id:
              orgA,
            is_active: true,
            continence_care_enabled:
              false,
            track_pad_changes:
              false,
            track_bristol_stool_chart:
              false,
          });

        expect(error).not.toBeNull();
      },
    );

    test(
      "Manager B cannot read Organisation A service user",
      async () => {
        const client =
          requireFixture(
            managerB,
            "manager B client",
          );

        const otherUser =
          requireFixture(
            serviceUserA,
            "service user A",
          );

        const {
          data,
          error,
        } = await client
          .from("service_users")
          .select("id")
          .eq(
            "id",
            otherUser.id,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );
  },
);
