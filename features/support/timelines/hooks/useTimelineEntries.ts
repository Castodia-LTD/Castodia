"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isSameDay, getDayRange } from "@/lib/shared/date";
import type { TimelineEntry } from "@/lib/timelines/types";

type UseTimelineEntriesArgs = {
  serviceUserId: string;
};

export function useTimelineEntries({ serviceUserId }: UseTimelineEntriesArgs) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const viewingToday = isSameDay(selectedDate, new Date());

  async function loadEntries() {
    if (!serviceUserId) {
      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);

    const { startOfDay, endOfDay } = getDayRange(selectedDate);

    const { data, error } = await supabase
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
      .gte("event_time", startOfDay.toISOString())
      .lte("event_time", endOfDay.toISOString())
      .order("event_time", { ascending: false });

    if (error) {
      console.error("Timeline entries load error:", error);
      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    setEntries((data || []) as TimelineEntry[]);
    setLoadingEntries(false);
  }

  useEffect(() => {
    loadEntries();
  }, [serviceUserId, selectedDate]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === "All") return entries;
    return entries.filter((entry) => entry.entry_type === activeFilter);
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