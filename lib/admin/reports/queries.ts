import { supabase } from "@/lib/supabase";

type LoadReportEntriesParams = {
  serviceUserId: string;
  entryType: string;
  dateFrom: string;
  dateTo: string;
};

export async function loadReportEntries({
  serviceUserId,
  entryType,
  dateFrom,
  dateTo,
}: LoadReportEntriesParams) {
  let query = supabase
    .from("timeline_entries")
    .select(`
      id,
      service_user_id,
      created_by,
      entry_type,
      content,
      created_at,
      event_time
    `)
    .order("event_time", { ascending: false });

  if (serviceUserId !== "all") {
    query = query.eq("service_user_id", serviceUserId);
  }

  if (entryType !== "all") {
    query = query.eq("entry_type", entryType);
  }

  if (dateFrom) {
    query = query.gte("event_time", `${dateFrom}T00:00:00`);
  }

  if (dateTo) {
    query = query.lte("event_time", `${dateTo}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}