"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw, Route, ShieldCheck, Users } from "lucide-react";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { expandVisits, type VisitTemplate, type VisitOccurrence } from "@/features/care/shared/rota/visitRecurrence";

type Person = { id: string; full_name: string };
type Staff = { id: string; full_name: string | null; is_active: boolean | null };
type Requirement = { id: string; service_user_id: string; title: string; activity_code: string; required_staff: number; duration_minutes: number; weekdays: number[]; valid_from: string; valid_until: string | null; earliest_start: string | null; verified_at: string | null; all_staff_competencies: string[]; team_competencies: string[] };
type Shift = { id: string; service_user_id: string; shift_date: string; start_time: string; end_time: string; notes: string | null; status: string; rota_shift_assignments: { staff_user_id: string; assignment_type: string }[] };
type Availability = { staff_id: string; weekday: number; start_time: string; end_time: string; valid_from: string; valid_until: string | null; status: string };
type Exception = { staff_id: string; exception_date: string; start_time: string | null; end_time: string | null; available: boolean; status: string };
type Evidence = { staff_id: string; competency_type: string; review_date: string | null; outcome: string | null; assessor_signed: boolean | null };
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const time = (s: string) => s.slice(0,5);
const mins = (s: string) => Number(s.slice(0,2))*60+Number(s.slice(3,5));
const weekDay = (s: string) => { const d = new Date(s+"T12:00:00"); return d.getDay() || 7; };
const overlaps = (a: string,b: string,c: string,d: string) => mins(a)<mins(d) && mins(c)<mins(b);
function availabilityReason(staffId: string, visit: VisitOccurrence, regular: Availability[], exceptions: Exception[]) {
  const day = weekDay(visit.date);
  const applicable = exceptions.filter(x=>x.staff_id===staffId && x.exception_date===visit.date && x.status==="approved");
  if (applicable.some(x=>!x.available && (!x.start_time || overlaps(visit.startTime,visit.endTime,x.start_time,x.end_time!)))) return "Unavailable by exception";
  if (applicable.some(x=>x.available && (!x.start_time || (mins(x.start_time)<=mins(visit.startTime) && mins(x.end_time!)>=mins(visit.endTime))))) return null;
  const available = regular.some(x=>x.staff_id===staffId && x.status==="approved" && x.weekday===day && x.valid_from<=visit.date && (!x.valid_until || x.valid_until>=visit.date) && mins(x.start_time)<=mins(visit.startTime) && mins(x.end_time)>=mins(visit.endTime));
  return available ? null : "No approved availability for this time";
}
export default function DomiciliaryVisitBoard() {
  const [date,setDate] = useState(()=>dateKey(new Date()));
  const [people,setPeople] = useState<Person[]>([]);
  const [staff,setStaff] = useState<Staff[]>([]);
  const [requirements,setRequirements] = useState<Requirement[]>([]);
  const [shifts,setShifts] = useState<Shift[]>([]);
  const [regular,setRegular] = useState<Availability[]>([]);
  const [exceptions,setExceptions] = useState<Exception[]>([]);
  const [evidence,setEvidence] = useState<Evidence[]>([]);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [selected,setSelected] = useState<string | null>(null);
  const [chosen,setChosen] = useState<string[]>([]);
  const [query,setQuery] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const {data:auth,error:authError}=await supabase.auth.getUser();
      if(authError || !auth.user) throw new Error("Sign in required");
      const {data:profile,error:profileError}=await supabase.from("profiles").select("organisation_id").eq("id",auth.user.id).single();
      if(profileError || !profile?.organisation_id) throw new Error("Organisation not found");
      const org=profile.organisation_id;
      const results=await Promise.all([
        supabase.from("service_users").select("id,full_name").eq("organisation_id",org).eq("care_model","domiciliary").eq("is_active",true),
        supabase.from("profiles").select("id,full_name,is_active").eq("organisation_id",org).in("role",["support","manager"]),
        supabase.from("domiciliary_activity_requirements").select("id,service_user_id,title,activity_code,required_staff,duration_minutes,weekdays,valid_from,valid_until,earliest_start,verified_at,all_staff_competencies,team_competencies").eq("organisation_id",org),
        supabase.from("rota_shifts").select("id,service_user_id,shift_date,start_time,end_time,notes,status,rota_shift_assignments(staff_user_id,assignment_type)").eq("organisation_id",org).eq("shift_date",date).eq("status","planned"),
        supabase.from("staff_recurring_availability").select("staff_id,weekday,start_time,end_time,valid_from,valid_until,status").eq("organisation_id",org).eq("status","approved"),
        supabase.from("staff_availability_exceptions").select("staff_id,exception_date,start_time,end_time,available,status").eq("organisation_id",org).eq("exception_date",date).eq("status","approved"),
        supabase.from("staff_competencies").select("staff_id,competency_type,review_date,outcome,assessor_signed").eq("organisation_id",org),
      ]);
      const failed=results.find(x=>x.error);
      if(failed?.error) throw failed.error;
      setPeople((results[0].data??[]) as Person[]);
      setStaff((results[1].data??[]) as Staff[]);
      setRequirements((results[2].data??[]) as Requirement[]);
      setShifts((results[3].data??[]) as unknown as Shift[]);
      setRegular((results[4].data??[]) as Availability[]);
      setExceptions((results[5].data??[]) as Exception[]);
      setEvidence((results[6].data??[]) as Evidence[]);
    } catch(e){setError(e instanceof Error?e.message:"Unable to load visit board");}
    finally{setLoading(false);}
  },[date]);
  useEffect(()=>{void load();},[load]);
  const personMap=useMemo(()=>new Map(people.map(x=>[x.id,x])),[people]);
  const requirementMap=useMemo(()=>new Map(requirements.map(x=>[x.id,x])),[requirements]);
  const visits=useMemo(()=>{
    const templates:VisitTemplate[]=requirements.filter(x=>personMap.has(x.service_user_id)).map(x=>({id:x.id,personId:x.service_user_id,activityCodes:[x.activity_code],weekdays:x.weekdays,startDate:x.valid_from,endDate:x.valid_until,startTime:time(x.earliest_start??"09:00"),durationMinutes:x.duration_minutes,requiredStaff:x.required_staff}));
    try{return expandVisits(templates,date,date);}catch{return [] as VisitOccurrence[];}
  },[requirements,personMap,date]);
  const shiftFor=(visit:VisitOccurrence)=>shifts.find(x=>x.service_user_id===visit.personId && x.notes?.includes(`[Castodia visit:${visit.key}]`));
  const active=visits.find(x=>x.key===selected)??null;
  const activeRequirement=active?requirementMap.get(active.templateId):null;
  const candidates=useMemo(()=>{
    if(!active || !activeRequirement) return [];
    return staff.filter(x=>x.is_active).map(member=>{
      const reasons:string[]=[];
      const unavailable=availabilityReason(member.id,active,regular,exceptions);
      if(unavailable) reasons.push(unavailable);
      if(shifts.some(shift=>shift.rota_shift_assignments?.some(a=>a.staff_user_id===member.id && a.assignment_type==="working") && overlaps(active.startTime,active.endTime,shift.start_time,shift.end_time))) reasons.push("Overlaps an existing shift");
      for(const code of [...activeRequirement.all_staff_competencies,...activeRequirement.team_competencies]){
        if(!evidence.some(e=>e.staff_id===member.id && e.competency_type===code && e.assessor_signed && e.outcome==="competent" && (!e.review_date || e.review_date>=active.date))) reasons.push(`Competency not verified: ${code}`);
      }
      return {member,reasons};
    }).sort((a,b)=>a.reasons.length-b.reasons.length || (a.member.full_name??"").localeCompare(b.member.full_name??""));
  },[active,activeRequirement,staff,regular,exceptions,shifts,evidence]);
  const assigned=visits.filter(x=>Boolean(shiftFor(x))).length;
  const missing=visits.filter(x=>!shiftFor(x)).length;
  function openVisit(visit:VisitOccurrence){
    setSelected(visit.key);setChosen(shiftFor(visit)?.rota_shift_assignments?.filter(a=>a.assignment_type==="working").map(a=>a.staff_user_id)??[]);setNotice("");setError("");
  }
  async function save(){
    if(!active || !activeRequirement || busy) return;
    setError("");setNotice("");
    if(!activeRequirement.verified_at){setError("This requirement is unverified. Review the person's source evidence before allocation.");return;}
    if(shiftFor(active)){setError("This visit already has a saved shift. Use the person's rota to amend it.");return;}
    if(chosen.length!==active.requiredStaff || new Set(chosen).size!==chosen.length){setError(`Select exactly ${active.requiredStaff} distinct workers.`);return;}
    const selectedCandidates=candidates.filter(x=>chosen.includes(x.member.id));
    if(selectedCandidates.length!==chosen.length || selectedCandidates.some(x=>x.reasons.length)){setError("Selected staff have unresolved eligibility or availability checks.");return;}
    if(activeRequirement.team_competencies.some(code=>!chosen.some(id=>evidence.some(e=>e.staff_id===id && e.competency_type===code && e.assessor_signed && e.outcome==="competent" && (!e.review_date || e.review_date>=active.date))))){setError("Required team competencies are not covered.");return;}
    setBusy(true);
    try{
      const {error:createError}=await supabase.rpc("create_rota_shift",{
        p_service_user_id:active.personId,p_shift_date:active.date,p_start_time:active.startTime,p_end_time:active.endTime,
        p_shift_type:"Domiciliary visit",p_notes:`[Castodia visit:${active.key}] ${activeRequirement.title}`,p_staff_user_ids:chosen,
      });
      if(createError) throw createError;
      setNotice("Visit saved to the existing rota. Staff will see their assignment in My rota. This is not a publication or delivery confirmation.");
      setSelected(null);setChosen([]);await load();
    }catch(e){setError(e instanceof Error?e.message:"Could not save visit");}
    finally{setBusy(false);}
  }
  const shiftDay=(n:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+n);setDate(dateKey(d));setSelected(null);};
  return <CastodiaPageShell title="Domiciliary rota builder" description="Person-first visits, staff availability and a daily allocation board. Existing supported-living rotas remain separate." maxWidth="wide">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/care/manager/rota/domiciliary" className="text-sm font-semibold text-cyan-800 hover:underline">← Scheduling overview</Link><div className="flex items-center gap-2"><button aria-label="Previous day" onClick={()=>shiftDay(-1)} className="rounded-xl border p-2"><ChevronLeft className="h-4 w-4"/></button><input aria-label="Schedule date" type="date" value={date} onChange={e=>{setDate(e.target.value);setSelected(null);}} className="rounded-xl border px-3 py-2 text-sm"/><button aria-label="Next day" onClick={()=>shiftDay(1)} className="rounded-xl border p-2"><ChevronRight className="h-4 w-4"/></button><button onClick={()=>void load()} aria-label="Refresh rota" className="rounded-xl border p-2"><RefreshCw className="h-4 w-4"/></button></div></div>
    {error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    {notice&&<p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{[[visits.length,"Visits required",CalendarDays],[assigned,"Already on rota",ShieldCheck],[missing,"Unallocated",AlertTriangle]].map(([count,label,Icon],i)=><CastodiaCard key={i} className="p-5"><div className="flex items-center justify-between text-sm text-slate-500">{label as string}<Icon className="h-5 w-5 text-cyan-700"/></div><p className="mt-2 text-3xl font-bold text-slate-900">{loading?"—":count as number}</p></CastodiaCard>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
      <CastodiaCard className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Daily visit queue</h2><p className="text-sm text-slate-500">Choose a visit to review available workers</p></div><input aria-label="Search visits" type="search" placeholder="Search person or care activity" value={query} onChange={e=>setQuery(e.target.value)} className="rounded-xl border px-3 py-2 text-sm"/></div>
        <div className="mt-4 divide-y divide-slate-100">{loading?<p className="py-8 text-sm text-slate-500">Loading visit demand…</p>:visits.filter(v=>`${personMap.get(v.personId)?.full_name} ${requirementMap.get(v.templateId)?.title}`.toLowerCase().includes(query.toLowerCase())).map(visit=>{
          const req=requirementMap.get(visit.templateId);const shift=shiftFor(visit);return <button type="button" key={visit.key} onClick={()=>openVisit(visit)} className={`flex w-full flex-wrap items-center justify-between gap-3 px-2 py-4 text-left hover:bg-cyan-50 ${selected===visit.key?"bg-cyan-50":""}`}><div className="flex items-start gap-3"><div className="rounded-xl bg-slate-100 p-2"><Clock3 className="h-5 w-5 text-slate-600"/></div><div><p className="font-semibold text-slate-900">{personMap.get(visit.personId)?.full_name}</p><p className="mt-1 text-sm text-slate-600">{req?.title}</p><p className="mt-1 text-xs text-slate-500">{visit.startTime}–{visit.endTime} · {visit.requiredStaff} staff · {req?.activity_code.replaceAll("_"," ")}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${shift?"bg-emerald-50 text-emerald-800":req?.verified_at?"bg-amber-50 text-amber-800":"bg-rose-50 text-rose-800"}`}>{shift?"On rota":req?.verified_at?"Unallocated":"Verify first"}</span></button>;
        })}{!loading&&visits.length===0&&<p className="py-10 text-center text-sm text-slate-500">No recurring visits recorded for this date. Add requirements in the person's care record.</p>}</div>
      </CastodiaCard>
      <div className="space-y-4"><CastodiaCard className="p-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-cyan-700"/><h2 className="font-semibold">Staff allocation</h2></div>{!active?<p className="mt-3 text-sm text-slate-500">Select a visit to see staff availability and competency checks.</p>:<><p className="mt-3 text-sm font-semibold">{personMap.get(active.personId)?.full_name} · {active.startTime}–{active.endTime}</p><p className="mt-1 text-xs text-slate-500">Select {active.requiredStaff} worker(s). Missing evidence and unapproved availability are not assumed safe.</p><div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">{candidates.map(({member,reasons})=><label key={member.id} className={`flex items-start gap-3 rounded-xl border p-3 ${reasons.length?"border-slate-200 bg-slate-50":"border-cyan-100"}`}><input type="checkbox" disabled={Boolean(reasons.length)||Boolean(shiftFor(active))} checked={chosen.includes(member.id)} onChange={e=>setChosen(current=>e.target.checked?[...current,member.id]:current.filter(id=>id!==member.id))} className="mt-1"/><div><p className="text-sm font-semibold text-slate-900">{member.full_name??"Staff member"}</p><p className={`mt-1 text-xs ${reasons.length?"text-amber-800":"text-emerald-700"}`}>{reasons.length?reasons.join(" · "):"Initial checks clear — manager review required"}</p></div></label>)}{candidates.length===0&&<p className="text-sm text-slate-500">No active staff records available.</p>}</div><button type="button" disabled={busy||Boolean(shiftFor(active))||!activeRequirement?.verified_at||chosen.length!==active.requiredStaff} onClick={()=>void save()} className="mt-4 w-full rounded-xl bg-cyan-800 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy?"Saving…":shiftFor(active)?"Already allocated":"Save visit allocation"}</button><Link href={`/care/manager/rota/domiciliary/requirements/${active.personId}`} className="mt-3 block text-center text-sm font-semibold text-cyan-800 hover:underline">Review person's requirements</Link></>}</CastodiaCard><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-center gap-2 font-semibold"><Route className="h-4 w-4"/> Trial safety boundary</div><p className="mt-2">Travel feasibility, person-specific authorisations, person preferences and server-side publication validation are not yet enforced here. This board is for controlled evaluation only; do not rely on it as the sole safety check for real visits.</p></div></div>
    </div>
  </CastodiaPageShell>;
}
