import {
  DEMO_GENERATION_WINDOW_DAYS,
  DEMO_ORGANISATION_ID,
  assertDemoOrganisation,
} from "./config";

import {
  cleanupDemoTimelineEntries,
} from "./cleanup";

import {
  generateDemoTimelineEntries,
} from "./timelineGenerator";

import {
  generateDemoHandover,
} from "./handoverGenerator";

import type {
  DemoEngineRunResult,
} from "./types";

export async function runDemoEngine(
  generationWindowDays =
    DEMO_GENERATION_WINDOW_DAYS,
): Promise<DemoEngineRunResult> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const startedAt =
    new Date().toISOString();

  const warnings: string[] = [];

  const cleanupResult =
    await cleanupDemoTimelineEntries();

  const timelineResult =
    await generateDemoTimelineEntries(
      generationWindowDays,
    );

  warnings.push(
    ...timelineResult.warnings,
  );

  const handoverResult =
    await generateDemoHandover(24);

  if (!handoverResult.created) {
    warnings.push(
      "A demo handover was not created because no usable summary content was available.",
    );
  }

  const completedAt =
    new Date().toISOString();

  return {
    runId: timelineResult.runId,

    startedAt,
    completedAt,

    serviceUsersProcessed:
      handoverResult.serviceUsersIncluded,

    timelineEntriesCreated:
      timelineResult.entriesCreated,

    timelineEntriesRemoved:
      cleanupResult.removed,

    handoversCreated:
      handoverResult.created
        ? 1
        : 0,

    warnings,
  };
}