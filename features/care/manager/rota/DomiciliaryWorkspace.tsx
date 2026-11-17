"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Clock3, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { expandVisits, type VisitTemplate } from "@/features/care/shared/rota/visitRecurrence";

type Person = { id: string; full_name: string; house_name: string | null };
type Requirement = {
  id: string; service_user_id: string; title: string; activity_code: string;
  required_staff: number; duration_minutes: number; weekdays: number[];
  valid_from: string; valid_until: string | null; earliest_start: string | null;
  verified_at: string | null; all_staff_competencies: string[]; team_competencies: string[];
};
type Staff = { id: string; full_name: string | null; is_active: boolean | null };
type Training = { staff_id: string; course_name: string; expiry_date: string | null };
type Competency = { staff_id: string; competency_type: string; review_date: string | null; outcome: string | null; assessor_signed: boolean | null };
type ExistingShift = { id: string; service_user_id: string; shift_date: string; start_time: string; end_time: string; status: string };
type Snapshot = {
  people: Person[]; requirements: Requirement[]; staff: Staff[];
  training: Training[]; competencies: Competency[]; shifts: ExistingShift[];
};
const empty: Snapshot = { people: [], requirements: [], staff: [], training: [], competencies: [], shifts: [] };
function localDate(offset = 0) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function labelTime(value: string) { return value.slice(0, 5); }
const tile = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function DomiciliaryWorkspace() {
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [date, setDate] = useState(() => localDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "needs_attention" | "ready">("needs_attention");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sign in to view the scheduling workspace.");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("organisation_id").eq("id", auth.user.id).single();
      if (profileError || !profile?.organisation_id) throw new Error("Your organisation could not be verified.");
      const org = profile.organisation_id;
      const [people, requirements, staff, training, competencies, shifts] = await Promise.all([
        supabase.from("service_users").select("id,full_name,house_name").eq("organisation_id", org).eq("care_model", "domiciliary").eq("is_active", true).order("full_name"),
        supabase.from("domiciliary_activity_requirements").select("id,service_user_id,title,activity_code,required_staff,duration_minutes,weekdays,valid_from,valid_until,earliest_start,verified_at,all_staff_competencies,team_competencies").eq("organisation_id", org),
        supabase.from("profiles").select("id,full_name,is_active").eq("organisation_id", org).in("role", ["support", "manager"]),
        supabase.from("staff_training_records").select("staff_id,course_name,expiry_date").eq("organisation_id", org),
        supabase.from("staff_competencies").select("staff_id,competency_type,review_date,outcome,assessor_signed").eq("organisation_id", org),
        supabase.from("rota_shifts").select("id,service_user_id,shift_date,start_time,end_time,status").eq("organisation_id", org).gte("shift_date", localDate(-1)).lte("shift_date", localDate(8)),
      ]);
      const results = [people, requirements, staff, training, competencies, shifts];
      const failure = results.find(result => result.error);
      if (failure?.error) throw failure.error;
      setSnapshot({
        people: (people.data ?? []) as Person[], requirements: (requirements.data ?? []) as Requirement[],
        staff: (staff.data ?? []) as Staff[], training: (training.data ?? []) as Training[],
        competencies: (competencies.data ?? []) as Competency[], shifts: (shifts.data ?? []) as ExistingShift[],
      });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load scheduling data."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const personMap = useMemo(() => new Map(snapshot.people.map(p => [p.id, p])), [snapshot.people]);
  const occurrences = useMemo(() => {
    const templates: VisitTemplate[] = snapshot.requirements
      .filter(r => personMap.has(r.service_user_id))
      .map(r => ({
        id: r.id, personId: r.service_user_id, activityCodes: [r.activity_code],
        weekdays: r.weekdays, startDate: r.valid_from, endDate: r.valid_until,
        startTime: labelTime(r.earliest_start ?? "09:00"),
        durationMinutes: r.duration_minutes, requiredStaff: r.required_staff,
      }));
    try { return expandVisits(templates, date, date); } catch { return []; }
  }, [snapshot.requirements, personMap, date]);
  const requirementMap = useMemo(() => new Map(snapshot.requirements.map(r => [r.id, r])), [snapshot.requirements]);
  const today = localDate();
  const attention = useMemo(() => occurrences.filter(v => !requirementMap.get(v.templateId)?.verified_at), [occurrences, requirementMap]);
  const expiring = useMemo(() => snapshot.training.filter(t => t.expiry_date && t.expiry_date <= today), [snapshot.training, today]);
  const staffing = snapshot.staff.filter(s => s.is_active).length;
  const filtered = occurrences.filter(visit => {
    const person = personMap.get(visit.personId);
    const requirement = requirementMap.get(visit.templateId);
    const verified = Boolean(requirement?.verified_at);
    return (view === "all" || (view === "needs_attention" ? !verified : verified)) &&
      `${person?.full_name ?? ""} ${requirement?.title ?? ""} ${requirement?.activity_code ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <CastodiaPageShell title="Domiciliary scheduling" description="A single view of visit requirements, person-centred safety checks and staffing readiness. Draft requirements are never treated as safe allocations." maxWidth="wide">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4 text-cyan-700" /> Manager workspace <ChevronRight className="h-4 w-4" /> Domiciliary care</div>
        <div className="flex flex-wrap items-center gap-2"><Link href="/care/manager/rota/domiciliary/builder" className="inline-flex items-center rounded-xl bg-cyan-800 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-900">Open rota builder</Link><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-300 disabled:opacity-50"><RefreshCw className="h-4 w-4" /> Refresh sources</button></div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}. The workspace will not display stale data as confirmed.</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={tile}><div className="flex items-center justify-between text-sm text-slate-500">People receiving care <Users className="h-5 w-5 text-cyan-700" /></div><div className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "—" : snapshot.people.length}</div><p className="mt-1 text-xs text-slate-500">Active domiciliary records</p></div>
        <div className={tile}><div className="flex items-center justify-between text-sm text-slate-500">Visits on selected day <CalendarDays className="h-5 w-5 text-cyan-700" /></div><div className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "—" : occurrences.length}</div><p className="mt-1 text-xs text-slate-500">Projected from recurring requirements</p></div>
        <div className={tile}><div className="flex items-center justify-between text-sm text-slate-500">Needs verification <ShieldAlert className="h-5 w-5 text-amber-600" /></div><div className="mt-3 text-3xl font-semibold text-amber-700">{loading ? "—" : attention.length}</div><p className="mt-1 text-xs text-slate-500">Not eligible for publication</p></div>
        <div className={tile}><div className="flex items-center justify-between text-sm text-slate-500">Active staff <Users className="h-5 w-5 text-cyan-700" /></div><div className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "—" : staffing}</div><p className="mt-1 text-xs text-slate-500">{expiring.length} expired training records · review required</p></div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-4">
          <CastodiaCard className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><h2 className="text-lg font-semibold text-slate-900">Visit requirements</h2><p className="mt-1 text-sm text-slate-500">Projected care demand, not confirmed staff assignments</p></div>
              <label className="text-xs font-semibold text-slate-600">Date<input aria-label="Visit date" type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Visit filter">
              {([["needs_attention", "Needs attention"], ["all", "All requirements"], ["ready", "Verified"]] as const).map(([key, label]) =>
                <button type="button" key={key} onClick={() => setView(key)} aria-pressed={view === key} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${view === key ? "bg-cyan-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>)}
            </div>
            <input type="search" aria-label="Search people or activities" placeholder="Search person or activity…" value={search} onChange={e => setSearch(e.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-cyan-500" />
            <div className="mt-4 divide-y divide-slate-100">
              {loading ? <p className="py-10 text-center text-sm text-slate-500">Gathering care and staff records…</p> :
                filtered.length === 0 ? <div className="py-12 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No matching visit requirements</p><p className="mt-1 text-xs text-slate-500">Choose another date or record a person's recurring care needs.</p></div> :
                filtered.map(visit => {
                  const requirement = requirementMap.get(visit.templateId);
                  const person = personMap.get(visit.personId);
                  const verified = Boolean(requirement?.verified_at);
                  return <div key={visit.key} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5"><Clock3 className="h-5 w-5 text-slate-600" /></div>
                      <div><p className="font-semibold text-slate-900">{person?.full_name ?? "Person"}</p><p className="mt-1 text-sm text-slate-600">{requirement?.title ?? visit.activityCodes.join(", ")}</p><p className="mt-1 text-xs text-slate-500">{visit.startTime}–{visit.endTime} · {visit.requiredStaff} staff required</p></div>
                    </div>
                    <div className="flex items-center gap-3">{verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Source verified</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Verify requirement</span>}
                      <Link href={`/care/manager/rota/domiciliary/requirements/${visit.personId}`} className="rounded-lg p-2 text-cyan-700 hover:bg-cyan-50" aria-label={`Review ${person?.full_name ?? "person"} requirements`}><ChevronRight className="h-5 w-5" /></Link>
                    </div>
                  </div>;
                })}
            </div>
          </CastodiaCard>
        </section>
        <aside className="space-y-4">\n          <Link href="/care/manager/rota/domiciliary/availability" className="flex items-center justify-between rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm font-semibold text-cyan-900 hover:bg-cyan-100">Review staff availability requests <ChevronRight className="h-5 w-5" /></Link>
          <CastodiaCard className="p-5">
            <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-slate-900">Readiness checks</h2></div>
            <p className="mt-2 text-sm text-slate-500">These signals highlight records needing attention. They do not certify worker eligibility.</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Unverified visit requirements</span><strong className="text-amber-700">{attention.length}</strong></div>
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Expired training records</span><strong className="text-slate-900">{expiring.length}</strong></div>
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Recorded assessments</span><strong className="text-slate-900">{snapshot.competencies.length}</strong></div>
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">Existing rota shifts (loaded range)</span><strong className="text-slate-900">{snapshot.shifts.length}</strong></div>
            </div>
          </CastodiaCard>
          <CastodiaCard className="p-5">
            <h2 className="font-semibold text-slate-900">Person-centred setup</h2>
            <p className="mt-2 text-sm text-slate-500">Use existing person records and record only the scheduling information that is missing.</p>
            <div className="mt-4 space-y-2">
              {snapshot.people.slice(0, 8).map(person => <Link key={person.id} href={`/care/manager/rota/domiciliary/requirements/${person.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">{person.full_name}<ChevronRight className="h-4 w-4 text-cyan-700" /></Link>)}
              {snapshot.people.length > 8 && <p className="text-xs text-slate-500">Showing the first eight people. Search the visit list for others.</p>}
            </div>
          </CastodiaCard>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-sm text-cyan-900"><strong>Scheduling safety</strong><p className="mt-2 leading-relaxed">This workspace is an operational preview. Do not treat projected visits or verified requirements as published or staffed visits. Publication remains disabled until server-side validation is complete.</p></div>
        </aside>
      </div>
    </CastodiaPageShell>
  );
}
