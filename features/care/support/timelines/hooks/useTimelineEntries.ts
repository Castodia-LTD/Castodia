"use client";

import { useEffect, useMemo, useState } from "react";

import { getDayRange, isSameDay } from "@/lib/shared/date";
import { supabase } from "@/lib/supabase";
import type { TimelineEntry } from "@/lib/care/timelines/types";

type UseTimelineEntriesArgs = {
  serviceUserId: string;
};

type TimelineEntryRow = {
  id: string;
  service_user_id: string;
  entry_type: string;
  content: string;
  event_time: string;
  created_at: string;
  created_by: string | null;
  reviewed: boolean | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

export function useTimelineEntries({
  serviceUserId,
}: UseTimelineEntriesArgs) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [activeFilter, setActiveFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const viewingToday = isSameDay(
    selectedDate,
    new Date(),
  );

  async function loadEntries() {
    if (!serviceUserId) {
      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);

    const { startOfDay, endOfDay } =
      getDayRange(selectedDate);

    const {
      data: timelineData,
      error: timelineError,
    } = await supabase
      .from("timeline_entries")
      .select(`
        id,
        service_user_id,
        entry_type,
        content,
        event_time,
        created_at,
        created_by,
        reviewed
      `)
      .eq("service_user_id", serviceUserId)
      .gte(
        "event_time",
        startOfDay.toISOString(),
      )
      .lte(
        "event_time",
        endOfDay.toISOString(),
      )
      .order("event_time", {
        ascending: false,
      });

    if (timelineError) {
      console.error(
        "Timeline entries load error:",
        {
          code: timelineError.code,
          message: timelineError.message,
          details: timelineError.details,
          hint: timelineError.hint,
        },
      );

      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    const timelineEntries =
      (timelineData ?? []) as TimelineEntryRow[];

    const authorIds = [
      ...new Set(
        timelineEntries
          .map((entry) => entry.created_by)
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              id.trim().length > 0,
          ),
      ),
    ];

    let staffNamesById: Record<string, string> = {};

    if (authorIds.length > 0) {
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", authorIds);

      if (profileError) {
        console.error(
          "Timeline author load error:",
          {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          },
        );
      } else {
        staffNamesById = Object.fromEntries(
          ((profileData ?? []) as ProfileRow[]).map(
            (profile) => [
              profile.id,
              profile.full_name ??
                "Unknown staff member",
            ],
          ),
        );
      }
    }

    const mappedEntries = timelineEntries.map(
      (entry) => ({
        ...entry,
        staff_name: entry.created_by
          ? staffNamesById[entry.created_by] ?? null
          : null,
      }),
    );

    setEntries(
      mappedEntries as TimelineEntry[],
    );

    setLoadingEntries(false);
  }

  useEffect(() => {
    void loadEntries();
  }, [serviceUserId, selectedDate]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === "All") {
      return entries;
    }

    return entries.filter(
      (entry) =>
        entry.entry_type === activeFilter,
    );
  }, [entries, activeFilter]);

  return {
    entries,
    filteredEntries,
    loadingEntries,

    selectedDate,
    setSelectedDate,

    activeFilter,
    setActiveFilter,

    filterOpen,
    setFilterOpen,

    viewingToday,

    loadEntries,
    reloadEntries: loadEntries,
  };
}