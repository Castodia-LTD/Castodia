import { createAdminClient } from "@/lib/supabase/admin";

import {
  DEMO_GENERATED_FLAG,
  DEMO_ORGANISATION_ID,
  assertDemoOrganisation,
} from "./config";

type CleanupResult = {
  removed: number;
};

export async function cleanupDemoTimelineEntries(): Promise<CleanupResult> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase = createAdminClient();

  const {
    data: serviceUserData,
    error: serviceUserError,
  } = await supabase
    .from("service_users")
    .select(`
      id,
      organisation_id
    `)
    .eq(
      "organisation_id",
      DEMO_ORGANISATION_ID,
    );

  if (serviceUserError) {
    throw new Error(
      serviceUserError.message,
    );
  }

  const serviceUserIds = (
    serviceUserData ?? []
  )
    .filter(
      (serviceUser) =>
        serviceUser.organisation_id ===
        DEMO_ORGANISATION_ID,
    )
    .map(
      (serviceUser) =>
        serviceUser.id as string,
    );

  if (
    serviceUserIds.length === 0
  ) {
    return {
      removed: 0,
    };
  }

  const {
    data: deletedRows,
    error: deleteError,
  } = await supabase
    .from("timeline_entries")
    .delete()
    .in(
      "service_user_id",
      serviceUserIds,
    )
    .eq(
      `metadata->>${DEMO_GENERATED_FLAG}`,
      "true",
    )
    .select("id");

  if (deleteError) {
    throw new Error(
      deleteError.message,
    );
  }

  return {
    removed:
      deletedRows?.length ?? 0,
  };
}