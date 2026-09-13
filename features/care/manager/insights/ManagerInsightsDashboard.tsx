"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, GraduationCap, Loader2, Pill, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CastodiaButton, CastodiaCard, CastodiaPageShell } from "@/components/castodia";

type Timeline = { entry_type:string; reviewed:boolean|null; created_at:string };
type Competency = { staff_id:string; competency_type:string; outcome:string|null; assessment_date:string|null; review_date:string|null };
type Medication = { status:string; administered_at:string };
type Shift = { id:string; shift_date:string; start_time:string; end_time:string; rota_shift_assignments?: { staff_user_id:string; assignment_type:string }[] };
type Item = { key:string; title:string; description:string; count:number; href:string; tone:"red"|"amber"; icon:React.ReactNode };

const INCIDENTS = ["Accident / Injury","Behaviour Incident","Fall","Medication Error","Near Miss","Safeguarding Concern"];
const MEDS = ["Refused","Not Administered","Not given","Omitted","Missed","Unavailable","Withheld"];
const day = 86400000;
const dateKey = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const startToday = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d:Date,n:number) => new Date(d.getTime()+n*day);

export default function ManagerInsightsDashboard(){
  const router=useRouter();
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [timeline,setTimeline]=useState<Timeline[]>([]);
  const [competencies,setCompetencies]=useState<Competency[]>([]);
  const [meds,setMeds]=useState<Medication[]>([]);
  const [shifts,setShifts]=useState<Shift[]>([]);

  const load=useCallback(async(refresh=false)=>{
    refresh?setRefreshing(true):setLoading(true); setError(null);
    try{
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if(userError) throw userError; if(!user) throw new Error("You must be signed in to view insights.");
      const {data:profile,error:profileError}=await supabase.from("profiles").select("organisation_id").eq("id",user.id).single();
      if(profileError) throw profileError;
      const org=profile.organisation_id; const today=startToday(); const failures:string[]=[];
      const [t,c,m,r]=await Promise.all([
        supabase.from("timeline_entries").select("entry_type, reviewed, created_at").gte("created_at",addDays(today,-30).toISOString()),
        supabase.from("staff_competencies").select("staff_id, competency_type, outcome, assessment_date, review_date").eq("organisation_id",org),
        supabase.from("medication_administrations").select("status, administered_at").gte("administered_at",addDays(today,-30).toISOString()),
        supabase.from("rota_shifts").select("id, shift_date, start_time, end_time, rota_shift_assignments(staff_user_id, assignment_type)").eq("organisation_id",org).eq("status","planned").gte("shift_date",dateKey(today)).lte("shift_date",dateKey(addDays(today,14))),
      ]);
      if(t.error) failures.push(`Timeline: ${t.error.message}`); else setTimeline((t.data??[]) as Timeline[]);
      if(c.error) failures.push(`Competencies: ${c.error.message}`); else setCompetencies((c.data??[]) as Competency[]);
      if(m.error) failures.push(`Medication: ${m.error.message}`); else setMeds((m.data??[]) as Medication[]);
      if(r.error) failures.push(`Rotas: ${r.error.message}`); else setShifts((r.data??[]) as Shift[]);
      if(failures.length) setError(`Some insight sources are unavailable: ${failures.join(" | ")}`);
    }catch(e){ setError(e instanceof Error?e.message:String(e)); }
    finally{ setLoading(false); setRefreshing(false); }
  },[]);

  useEffect(()=>{void load();},[load]);

  const stats=useMemo(()=>{
    const now=startToday(), week=addDays(now,7), cutoff=addDays(now,-7);
    const incidents=timeline.filter(x=>INCIDENTS.includes(x.entry_type)&&x.reviewed!==true).length;
    const latest=new Map<string,Competency>();
    [...competencies].sort((a,b)=>new Date(b.assessment_date||b.review_date||0).getTime()-new Date(a.assessment_date||a.review_date||0).getTime()).forEach(x=>{const k=`${x.staff_id}:${x.competency_type}`; if(!latest.has(k)) latest.set(k,x);});
    let overdue=0,due=0,actions=0; for(const x of latest.values()){if(x.outcome==="Competent With Actions") actions++; if(!x.review_date) continue; const d=new Date(x.review_date); if(d<now) overdue++; else if(d<=week) due++;}
    const medication=meds.filter(x=>new Date(x.administered_at)>=cutoff&&MEDS.includes(x.status)).length;
    let unfilled=0,conflicts=0; const byStaff=new Map<string,Shift[]>();
    for(const shift of shifts){const working=(shift.rota_shift_assignments??[]).filter(a=>a.assignment_type==="working"); if(!working.length) unfilled++; for(const a of working){const list=byStaff.get(a.staff_user_id)??[]; list.push(shift); byStaff.set(a.staff_user_id,list);}}
    for(const list of byStaff.values()) for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j]; const as=new Date(`${a.shift_date}T${a.start_time}`),ae=new Date(`${a.shift_date}T${a.end_time}`),bs=new Date(`${b.shift_date}T${b.start_time}`),be=new Date(`${b.shift_date}T${b.end_time}`); if(ae<=as) ae.setDate(ae.getDate()+1); if(be<=bs) be.setDate(be.getDate()+1); if(as<be&&bs<ae) conflicts++;}
    return {incidents,overdue,due,actions,medication,unfilled,conflicts};
  },[timeline,competencies,meds,shifts]);

  const items:Item[]=[
    {key:"incidents",title:"Incident reviews",description:"Incidents awaiting manager review.",count:stats.incidents,href:"/care/manager/incidents",tone:"red",icon:<ShieldAlert className="h-5 w-5"/>},
    {key:"conflicts",title:"Rota conflicts",description:"Overlapping staff assignments in the next 14 days.",count:stats.conflicts,href:"/care/manager/rota",tone:"red",icon:<AlertTriangle className="h-5 w-5"/>},
    {key:"unfilled",title:"Unfilled shifts",description:"Planned shifts with no working staff assigned.",count:stats.unfilled,href:"/care/manager/rota",tone:"amber",icon:<Users className="h-5 w-5"/>},
    {key:"overdue",title:"Overdue competencies",description:"Competencies past their review date.",count:stats.overdue,href:"/care/manager/staff/competencies",tone:"red",icon:<GraduationCap className="h-5 w-5"/>},
    {key:"due",title:"Competencies due soon",description:"Competencies reaching review date within seven days.",count:stats.due,href:"/care/manager/staff/competencies",tone:"amber",icon:<GraduationCap className="h-5 w-5"/>},
    {key:"medication",title:"Medication outcomes to review",description:"Missed, refused, withheld or unavailable outcomes this week.",count:stats.medication,href:"/care/manager/emar",tone:"amber",icon:<Pill className="h-5 w-5"/>},
  ].filter(x=>x.count>0);
  const total=items.reduce((n,x)=>n+x.count,0);
  const positives=[stats.incidents===0&&"No incidents are awaiting manager review.",stats.conflicts===0&&"No rota clashes were found in the next 14 days.",stats.unfilled===0&&"All planned shifts in the next 14 days have working staff assigned.",stats.overdue===0&&"No recorded competencies are overdue.",stats.medication===0&&"No concerning medication outcomes were recorded in the last seven days."].filter(Boolean) as string[];

  return <CastodiaPageShell title="Insights" description="A live management briefing built from current Castodia records." maxWidth="wide" actions={<CastodiaButton variant="secondary" onClick={()=>void load(true)} disabled={refreshing}>{refreshing?<Loader2 className="h-4 w-4 animate-spin"/>:<RefreshCw className="h-4 w-4"/>}Refresh</CastodiaButton>}>
    {error?<CastodiaCard><p className="text-sm text-amber-700">{error}</p></CastodiaCard>:null}
    <CastodiaCard><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600"><ClipboardCheck className="h-6 w-6"/></span><div><p className="text-xl font-bold text-slate-950">{loading?"Preparing your briefing":total===0?"No actions currently require your attention":`${total} ${total===1?"item requires":"items require"} your attention`}</p><p className="mt-1 text-sm text-slate-500">Incidents, medication, staff competencies and rota readiness.</p></div></div></CastodiaCard>
    <div className="grid gap-4 xl:grid-cols-2"><CastodiaCard padding="none"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-bold text-slate-950">Needs Attention</h2></div>{loading?<div className="p-5 text-sm text-slate-500">Loading live records…</div>:items.length?<div className="divide-y divide-slate-100">{items.map(item=><button key={item.key} type="button" onClick={()=>router.push(item.href)} className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-slate-50"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone==="red"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700"}`}>{item.icon}</span><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-950">{item.title}</span><span className="mt-1 block text-sm text-slate-500">{item.description}</span></span><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{item.count}</span><ArrowRight className="h-4 w-4 text-slate-400"/></button>)}</div>:<div className="flex items-start gap-3 p-5"><CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600"/><div><p className="font-semibold text-slate-950">Nothing needs immediate attention</p><p className="mt-1 text-sm text-slate-500">Current records do not show outstanding incident, medication, competency or rota actions.</p></div></div>}</CastodiaCard><CastodiaCard><h2 className="text-lg font-bold text-slate-950">Service readiness</h2><div className="mt-5 grid grid-cols-2 gap-3">{[["Rota conflicts",stats.conflicts],["Unfilled shifts",stats.unfilled],["Overdue competencies",stats.overdue],["Competency actions",stats.actions]].map(([label,value])=><div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl font-bold text-slate-950">{value}</div><div className="mt-1 text-xs font-medium text-slate-500">{label}</div></div>)}</div></CastodiaCard></div>
    <CastodiaCard><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600"/><div><h2 className="text-lg font-bold text-slate-950">Good News</h2><p className="text-sm text-slate-500">Areas where current records show no immediate governance concern.</p></div></div><ul className="mt-5 grid gap-3 md:grid-cols-2">{positives.map(x=><li key={x} className="rounded-2xl bg-emerald-50/60 p-4 text-sm text-slate-700">{x}</li>)}</ul></CastodiaCard>
  </CastodiaPageShell>;
}
