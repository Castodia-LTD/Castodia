"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, RefreshCw, X } from "lucide-react";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";

type Request = { id: string; staff_id: string; status: string; kind: "regular" | "exception"; summary: string; detail: string; created_at: string };
type Staff = { id: string; full_name: string | null };
export default function AvailabilityReviewPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [org, setOrg] = useState("");
  const [actor, setActor] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in required.");
      const { data: profile, error: pError } = await supabase.from("profiles").select("organisation_id").eq("id", auth.user.id).single();
      if (pError || !profile?.organisation_id) throw new Error("Organisation not found.");
      const organisationId = profile.organisation_id;
      const [people, regular, changes] = await Promise.all([
        supabase.from("profiles").select("id,full_name").eq("organisation_id", organisationId),
        supabase.from("staff_recurring_availability").select("id,staff_id,status,weekday,start_time,end_time,valid_from,valid_until,created_at").eq("organisation_id", organisationId).eq("status", "proposed"),
        supabase.from("staff_availability_exceptions").select("id,staff_id,status,exception_date,start_time,end_time,available,reason,created_at").eq("organisation_id", organisationId).eq("status", "proposed"),
      ]);
      const failed = [people, regular, changes].find(x => x.error);
      if (failed?.error) throw failed.error;
      setOrg(organisationId); setActor(auth.user.id);
      setStaff((people.data ?? []) as Staff[]);
      const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
      setRequests([
        ...(regular.data ?? []).map(r => ({
          id:r.id,staff_id:r.staff_id,status:r.status,kind:"regular" as const,
          summary:`${days[r.weekday - 1]} · ${r.start_time.slice(0,5)}–${r.end_time.slice(0,5)}`,
          detail:`Effective ${r.valid_from}${r.valid_until ? ` to ${r.valid_until}` : " onwards"}`,created_at:r.created_at,
        })),
        ...(changes.data ?? []).map(r => ({
          id:r.id,staff_id:r.staff_id,status:r.status,kind:"exception" as const,
          summary:`${r.exception_date} · ${r.available ? "Additional availability" : "Unavailable"}`,
          detail:`${r.start_time ? `${r.start_time.slice(0,5)}–${r.end_time?.slice(0,5)}` : "All day"}${r.reason ? ` · ${r.reason}` : ""}`,created_at:r.created_at,
        })),
      ].sort((a,b) => a.created_at.localeCompare(b.created_at)));
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to load requests."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const names = useMemo(() => new Map(staff.map(s => [s.id,s.full_name ?? "Unnamed staff member"])), [staff]);
  async function review(item: Request, status: "approved" | "rejected") {
    if (!actor || !org) return;
    setBusy(item.id); setError(""); setNotice("");
    try {
      const table = item.kind === "regular" ? "staff_recurring_availability" : "staff_availability_exceptions";
      const { data, error: updateError } = await supabase.from(table)
        .update({ status, reviewed_by: actor, reviewed_at: new Date().toISOString() })
        .eq("id", item.id).eq("organisation_id", org).eq("status", "proposed")
        .select("id");
      if (updateError) throw updateError;
      if (!data?.length) throw new Error("Request was already reviewed or is no longer available.");
      setNotice(status === "approved" ? "Availability approved. Check affected assigned shifts separately." : "Availability request declined.");
      await load();
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to review request."); }
    finally { setBusy(""); }
  }
  return <CastodiaPageShell title="Availability requests" description="Review staff-submitted weekly hours and one-off changes. Approvals update availability records, never published assignments." maxWidth="wide">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/care/manager/rota/domiciliary" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-800 hover:underline"><ChevronLeft className="h-4 w-4" /> Scheduling workspace</Link><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
    {error && <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    {notice && <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
    <CastodiaCard className="p-6"><h2 className="text-lg font-semibold text-slate-900">Awaiting manager review <span className="ml-2 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800">{requests.length}</span></h2>
      <p className="mt-1 text-sm text-slate-500">Check contracted hours, existing shifts, leave and service requirements before approving.</p>
      <div className="mt-5 divide-y divide-slate-100">{loading ? <p className="py-10 text-center text-sm text-slate-500">Loading staff requests…</p> : requests.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No outstanding availability requests.</p> : requests.map(item => <div key={item.kind + item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div><p className="font-semibold text-slate-900">{names.get(item.staff_id) ?? "Staff member"}</p><p className="mt-1 text-sm text-slate-700">{item.summary}</p><p className="mt-1 text-xs text-slate-500">{item.detail} · {item.kind === "regular" ? "Regular availability" : "One-off change"}</p></div>
        <div className="flex gap-2"><button type="button" disabled={Boolean(busy)} onClick={() => void review(item,"rejected")} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><X className="h-4 w-4" /> Decline</button><button type="button" disabled={Boolean(busy)} onClick={() => void review(item,"approved")} className="inline-flex items-center gap-1 rounded-xl bg-cyan-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button></div>
      </div>)}</div>
    </CastodiaCard>
  </CastodiaPageShell>;
}
