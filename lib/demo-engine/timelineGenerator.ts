import { createAdminClient } from "@/lib/supabase/admin";

import {
  DEMO_ENGINE_VERSION,
  DEMO_ORGANISATION_ID,
  assertDemoOrganisation,
} from "./config";

import {
  getEligibleScenarios,
} from "./scenarios";

import type {
  DemoScenario,
  DemoScenarioContext,
  DemoServiceUser,
  DemoTimeWindow,
  DemoTimelineEntryInsert,
} from "./types";

type GenerateTimelineResult = {
  runId: string;
  entriesCreated: number;
  warnings: string[];
};

function getFullName(
  serviceUser: DemoServiceUser,
) {
  const name = `${serviceUser.first_name ?? ""} ${
    serviceUser.surname ?? ""
  }`.trim();

  return name || "Service user";
}

function getFirstName(
  serviceUser: DemoServiceUser,
) {
  return (
    serviceUser.first_name?.trim() ||
    getFullName(serviceUser)
  );
}

function randomBetween(
  min: number,
  max: number,
) {
  return Math.floor(
    Math.random() * (max - min + 1),
  ) + min;
}

function chooseWeightedScenario(
  scenarios: DemoScenario[],
): DemoScenario | null {
  const eligible = scenarios.filter(
    (scenario) => {
      if (
        typeof scenario.probability === "number" &&
        Math.random() > scenario.probability
      ) {
        return false;
      }

      return scenario.weight > 0;
    },
  );

  if (eligible.length === 0) {
    return null;
  }

  const totalWeight = eligible.reduce(
    (total, scenario) =>
      total + scenario.weight,
    0,
  );

  let cursor =
    Math.random() * totalWeight;

  for (const scenario of eligible) {
    cursor -= scenario.weight;

    if (cursor <= 0) {
      return scenario;
    }
  }

  return eligible[
    eligible.length - 1
  ] ?? null;
}

function createRandomEventTime(
  day: Date,
  window: DemoTimeWindow,
) {
  let startHour = 8;
  let endHour = 20;

  switch (window) {
    case "overnight":
      startHour = 0;
      endHour = 5;
      break;

    case "morning":
      startHour = 6;
      endHour = 11;
      break;

    case "afternoon":
      startHour = 12;
      endHour = 16;
      break;

    case "evening":
      startHour = 17;
      endHour = 22;
      break;

    case "any":
      startHour = 6;
      endHour = 22;
      break;
  }

  const eventTime =
    new Date(day);

  eventTime.setHours(
    randomBetween(
      startHour,
      endHour,
    ),
    randomBetween(
      0,
      59,
    ),
    randomBetween(
      0,
      59,
    ),
    0,
  );

  return eventTime;
}

function buildScenarioEntry(
  serviceUser: DemoServiceUser,
  scenario: DemoScenario,
  eventTime: Date,
  staffUserId: string,
  runId: string,
): DemoTimelineEntryInsert {
  const context:
    DemoScenarioContext = {
      serviceUserId:
        serviceUser.id,

      firstName:
        getFirstName(
          serviceUser,
        ),

      fullName:
        getFullName(
          serviceUser,
        ),

      eventTime,
    };

  return {
    service_user_id:
      serviceUser.id,

    created_by:
      staffUserId,

    entry_type:
      scenario.entryType,

    content:
      scenario.generateContent(
        context,
      ),

    event_time:
      eventTime.toISOString(),

    metadata: {
      demo_generated: true,

      demo_engine_version:
        DEMO_ENGINE_VERSION,

      demo_scenario:
        scenario.id,

      demo_tone:
        scenario.tone,

      demo_category:
        scenario.category,

      demo_run_id:
        runId,

      generated_at:
        new Date().toISOString(),
    },
  };
}

async function loadDemoServiceUsers() {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("service_users")
    .select(`
      id,
      first_name,
      surname,
      organisation_id,
      is_active
    `)
    .eq(
      "organisation_id",
      DEMO_ORGANISATION_ID,
    )
    .eq(
      "is_active",
      true,
    )
    .order(
      "first_name",
      {
        ascending: true,
      },
    )
    .order(
      "surname",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const serviceUsers = (data ?? []) as DemoServiceUser[];

  for (
    const serviceUser
    of serviceUsers
  ) {
    if (
      serviceUser.organisation_id !==
      DEMO_ORGANISATION_ID
    ) {
      throw new Error(
        "Demo Engine safety lock: a service user outside the configured demo organisation was returned.",
      );
    }
  }

  return serviceUsers;
}

async function loadDemoStaffUserIds() {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      organisation_id
    `)
    .eq(
      "organisation_id",
      DEMO_ORGANISATION_ID,
    )
    .in(
      "role",
      [
        "support",
        "manager",
      ],
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const rows =
    data ?? [];

  for (
    const row
    of rows
  ) {
    if (
      row.organisation_id !==
      DEMO_ORGANISATION_ID
    ) {
      throw new Error(
        "Demo Engine safety lock: a staff profile outside the configured demo organisation was returned.",
      );
    }
  }

  return rows
    .map(
      (profile) =>
        profile.id as string,
    )
    .filter(Boolean);
}

function chooseStaffUserId(
  staffUserIds: string[],
) {
  if (
    staffUserIds.length === 0
  ) {
    throw new Error(
      "No demo staff accounts are available to create timeline entries.",
    );
  }

  return staffUserIds[
    randomBetween(
      0,
      staffUserIds.length - 1,
    )
  ];
}

function getGenerationDays(
  generationWindowDays: number,
) {
  const days: Date[] = [];

  const today =
    new Date();

  for (
    let index =
      generationWindowDays - 1;
    index >= 0;
    index -= 1
  ) {
    const date =
      new Date(today);

    date.setDate(
      today.getDate() -
        index,
    );

    date.setHours(
      0,
      0,
      0,
      0,
    );

    days.push(date);
  }

  return days;
}

function getEntriesPerDay() {
  return randomBetween(
    30,
    40,
  );
}

function chooseTimeWindow():
  DemoTimeWindow {
  const roll =
    Math.random();

  if (
    roll < 0.08
  ) {
    return "overnight";
  }

  if (
    roll < 0.38
  ) {
    return "morning";
  }

  if (
    roll < 0.72
  ) {
    return "afternoon";
  }

  return "evening";
}

function createEntriesForDay(
  serviceUser: DemoServiceUser,
  day: Date,
  staffUserIds: string[],
  runId: string,
) {
  const entries:
    DemoTimelineEntryInsert[] = [];

  const usedEventTimes =
    new Set<number>();

  const targetCount =
    getEntriesPerDay();

  let attempts = 0;

  const maxAttempts =
    targetCount * 10;

  while (
    entries.length <
      targetCount &&
    attempts <
      maxAttempts
  ) {
    attempts += 1;

    const window =
      chooseTimeWindow();

    const eligible =
      getEligibleScenarios(
        window,
      );

    const scenario =
      chooseWeightedScenario(
        eligible,
      );

    if (!scenario) {
      continue;
    }

    let eventTime =
      createRandomEventTime(
        day,
        scenario.timeWindow ??
          window,
      );

    let timeCollisionAttempts =
      0;

    while (
      usedEventTimes.has(
        eventTime.getTime(),
      ) &&
      timeCollisionAttempts <
        10
    ) {
      eventTime =
        createRandomEventTime(
          day,
          scenario.timeWindow ??
            window,
        );

      timeCollisionAttempts += 1;
    }

    if (
      usedEventTimes.has(
        eventTime.getTime(),
      )
    ) {
      continue;
    }

    if (
      eventTime.getTime() >
      Date.now()
    ) {
      continue;
    }

    const staffUserId =
      chooseStaffUserId(
        staffUserIds,
      );

    entries.push(
      buildScenarioEntry(
        serviceUser,
        scenario,
        eventTime,
        staffUserId,
        runId,
      ),
    );

    usedEventTimes.add(
      eventTime.getTime(),
    );
  }

  entries.sort(
    (a, b) =>
      new Date(
        a.event_time,
      ).getTime() -
      new Date(
        b.event_time,
      ).getTime(),
  );

  return entries;
}

export async function generateDemoTimelineEntries(
  generationWindowDays: number,
): Promise<GenerateTimelineResult> {
  assertDemoOrganisation(
    DEMO_ORGANISATION_ID,
  );

  const runId =
    crypto.randomUUID();

  const warnings: string[] =
    [];

  const [
    serviceUsers,
    staffUserIds,
  ] =
    await Promise.all([
      loadDemoServiceUsers(),
      loadDemoStaffUserIds(),
    ]);

  if (
    serviceUsers.length === 0
  ) {
    throw new Error(
      "No active service users exist in the configured demo organisation.",
    );
  }

  if (
    staffUserIds.length === 0
  ) {
    throw new Error(
      "No staff profiles exist in the configured demo organisation.",
    );
  }

  const days =
  getGenerationDays(
    generationWindowDays,
  );

  const rows:
    DemoTimelineEntryInsert[] = [];

  for (
    const serviceUser
    of serviceUsers
  ) {
    if (
      serviceUser.organisation_id !==
      DEMO_ORGANISATION_ID
    ) {
      throw new Error(
        "Demo Engine safety lock: a service user outside the configured demo organisation was returned.",
      );
    }

    for (
      const day
      of days
    ) {
      const dayEntries =
        createEntriesForDay(
          serviceUser,
          day,
          staffUserIds,
          runId,
        );

      rows.push(
        ...dayEntries,
      );

      if (
        dayEntries.length <
        30
      ) {
        warnings.push(
          `Only ${dayEntries.length} timeline entries were generated for ${getFullName(
            serviceUser,
          )} on ${day.toISOString().slice(
            0,
            10,
          )}.`,
        );
      }
    }
  }

  if (
    rows.length === 0
  ) {
    warnings.push(
      "No timeline entries were generated.",
    );

    return {
      runId,
      entriesCreated: 0,
      warnings,
    };
  }

  rows.sort(
    (a, b) =>
      new Date(
        a.event_time,
      ).getTime() -
      new Date(
        b.event_time,
      ).getTime(),
  );

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "timeline_entries",
    )
    .insert(rows)
    .select("id");

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return {
    runId,

    entriesCreated:
      data?.length ??
      rows.length,

    warnings,
  };
}