import { createAdminClient } from "@/lib/supabase/admin";

import {
  DEMO_ORGANISATION_ID,
  assertDemoOrganisation,
} from "./config";

import { generateHandoverSummary } from "@/lib/care/handovers/generateSummary";

type DemoServiceUser = {
  id: string;
  full_name: string;
};

export type DemoHandoverResult = {
  handoverId: string | null;
  serviceUsersIncluded: number;
  created: boolean;
};

function getHandoverTitle() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Morning Handover";
  }

  if (hour < 18) {
    return "Afternoon Handover";
  }

  return "Evening Handover";
}

async function loadDemoServiceUsers(): Promise<
  DemoServiceUser[]
> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase = createAdminClient();

  const { data, error } =
    await supabase
      .from("service_users")
      .select(`
        id,
        full_name,
        organisation_id
      `)
      .eq(
        "organisation_id",
        DEMO_ORGANISATION_ID,
      )
      .eq("is_active", true)
      .order("full_name", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const rows = data ?? [];

  for (const row of rows) {
    if (
      row.organisation_id !==
      DEMO_ORGANISATION_ID
    ) {
      throw new Error(
        "Demo Engine safety lock: a service user outside the configured demo organisation was returned.",
      );
    }
  }

  return rows.map((row) => ({
    id: row.id as string,

    full_name:
      (row.full_name as string) ||
      "Unnamed service user",
  }));
}

async function getDemoCreatorId() {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase = createAdminClient();

  /*
   * Prefer a Support account because handovers
   * are operational records.
   */
  const {
    data: supportProfile,
    error: supportError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      organisation_id
    `)
    .eq(
      "organisation_id",
      DEMO_ORGANISATION_ID,
    )
    .eq("role", "support")
    .limit(1)
    .maybeSingle();

  if (supportError) {
    throw new Error(
      supportError.message,
    );
  }

  if (
    supportProfile?.id &&
    supportProfile.organisation_id ===
      DEMO_ORGANISATION_ID
  ) {
    return supportProfile.id as string;
  }

  /*
   * Fall back to a Manager account if the demo
   * organisation has no Support account.
   */
  const {
    data: managerProfile,
    error: managerError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      organisation_id
    `)
    .eq(
      "organisation_id",
      DEMO_ORGANISATION_ID,
    )
    .eq("role", "manager")
    .limit(1)
    .maybeSingle();

  if (managerError) {
    throw new Error(
      managerError.message,
    );
  }

  if (
    !managerProfile?.id ||
    managerProfile.organisation_id !==
      DEMO_ORGANISATION_ID
  ) {
    throw new Error(
      "No suitable demo staff account was found for handover creation.",
    );
  }

  return managerProfile.id as string;
}

export async function generateDemoHandover(
  hoursBack = 24,
): Promise<DemoHandoverResult> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase = createAdminClient();

  const serviceUsers =
    await loadDemoServiceUsers();

  if (
    serviceUsers.length === 0
  ) {
    return {
      handoverId: null,
      serviceUsersIncluded: 0,
      created: false,
    };
  }

  const serviceUserIds =
    serviceUsers.map(
      (serviceUser) =>
        serviceUser.id,
    );

  const summary =
    await generateHandoverSummary({
      serviceUsers,
      serviceUserIds,
      hoursBack,
    });

  if (!summary.trim()) {
    return {
      handoverId: null,
      serviceUsersIncluded:
        serviceUsers.length,
      created: false,
    };
  }

  const createdBy =
    await getDemoCreatorId();

  const {
    data: handover,
    error: handoverError,
  } = await supabase
    .from("handovers")
    .insert({
      title:
        getHandoverTitle(),

      content:
        summary,

      created_by:
        createdBy,

      active:
        true,
    })
    .select("id")
    .single();

  if (handoverError) {
    throw new Error(
      handoverError.message,
    );
  }

  const links =
    serviceUserIds.map(
      (serviceUserId) => ({
        handover_id:
          handover.id,

        service_user_id:
          serviceUserId,
      }),
    );

  const {
    error: linkError,
  } = await supabase
    .from(
      "handover_service_users",
    )
    .insert(links);

  if (linkError) {
    /*
     * Avoid leaving an orphan handover if the
     * service-user links fail.
     */
    await supabase
      .from("handovers")
      .delete()
      .eq(
        "id",
        handover.id,
      );

    throw new Error(
      linkError.message,
    );
  }

  return {
    handoverId:
      handover.id,

    serviceUsersIncluded:
      serviceUsers.length,

    created:
      true,
  };
}