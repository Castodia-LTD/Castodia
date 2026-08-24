import { randomUUID } from "node:crypto";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  assertSafeEnvironment,
  client,
  TEST_SERVICE_ROLE_KEY,
  makeOrg,
  makeUser,
  signIn,
  makeServiceUser,
} from "./test-helpers";

type Identity = {
  id: string;
  email: string;
  password: string;
  org: string;
};

let admin: SupabaseClient;
let managerA: SupabaseClient;
let supportA: SupabaseClient;
let managerB: SupabaseClient;
let familyA: SupabaseClient;

let orgA = "";
let orgB = "";

let managerAIdentity: Identity;
let supportAIdentity: Identity;
let managerBIdentity: Identity;
let supportBIdentity: Identity;
let familyAIdentity: {
  id: string;
  email: string;
  password: string;
};

let suA = "";
let suB = "";

let medA = "";
let medB = "";
let carePlanDraftA = "";
let carePlanPublishedA = "";
let carePlanB = "";
let riskA = "";
let riskB = "";
let safeguardingA = "";
let safeguardingB = "";
let employmentA = "";
let employmentB = "";
let familyLinkA = "";
let memorySharedA = "";
let memoryPrivateA = "";
let memorySharedB = "";

const createdAuthIds: string[] = [];

async function createFamilyAuthUser() {
  const suffix = randomUUID();
  const email =
    `castodia-family-test-${suffix}@example.test`;
  const password =
    `Castodia-Family-${suffix}!`;

  const {
    data,
    error,
  } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(
      `Could not create family Auth user: ${error?.message}`,
    );
  }

  createdAuthIds.push(
    data.user.id,
  );

  return {
    id: data.user.id,
    email,
    password,
  };
}

async function createMedicationProfile(
  serviceUserId: string,
  label: string,
) {
  const {
    data,
    error,
  } = await admin
    .from("medication_profiles")
    .insert({
      service_user_id:
        serviceUserId,
      medication_name:
        `Test Medication ${label}`,
      dose: "1 tablet",
      route: "oral",
      round: "Morning",
      is_prn: false,
      active: true,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create medication profile ${label}: ${error?.message}`,
    );
  }

  return data.id as string;
}

async function createCarePlan(
  userClient: SupabaseClient,
  organisationId: string,
  serviceUserId: string,
  title: string,
  status:
    | "draft"
    | "published",
) {
  const {
    data,
    error,
  } = await userClient
    .from("care_plans")
    .insert({
      organisation_id:
        organisationId,
      service_user_id:
        serviceUserId,
      title,
      status,
      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create care plan ${title}: ${error?.message}`,
    );
  }

  return data.id as string;
}

async function createRiskAssessment(
  userClient: SupabaseClient,
  organisationId: string,
  serviceUserId: string,
  title: string,
) {
  const {
    data,
    error,
  } = await userClient
    .from("risk_assessments")
    .insert({
      organisation_id:
        organisationId,
      service_user_id:
        serviceUserId,
      title,
      risk_description:
        "Integration test risk",
      personal_risk_factors:
        "Integration test factors",
      control_measures:
        "Integration test controls",
      actions_if_occurs:
        "Integration test actions",
      overall_risk: "medium",
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create risk assessment ${title}: ${error?.message}`,
    );
  }

  return data.id as string;
}

async function createEmployment(
  organisationId: string,
  staffId: string,
  managerId: string,
  label: string,
) {
  const {
    data,
    error,
  } = await admin
    .from("staff_employment")
    .insert({
      organisation_id:
        organisationId,
      staff_id: staffId,
      job_title:
        `Test ${label}`,
      employment_status:
        "active",
      dbs_status: "clear",
      created_by:
        managerId,
      updated_by:
        managerId,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create staff employment ${label}: ${error?.message}`,
    );
  }

  return data.id as string;
}

async function createMemory(
  organisationId: string,
  serviceUserId: string,
  createdBy: string,
  title: string,
  familyVisible: boolean,
) {
  const {
    data,
    error,
  } = await admin
    .from("memories")
    .insert({
      organisation_id:
        organisationId,
      service_user_id:
        serviceUserId,
      title,
      story:
        "Integration test memory",
      memory_date:
        "2026-08-17",
      category: "other",
      created_by:
        createdBy,
      family_visible:
        familyVisible,
      archived: false,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Could not create memory ${title}: ${error?.message}`,
    );
  }

  return data.id as string;
}

async function createSafeguardingCaseAs(
  userClient: SupabaseClient,
  serviceUserId: string,
  title: string,
) {
  const {
    data,
    error,
  } =
    await userClient.rpc(
      "create_safeguarding_case",
      {
        p_service_user_id:
          serviceUserId,
        p_title: title,
        p_category: "other",
        p_risk_level: "medium",
        p_concern_summary:
          "Integration test safeguarding concern",
        p_date_concern_raised:
          new Date().toISOString(),
      },
    );

  if (error || !data) {
    throw new Error(
      `Could not create safeguarding case ${title}: ${error?.message}`,
    );
  }

  return data as string;
}

beforeAll(
  async () => {
    assertSafeEnvironment();

    if (
      !TEST_SERVICE_ROLE_KEY
    ) {
      throw new Error(
        "Missing staging service key",
      );
    }

    admin =
      client(
        TEST_SERVICE_ROLE_KEY,
      );

    orgA =
      await makeOrg(
        admin,
        "Behaviour A",
      );

    orgB =
      await makeOrg(
        admin,
        "Behaviour B",
      );

    managerAIdentity =
      await makeUser(
        admin,
        orgA,
        "manager",
        "behaviour-manager-a",
      );

    supportAIdentity =
      await makeUser(
        admin,
        orgA,
        "support",
        "behaviour-support-a",
      );

    managerBIdentity =
      await makeUser(
        admin,
        orgB,
        "manager",
        "behaviour-manager-b",
      );

    supportBIdentity =
      await makeUser(
        admin,
        orgB,
        "support",
        "behaviour-support-b",
      );

    createdAuthIds.push(
      managerAIdentity.id,
      supportAIdentity.id,
      managerBIdentity.id,
      supportBIdentity.id,
    );

    managerA =
      await signIn(
        managerAIdentity,
      );

    supportA =
      await signIn(
        supportAIdentity,
      );

    managerB =
      await signIn(
        managerBIdentity,
      );

    suA =
      await makeServiceUser(
        admin,
        orgA,
        "Behaviour-A",
      );

    suB =
      await makeServiceUser(
        admin,
        orgB,
        "Behaviour-B",
      );

    medA =
      await createMedicationProfile(
        suA,
        "A",
      );

    medB =
      await createMedicationProfile(
        suB,
        "B",
      );

    /*
     * One current care plan per service user is enforced.
     * Use an archived-style second SU fixture for separate
     * draft/published behaviour where needed.
     */
    carePlanDraftA =
      await createCarePlan(
        managerA,
        orgA,
        suA,
        "Draft Plan A",
        "draft",
      );

    carePlanB =
      await createCarePlan(
        managerB,
        orgB,
        suB,
        "Draft Plan B",
        "draft",
      );

    riskA =
      await createRiskAssessment(
        managerA,
        orgA,
        suA,
        "Risk A",
      );

    riskB =
      await createRiskAssessment(
        managerB,
        orgB,
        suB,
        "Risk B",
      );

    employmentA =
      await createEmployment(
        orgA,
        supportAIdentity.id,
        managerAIdentity.id,
        "Employment A",
      );

    employmentB =
      await createEmployment(
        orgB,
        supportBIdentity.id,
        managerBIdentity.id,
        "Employment B",
      );

    safeguardingA =
      await createSafeguardingCaseAs(
        managerA,
        suA,
        "Safeguarding A",
      );

    safeguardingB =
      await createSafeguardingCaseAs(
        managerB,
        suB,
        "Safeguarding B",
      );

    familyAIdentity =
      await createFamilyAuthUser();

    const {
      data: familyLink,
      error: familyError,
    } = await admin
      .from("family_users")
      .insert({
        auth_user_id:
          familyAIdentity.id,
        service_user_id:
          suA,
        organisation_id:
          orgA,
        full_name:
          "Integration Family A",
        email:
          familyAIdentity.email,
        relationship:
          "relative",
        is_active: true,
        created_by_user_id:
          managerAIdentity.id,
      })
      .select("id")
      .single();

    if (
      familyError ||
      !familyLink?.id
    ) {
      throw new Error(
        `Could not create family link: ${familyError?.message}`,
      );
    }

    familyLinkA =
      familyLink.id as string;

    familyA =
      await signIn(
        familyAIdentity,
      );

    memorySharedA =
      await createMemory(
        orgA,
        suA,
        supportAIdentity.id,
        "Shared Memory A",
        true,
      );

    memoryPrivateA =
      await createMemory(
        orgA,
        suA,
        supportAIdentity.id,
        "Private Memory A",
        false,
      );

    memorySharedB =
      await createMemory(
        orgB,
        suB,
        supportBIdentity.id,
        "Shared Memory B",
        true,
      );
  },
  45_000,
);

afterAll(
  async () => {
    if (!admin) return;

    /*
     * Best-effort cleanup in dependency order.
     */
    if (orgA || orgB) {
      const orgs =
        [orgA, orgB]
          .filter(Boolean);

      await admin
        .from(
          "safeguarding_documents",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "safeguarding_referrals",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "safeguarding_actions",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "safeguarding_chronology",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "safeguarding_audit_log",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "safeguarding_cases",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from("memory_photos")
        .delete()
        .in(
          "memory_id",
          [
            memorySharedA,
            memoryPrivateA,
            memorySharedB,
          ].filter(Boolean),
        );

      await admin
        .from("memories")
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from("family_users")
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "staff_employment",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "risk_assessments",
        )
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from("care_plans")
        .delete()
        .in(
          "organisation_id",
          orgs,
        );

      await admin
        .from(
          "medication_profiles",
        )
        .delete()
        .in(
          "service_user_id",
          [suA, suB]
            .filter(Boolean),
        );

      await admin
        .from("service_users")
        .delete()
        .in(
          "id",
          [suA, suB]
            .filter(Boolean),
        );
    }

    for (
      const id
      of createdAuthIds
    ) {
      await admin
        .from("profiles")
        .delete()
        .eq("id", id);

      await admin.auth.admin
        .deleteUser(id);
    }

    if (
      familyAIdentity?.id
    ) {
      await admin.auth.admin
        .deleteUser(
          familyAIdentity.id,
        );
    }

    if (orgA || orgB) {
      await admin
        .from("organisations")
        .delete()
        .in(
          "id",
          [orgA, orgB]
            .filter(Boolean),
        );
    }
  },
  45_000,
);

describe(
  "Medication behavioural security",
  () => {
    test(
      "Manager A can read own medication profile",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "medication_profiles",
          )
          .select("id")
          .eq("id", medA);

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Support A can read own-org medication profile",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from(
            "medication_profiles",
          )
          .select("id")
          .eq("id", medA);

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Manager A cannot read Organisation B medication profile",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "medication_profiles",
          )
          .select("id")
          .eq("id", medB);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A cannot read Organisation B medication profile",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from(
            "medication_profiles",
          )
          .select("id")
          .eq("id", medB);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A cannot create a medication profile",
      async () => {
        const {
          error,
        } = await supportA
          .from(
            "medication_profiles",
          )
          .insert({
            service_user_id:
              suA,
            medication_name:
              "Forbidden Support Medication",
            dose: "1 tablet",
            route: "oral",
            round: "Morning",
          });

        expect(error).not.toBeNull();
      },
    );

    test(
      "Manager A cannot create medication for Organisation B service user",
      async () => {
        const {
          error,
        } = await managerA
          .from(
            "medication_profiles",
          )
          .insert({
            service_user_id:
              suB,
            medication_name:
              "Forbidden Cross Tenant Medication",
            dose: "1 tablet",
            route: "oral",
            round: "Morning",
          });

        expect(error).not.toBeNull();
      },
    );
  },
);

describe(
  "Safeguarding behavioural security",
  () => {
    test(
      "Manager A can read own safeguarding case",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "safeguarding_cases",
          )
          .select("id")
          .eq(
            "id",
            safeguardingA,
          );

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Manager A cannot read Organisation B safeguarding case",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "safeguarding_cases",
          )
          .select("id")
          .eq(
            "id",
            safeguardingB,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A cannot read manager safeguarding case",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from(
            "safeguarding_cases",
          )
          .select("id")
          .eq(
            "id",
            safeguardingA,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A cannot create safeguarding case through RPC",
      async () => {
        const {
          error,
        } = await supportA.rpc(
          "create_safeguarding_case",
          {
            p_service_user_id:
              suA,
            p_title:
              "Forbidden Support Case",
            p_category:
              "other",
            p_risk_level:
              "medium",
            p_concern_summary:
              "Must be denied",
            p_date_concern_raised:
              new Date().toISOString(),
          },
        );

        expect(error).not.toBeNull();
      },
    );

    test(
      "Manager A cannot create safeguarding case for Organisation B",
      async () => {
        const {
          error,
        } = await managerA.rpc(
          "create_safeguarding_case",
          {
            p_service_user_id:
              suB,
            p_title:
              "Forbidden Cross Tenant Case",
            p_category:
              "other",
            p_risk_level:
              "medium",
            p_concern_summary:
              "Must be denied",
            p_date_concern_raised:
              new Date().toISOString(),
          },
        );

        expect(error).not.toBeNull();
      },
    );
  },
);

describe(
  "Staff HR behavioural security",
  () => {
    test(
      "Manager A can read Organisation A employment record",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "staff_employment",
          )
          .select("id")
          .eq(
            "id",
            employmentA,
          );

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Support A cannot read employment record",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from(
            "staff_employment",
          )
          .select("id")
          .eq(
            "id",
            employmentA,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Manager A cannot read Organisation B employment record",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "staff_employment",
          )
          .select("id")
          .eq(
            "id",
            employmentB,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Manager A cannot modify Organisation B employment record",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "staff_employment",
          )
          .update({
            notes:
              "Cross tenant attack",
          })
          .eq(
            "id",
            employmentB,
          )
          .select("id");

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );
  },
);

describe(
  "Care plan and risk behavioural security",
  () => {
    test(
      "Manager A can read own draft care plan",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from("care_plans")
          .select("id")
          .eq(
            "id",
            carePlanDraftA,
          );

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Support A cannot read draft care plan",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from("care_plans")
          .select("id")
          .eq(
            "id",
            carePlanDraftA,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Manager A cannot read Organisation B care plan",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from("care_plans")
          .select("id")
          .eq(
            "id",
            carePlanB,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Manager A can read own risk assessment",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "risk_assessments",
          )
          .select("id")
          .eq("id", riskA);

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Support A can read active own-org risk assessment",
      async () => {
        const {
          data,
          error,
        } = await supportA
          .from(
            "risk_assessments",
          )
          .select("id")
          .eq("id", riskA);

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Manager A cannot read Organisation B risk assessment",
      async () => {
        const {
          data,
          error,
        } = await managerA
          .from(
            "risk_assessments",
          )
          .select("id")
          .eq("id", riskB);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Support A cannot create risk assessment",
      async () => {
        const {
          error,
        } = await supportA
          .from(
            "risk_assessments",
          )
          .insert({
            organisation_id:
              orgA,
            service_user_id:
              suA,
            title:
              "Forbidden Support Risk",
            risk_description:
              "Risk",
            personal_risk_factors:
              "Factors",
            control_measures:
              "Controls",
            actions_if_occurs:
              "Actions",
            overall_risk:
              "medium",
            status: "active",
            created_by:
              supportAIdentity.id,
            updated_by:
              supportAIdentity.id,
          });

        expect(error).not.toBeNull();
      },
    );
  },
);

describe(
  "Family behavioural security",
  () => {
    test(
      "Family A can read their own family account",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("family_users")
          .select("id")
          .eq(
            "id",
            familyLinkA,
          );

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Family A can read linked service user",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("service_users")
          .select("id")
          .eq("id", suA);

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Family A cannot read unrelated service user",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("service_users")
          .select("id")
          .eq("id", suB);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Family A can read shared linked memory",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("memories")
          .select("id")
          .eq(
            "id",
            memorySharedA,
          );

        expect(error).toBeNull();
        expect(data).toHaveLength(
          1,
        );
      },
    );

    test(
      "Family A cannot read private linked memory",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("memories")
          .select("id")
          .eq(
            "id",
            memoryPrivateA,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Family A cannot read shared memory belonging to another organisation",
      async () => {
        const {
          data,
          error,
        } = await familyA
          .from("memories")
          .select("id")
          .eq(
            "id",
            memorySharedB,
          );

        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );

    test(
      "Deactivating family link removes family access",
      async () => {
        const {
          error: disableError,
        } = await admin
          .from("family_users")
          .update({
            is_active: false,
          })
          .eq(
            "id",
            familyLinkA,
          );

        expect(
          disableError,
        ).toBeNull();

        const {
          data,
          error,
        } = await familyA
          .from("service_users")
          .select("id")
          .eq("id", suA);

        expect(error).toBeNull();
        expect(data).toEqual([]);

        const {
          error: restoreError,
        } = await admin
          .from("family_users")
          .update({
            is_active: true,
          })
          .eq(
            "id",
            familyLinkA,
          );

        expect(
          restoreError,
        ).toBeNull();
      },
    );
  },
);