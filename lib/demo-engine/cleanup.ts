import { createAdminClient } from "@/lib/supabase/admin";

import {
  DEMO_GENERATED_FLAG,
  DEMO_ORGANISATION_ID,
  DEMO_TIMELINE_RETENTION_DAYS,
  assertDemoOrganisation,
} from "./config";

type CleanupResult = {
  removed: number;
};

function getCutoffIso() {
  const cutoff = new Date();

  cutoff.setDate(
    cutoff.getDate() -
      DEMO_TIMELINE_RETENTION_DAYS,
  );

  cutoff.setHours(0, 0, 0, 0);

  return cutoff.toISOString();
}

export async function cleanupDemoTimelineEntries(): Promise<CleanupResult> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase = createAdminClient();

  const cutoffIso =
    getCutoffIso();

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
    data: candidateData,
    error: candidateError,
  } = await supabase
    .from("timeline_entries")
    .select(`
      id,
      service_user_id,
      event_time,
      metadata
    `)
    .in(
      "service_user_id",
      serviceUserIds,
    )
    .lt(
      "event_time",
      cutoffIso,
    )
    .eq(
      `metadata->>${DEMO_GENERATED_FLAG}`,
      "true",
    );

  if (candidateError) {
    throw new Error(
      candidateError.message,
    );
  }

  const candidates =
    candidateData ?? [];

  if (
    candidates.length === 0
  ) {
    return {
      removed: 0,
    };
  }

  const safeCandidateIds =
    candidates
      .filter((entry) =>
        serviceUserIds.includes(
          entry.service_user_id as string,
        ),
      )
      .map(
        (entry) =>
          entry.id as string,
      );

  if (
    safeCandidateIds.length !==
    candidates.length
  ) {
    throw new Error(
      "Demo Engine safety lock: cleanup encountered a timeline entry outside the configured demo organisation.",
    );
  }

  const {
    data: deletedRows,
    error: deleteError,
  } = await supabase
    .from("timeline_entries")
    .delete()
    .in(
      "id",
      safeCandidateIds,
    )
    .select("id");

  if (deleteError) {
    throw new Error(
      deleteError.message,
    );
  }

  return {
    removed:
      deletedRows?.length ??
      safeCandidateIds.length,
  };
}