import { supabase } from "@/lib/supabase";

export type HandoverSummaryServiceUser = {
  id: string;
  full_name: string;
};

type GenerateHandoverSummaryInput = {
  serviceUsers: HandoverSummaryServiceUser[];
  serviceUserIds: string[];
  hoursBack: number;
};

function daysSince(dateString?: string | null) {
  if (!dateString) {
    return "No record";
  }

  const then = new Date(dateString);
  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - then.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diff === 0) {
    return "Today";
  }

  if (diff === 1) {
    return "Yesterday";
  }

  return `${diff} days ago`;
}

export async function generateHandoverSummary({
  serviceUsers,
  serviceUserIds,
  hoursBack,
}: GenerateHandoverSummaryInput): Promise<string> {
  if (serviceUserIds.length === 0) {
    return "";
  }

  const lines: string[] = [];

  const since = new Date();

  since.setHours(
    since.getHours() - hoursBack,
  );

  for (const serviceUserId of serviceUserIds) {
    const serviceUser = serviceUsers.find(
      (person) =>
        person.id === serviceUserId,
    );

    if (!serviceUser) {
      continue;
    }

    lines.push(serviceUser.full_name);

    const {
      data: recentTimeline,
      error: timelineError,
    } = await supabase
      .from("timeline_entries")
      .select(`
        entry_type,
        content,
        created_at,
        event_time
      `)
      .eq(
        "service_user_id",
        serviceUserId,
      )
      .gte(
        "created_at",
        since.toISOString(),
      )
      .order("created_at", {
        ascending: false,
      });

    if (timelineError) {
      throw new Error(
        timelineError.message,
      );
    }

    const sleepEntries =
      recentTimeline?.filter(
        (entry) =>
          entry.entry_type === "Sleep",
      ) ?? [];

    if (sleepEntries.length > 0) {
      lines.push("");
      lines.push("Sleep:");
      lines.push(
        `• ${sleepEntries.length} sleep observations recorded`,
      );
    }

    const {
      data: toileting,
      error: toiletingError,
    } = await supabase
      .from("toileting_records")
      .select("toileting_outcome")
      .eq(
        "service_user_id",
        serviceUserId,
      )
      .gte(
        "created_at",
        since.toISOString(),
      )
      .order("created_at", {
        ascending: false,
      });

    if (toiletingError) {
      throw new Error(
        toiletingError.message,
      );
    }

    const bowelMovements =
      toileting?.filter((record) =>
        [
          "Bowel movement",
          "Both",
        ].includes(
          record.toileting_outcome,
        ),
      ).length ?? 0;

    lines.push("");
    lines.push("Continence:");
    lines.push(
      `• ${bowelMovements} bowel movements recorded`,
    );

    const {
      data: personalCare,
      error: personalCareError,
    } = await supabase
      .from("personal_care_records")
      .select(`
        care_type,
        occurred_at
      `)
      .eq(
        "service_user_id",
        serviceUserId,
      )
      .order("occurred_at", {
        ascending: false,
      });

    if (personalCareError) {
      throw new Error(
        personalCareError.message,
      );
    }

    const lastWash = personalCare?.find(
      (row) =>
        [
          "Shower",
          "Bath",
          "Strip wash",
        ].includes(row.care_type),
    );

    const lastClothing =
      personalCare?.find(
        (row) =>
          row.care_type ===
          "Clothing changed",
      );

    lines.push("");
    lines.push("Personal Care:");

    lines.push(
      `• Last washed: ${daysSince(
        lastWash?.occurred_at,
      )}`,
    );

    lines.push(
      `• Last clothing change: ${daysSince(
        lastClothing?.occurred_at,
      )}`,
    );

    const incidentCount =
      recentTimeline?.filter(
        (entry) =>
          entry.entry_type ===
          "Incident",
      ).length ?? 0;

    if (incidentCount > 0) {
      lines.push("");
      lines.push("Incidents:");

      lines.push(
        `• ${incidentCount} incidents recorded`,
      );
    }

    /*
     * Surface meaningful recent timeline entries
     * so the handover reflects the same activity
     * visible elsewhere in Castodia.
     */
    const meaningfulEntries =
      recentTimeline
        ?.filter((entry) =>
          [
            "Activity",
            "Medication Refusal",
            "Behaviour Incident",
            "Fall",
            "Accident / Injury",
            "Health Appointment",
            "Wellbeing Observation",
            "General",
          ].includes(entry.entry_type),
        )
        .slice(0, 5) ?? [];

    if (meaningfulEntries.length > 0) {
      lines.push("");
      lines.push("Recent updates:");

      for (const entry of meaningfulEntries) {
        const cleanContent =
          entry.content
            ?.replace(/\s+/g, " ")
            .trim();

        if (!cleanContent) {
          continue;
        }

        lines.push(
          `• ${
            cleanContent.length > 220
              ? `${cleanContent
                  .slice(0, 217)
                  .trim()}...`
              : cleanContent
          }`,
        );
      }
    }

    lines.push("");
  }

  return lines
    .join("\n")
    .trim();
}