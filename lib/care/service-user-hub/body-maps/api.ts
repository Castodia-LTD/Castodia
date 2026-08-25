import { supabase } from "@/lib/supabase";

import type { TimelineEntry } from "@/lib/care/timelines/types";

export type BodyMapDateRange = {
  fromDate: string;
  toDate: string;
};

type RawTimelineEntry = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  metadata: unknown;
  event_time: string;
  created_at: string;
  reviewed: boolean | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
};

type ProfileNameRow = {
  id: string;
  full_name: string | null;
};

function requiredText(value: string, fieldName: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanValue;
}

function validateDate(value: string, fieldName: string) {
  const cleanValue = requiredText(value, fieldName);

  const parsedDate = new Date(`${cleanValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return cleanValue;
}

function startOfDateIso(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function endOfDateIso(value: string) {
  return new Date(`${value}T23:59:59.999`).toISOString();
}

export function getDefaultBodyMapDateRange(): BodyMapDateRange {
  const today = new Date();

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  return {
    fromDate: toDateInputValue(thirtyDaysAgo),
    toDate: toDateInputValue(today),
  };
}

export function getBodyMapQuickDateRange(
  range:
    | "7-days"
    | "30-days"
    | "3-months"
    | "6-months"
    | "12-months",
): BodyMapDateRange {
  const today = new Date();
  const fromDate = new Date(today);

  switch (range) {
    case "7-days":
      fromDate.setDate(today.getDate() - 6);
      break;

    case "30-days":
      fromDate.setDate(today.getDate() - 29);
      break;

    case "3-months":
      fromDate.setMonth(today.getMonth() - 3);
      break;

    case "6-months":
      fromDate.setMonth(today.getMonth() - 6);
      break;

    case "12-months":
      fromDate.setFullYear(today.getFullYear() - 1);
      break;
  }

  return {
    fromDate: toDateInputValue(fromDate),
    toDate: toDateInputValue(today),
  };
}

export async function getBodyMapTimelineEntries(
  serviceUserId: string,
  dateRange: BodyMapDateRange,
  searchText = "",
): Promise<TimelineEntry[]> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const fromDate = validateDate(
    dateRange.fromDate,
    "From date",
  );

  const toDate = validateDate(
    dateRange.toDate,
    "To date",
  );

  if (fromDate > toDate) {
    throw new Error(
      "The from date cannot be later than the to date.",
    );
  }

  let query = supabase
    .from("timeline_entries")
    .select(`
      id,
      service_user_id,
      created_by,
      entry_type,
      content,
      metadata,
      event_time,
      created_at,
      reviewed,
      reviewed_by,
      reviewed_at,
      review_comment
    `)
    .eq("service_user_id", cleanServiceUserId)
    .eq("entry_type", "Body Map")
    .gte("event_time", startOfDateIso(fromDate))
    .lte("event_time", endOfDateIso(toDate))
    .order("event_time", { ascending: false });

  const cleanSearchText = searchText.trim();

  if (cleanSearchText) {
    query = query.ilike(
      "content",
      `%${cleanSearchText}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const entries = (data ?? []) as RawTimelineEntry[];

  if (entries.length === 0) {
    return [];
  }

  const staffIds = Array.from(
    new Set(
      entries
        .map((entry) => entry.created_by)
        .filter(Boolean),
    ),
  );

  const { data: profileData, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", staffIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const staffNames = new Map(
    ((profileData ?? []) as ProfileNameRow[]).map(
      (profile) => [
        profile.id,
        profile.full_name ?? null,
      ],
    ),
  );

  return entries.map(
    (entry) =>
      ({
        ...entry,
        staff_name:
          staffNames.get(entry.created_by) ?? null,
      }) as TimelineEntry,
  );
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}