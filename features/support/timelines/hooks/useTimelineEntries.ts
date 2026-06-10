"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type TimelineEntry = {
  id: string;
  service_user_id: string;
  entry_type: string;
  content: string;
  event_time: string;
  created_at: string;
  created_by: string | null;
  reviewed?: boolean | null;
};

export function useTimelineEntries(serviceUserId: string) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  async function loadEntries() {
    if (!serviceUserId) {
      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: entriesData, error } = await supabase
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

    setEntries((entriesData || []) as TimelineEntry[]);
    setLoadingEntries(false);
  }

  useEffect(() => {
    loadEntries();
  }, [serviceUserId]);

  return {
    entries,
    loadingEntries,
    reloadEntries: loadEntries,
  };
}