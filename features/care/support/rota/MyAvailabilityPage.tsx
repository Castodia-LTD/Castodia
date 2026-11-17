"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, ChevronLeft, Clock3, Plus, Trash2 } from "lucide-react";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";

type Recurring = { id: string; weekday: number; start_time: string; end_time: string; valid_from: string; valid_until: string | null; status: string };
type Exception = { id: string; exception_date: string; start_time: string | null; end_time: string | null; available: boolean; reason: string | null; status: string };
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const field = "mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none";
const statusStyle: Record<string, string> = { approved: "bg-emerald-50 text-emerald-800", proposed: "bg-amber-50 text-amber-800", rejected: "bg-slate-100 text-slate-600" };
function Status({ value }: { value: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[value] ?? statusStyle.rejected}`}>{value === "proposed" ? "Awaiting review" : value}</span>;
}
export default function MyAvailabilityPage() {
  const [identity, setIdentity] = useState<{ id: string; organisationId: string } | null>(null);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("18:00");
  const [validFrom, setValidFrom] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [validUntil, setValidUntil] = useState("");
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionType, setExceptionType] = useState<"available" | "unavailable">("unavailable");
  const [allDay, setAllDay] = useState(true);
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("17:00");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (staffId: string) => {
    const [a, b] = await Promise.all([
      supabase.from("staff_recurring_availability").select("id,weekday,start_time,end_time,valid_from,valid_until,status").eq("staff_id", staffId).order("weekday"),
      supabase.from("staff_availability_exceptions").select("id,exception_date,start_time,end_time,available,reason,status").eq("staff_id", staffId).order("exception_date", { ascending: false }),
    ]);
    if (a.error || b.error) throw a.error ?? b.error;
    setRecurring((a.data ?? []) as Recurring[]);
    setExceptions((b.data ?? []) as Exception[]);
  }, []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth.user) throw new Error("Please sign in to manage availability.");
        const { data: profile, error: profileError } = await supabase.from("profiles").select("organisation_id").eq("id", auth.user.id).single();
        if (profileError || !profile?.organisation_id) throw new Error("Organisation not found.");
        if (!mounted) return;
        setIdentity({ id: auth.user.id, organisationId: profile.organisation_id });
        await refresh(auth.user.id);
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : "Unable to load availability."); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [refresh]);

  async function submitRecurring(event: React.FormEvent) {
    event.preventDefault();
    if (!identity) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (start >= end || (validUntil && validUntil < validFrom)) throw new Error("Check the time and date range.");
      const { error: insertError } = await supabase.from("staff_recurring_availability").insert({
        organisation_id: identity.organisationId, staff_id: identity.id,
        weekday, start_time: start, end_time: end, valid_from: validFrom,
        valid_until: validUntil || null, status: "proposed",
      });
      if (insertError) throw insertError;
      await refresh(identity.id);
      setNotice("Your weekly availability has been submitted for manager review.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit availability."); }
    finally { setBusy(false); }
  }
  async function submitException(event: React.FormEvent) {
    event.preventDefault();
    if (!identity) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (!exceptionDate || (!allDay && exceptionStart >= exceptionEnd)) throw new Error("Enter a valid date and time.");
      const { error: insertError } = await supabase.from("staff_availability_exceptions").insert({
        organisation_id: identity.organisationId, staff_id: identity.id,
        exception_date: exceptionDate, available: exceptionType === "available",
        start_time: allDay ? null : exceptionStart, end_time: allDay ? null : exceptionEnd,
        reason: reason.trim() || null, status: "proposed",
      });
      if (insertError) throw insertError;
      await refresh(identity.id);
      setExceptionDate(""); setReason("");
      setNotice("Your change has been submitted. Existing assigned shifts remain in place until a manager confirms any rota change.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit change."); }
    finally { setBusy(false); }
  }
  async function withdraw(table: "staff_recurring_availability" | "staff_availability_exceptions", id: string) {
    if (!identity) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: deleteError } = await supabase.from(table).delete().eq("id", id).eq("staff_id", identity.id).eq("status", "proposed");
      if (deleteError) throw deleteError;
      await refresh(identity.id);
      setNotice("Pending request withdrawn.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to withdraw request."); }
    finally { setBusy(false); }
  }
  return <CastodiaPageShell title="My availability" description="Tell your manager when you can work. Keep regular availability separate from one-off changes, without changing your published rota." maxWidth="wide">
    <Link href="/care/support/rota" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800 hover:underline"><ChevronLeft className="h-4 w-4" /> Back to my rota</Link>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
    <div className="grid gap-5 lg:grid-cols-2">
      <CastodiaCard className="p-6">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2.5"><CalendarClock className="h-5 w-5 text-cyan-800" /></div><div><h2 className="text-lg font-semibold text-slate-900">My regular availability</h2><p className="text-sm text-slate-500">The days and times you usually can work</p></div></div>
        <form onSubmit={submitRecurring} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Day of the week<select className={field} value={weekday} onChange={e => setWeekday(Number(e.target.value))}>{weekdays.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700">From<input type="time" required className={field} value={start} onChange={e => setStart(e.target.value)} /></label><label className="text-sm font-medium text-slate-700">Until<input type="time" required className={field} value={end} onChange={e => setEnd(e.target.value)} /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700">Effective from<input type="date" required className={field} value={validFrom} onChange={e => setValidFrom(e.target.value)} /></label><label className="text-sm font-medium text-slate-700">Effective until (optional)<input type="date" className={field} value={validUntil} onChange={e => setValidUntil(e.target.value)} /></label></div>
          <button disabled={busy || !identity} className="inline-flex items-center gap-2 rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-900 disabled:opacity-50"><Plus className="h-4 w-4" /> Submit regular hours</button>
        </form>
        <div className="mt-6 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold text-slate-900">Your recorded weekly hours</h3>{loading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : recurring.length === 0 ? <p className="mt-3 text-sm text-slate-500">No regular availability recorded yet.</p> : <ul className="mt-3 space-y-2">{recurring.map(item => <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-semibold text-slate-800">{weekdays[item.weekday - 1]} · {item.start_time.slice(0,5)}–{item.end_time.slice(0,5)}</p><p className="mt-1 text-xs text-slate-500">From {item.valid_from}{item.valid_until ? ` until ${item.valid_until}` : ""}</p></div><div className="flex items-center gap-2"><Status value={item.status} />{item.status === "proposed" && <button type="button" disabled={busy} aria-label="Withdraw pending weekly hours" onClick={() => void withdraw("staff_recurring_availability", item.id)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>}</div></li>)}</ul>}</div>
      </CastodiaCard>
      <CastodiaCard className="p-6">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2.5"><Clock3 className="h-5 w-5 text-cyan-800" /></div><div><h2 className="text-lg font-semibold text-slate-900">One-off changes</h2><p className="text-sm text-slate-500">A day off, extra availability or a temporary restriction</p></div></div>
        <form onSubmit={submitException} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Date<input type="date" required className={field} value={exceptionDate} onChange={e => setExceptionDate(e.target.value)} /></label>
          <label className="block text-sm font-medium text-slate-700">Change<select className={field} value={exceptionType} onChange={e => setExceptionType(e.target.value as "available" | "unavailable")}><option value="unavailable">I am unavailable</option><option value="available">I can work extra hours</option></select></label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} /> All day</label>
          {!allDay && <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700">From<input type="time" className={field} value={exceptionStart} onChange={e => setExceptionStart(e.target.value)} /></label><label className="text-sm font-medium text-slate-700">Until<input type="time" className={field} value={exceptionEnd} onChange={e => setExceptionEnd(e.target.value)} /></label></div>}
          <label className="block text-sm font-medium text-slate-700">Note (optional)<textarea rows={2} maxLength={500} className={field} value={reason} onChange={e => setReason(e.target.value)} placeholder="Anything your manager should know" /></label>
          <button disabled={busy || !identity} className="inline-flex items-center gap-2 rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-900 disabled:opacity-50"><Plus className="h-4 w-4" /> Submit change</button>
        </form>
        <div className="mt-6 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold text-slate-900">Your requests</h3>{loading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : exceptions.length === 0 ? <p className="mt-3 text-sm text-slate-500">No changes recorded yet.</p> : <ul className="mt-3 space-y-2">{exceptions.map(item => <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-semibold text-slate-800">{item.exception_date} · {item.available ? "Extra availability" : "Unavailable"}</p><p className="mt-1 text-xs text-slate-500">{item.start_time ? `${item.start_time.slice(0,5)}–${item.end_time?.slice(0,5)}` : "All day"}{item.reason ? ` · ${item.reason}` : ""}</p></div><div className="flex items-center gap-2"><Status value={item.status} />{item.status === "proposed" && <button type="button" disabled={busy} aria-label="Withdraw pending change" onClick={() => void withdraw("staff_availability_exceptions", item.id)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>}</div></li>)}</ul>}</div>
      </CastodiaCard>
    </div>
    <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>Availability requests are reviewed by your manager. They do not cancel contracted shifts, replace annual-leave requests or automatically change an already published rota. If you cannot attend an assigned shift, contact your manager directly.</p></div>
  </CastodiaPageShell>;
}
