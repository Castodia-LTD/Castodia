"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Person = { id:string;full_name:string;care_model:string };
type Package = { service_user_id:string;commissioned_hours_weekly:number|null;commissioner:string|null };
type Entry = { id:string;service_user_id:string;care_date:string;care_model:string;unit_type:string;recorded_minutes:number|null;verification_status:string;source:string;scheduled_start:string|null;scheduled_end:string|null;actual_start:string|null;actual_end:string|null };
const modelNames:Record<string,string>={supported_living:"Supported Living",domiciliary:"Domiciliary Care",residential:"Residential Care"};
const fmt=(value:string|null)=>value?new Date(value).toLocaleString("en-GB",{dateStyle:"short",timeStyle:"short"}):"—";
const hours=(minutes:number)=>Number((minutes/60).toFixed(2));
export default function FinanceCareHoursPage(){
 const [people,setPeople]=useState<Person[]>([]);
 const [packages,setPackages]=useState<Package[]>([]);
 const [entries,setEntries]=useState<Entry[]>([]);
 const [from,setFrom]=useState(()=>{const d=new Date();d.setDate(d.getDate()-6);return d.toISOString().slice(0,10)});
 const [to,setTo]=useState(()=>new Date().toISOString().slice(0,10));
 const [model,setModel]=useState("all");const [person,setPerson]=useState("all");const [status,setStatus]=useState("all");
 const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{setLoading(true);setError("");const {data:{user},error:authError}=await supabase.auth.getUser();if(!active)return;if(authError||!user){setError("Sign in to view care hours.");setLoading(false);return;}
 const {data:profile,error:profileError}=await supabase.from("profiles").select("organisation_id").eq("id",user.id).single();if(!active)return;
 if(profileError||!profile?.organisation_id){setError("Your organisation could not be verified.");setLoading(false);return;}
 const [p,pk,h]=await Promise.all([
 supabase.from("service_users").select("id,full_name,care_model").eq("organisation_id",profile.organisation_id),
 supabase.from("person_support_packages").select("service_user_id,commissioned_hours_weekly,commissioner"),
 supabase.from("person_care_hours").select("id,service_user_id,care_date,care_model,unit_type,recorded_minutes,verification_status,source,scheduled_start,scheduled_end,actual_start,actual_end").gte("care_date",from).lte("care_date",to).order("care_date",{ascending:false}).limit(1000)
 ]);if(!active)return;
 const issue=p.error||pk.error||h.error;if(issue)setError(issue.message);
 const ids=new Set((p.data||[]).map(x=>x.id));
 setPeople(p.data||[]);setPackages((pk.data||[]).filter(x=>ids.has(x.service_user_id)));setEntries((h.data||[]).filter(x=>ids.has(x.service_user_id)));setLoading(false);
 })();return()=>{active=false}},[from,to]);
 const visible=useMemo(()=>entries.filter(e=>(model==="all"||e.care_model===model)&&(person==="all"||e.service_user_id===person)&&(status==="all"||e.verification_status===status)),[entries,model,person,status]);
 const names=new Map(people.map(p=>[p.id,p.full_name]));
 const pkgs=new Map(packages.map(p=>[p.service_user_id,p]));
 const totalMinutes=visible.reduce((n,e)=>n+(e.recorded_minutes||0),0);
 const pending=visible.filter(e=>e.verification_status!=="verified").length;
 const input="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800";
 return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
 <header><p className="text-sm font-semibold text-cyan-700">Finance</p><h1 className="text-3xl font-bold text-slate-950">Care Hours Register</h1><p className="mt-1 text-sm text-slate-600">Organisation-wide care delivery records. Verification and charging remain separate processes.</p></header>
 <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
 <label className="text-xs font-semibold">From<input aria-label="From date" type="date" value={from} onChange={e=>setFrom(e.target.value)} className={"mt-1 w-full "+input}/></label>
 <label className="text-xs font-semibold">To<input aria-label="To date" type="date" value={to} onChange={e=>setTo(e.target.value)} className={"mt-1 w-full "+input}/></label>
 <label className="text-xs font-semibold">Service<select value={model} onChange={e=>setModel(e.target.value)} className={"mt-1 w-full "+input}><option value="all">All services</option>{Object.entries(modelNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
 <label className="text-xs font-semibold">Person<select value={person} onChange={e=>setPerson(e.target.value)} className={"mt-1 w-full "+input}><option value="all">All people</option>{people.filter(p=>model==="all"||p.care_model===model).map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></label>
 <label className="text-xs font-semibold">Verification<select value={status} onChange={e=>setStatus(e.target.value)} className={"mt-1 w-full "+input}><option value="all">All statuses</option>{["pending","verified","estimated","disputed"].map(s=><option key={s} value={s}>{s}</option>)}</select></label>
 </div>
 <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Records</p><p className="text-2xl font-bold">{visible.length}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Recorded time (hour-based entries)</p><p className="text-2xl font-bold">{hours(totalMinutes)} hrs</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Not verified</p><p className="text-2xl font-bold">{pending}</p></div></div>
 {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-4"><h2 className="text-lg font-semibold">Delivery records</h2><p className="text-xs text-slate-500">Residential placement days and sleep-ins are shown as units, not converted to care hours.</p></div>
 <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Date","Person","Service","Care unit","Recorded","Scheduled","Actual","Verification","Source"].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(e=><tr className="border-t" key={e.id}><td className="p-3">{e.care_date}</td><td className="p-3"><Link className="font-medium text-cyan-700 hover:underline" href={`/care/manager/service-users/${e.service_user_id}/support-package`}>{names.get(e.service_user_id)||"Unknown"}</Link><p className="text-xs text-slate-500">{pkgs.get(e.service_user_id)?.commissioner||""}</p></td><td className="p-3">{modelNames[e.care_model]||e.care_model}</td><td className="p-3">{e.unit_type.replaceAll("_"," ")}</td><td className="p-3">{e.recorded_minutes==null?"—":e.unit_type==="placement_day"?"Placement day":`${hours(e.recorded_minutes)} hrs`}</td><td className="p-3">{fmt(e.scheduled_start)} – {fmt(e.scheduled_end)}</td><td className="p-3">{fmt(e.actual_start)} – {fmt(e.actual_end)}</td><td className="p-3 capitalize">{e.verification_status}</td><td className="p-3">{e.source.replaceAll("_"," ")}</td></tr>)}{!loading&&visible.length===0&&<tr><td colSpan={9} className="p-8 text-center text-slate-500">No records for the selected filters. Care delivery integrations are not connected yet.</td></tr>}</tbody></table></div>{loading&&<p className="p-5 text-sm">Loading care hours…</p>}</section>
 <section className="rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">Invoicing</h2><p className="mt-1 text-sm text-slate-600">Future phase: verified delivery records, contract-specific charging rules, invoice generation and credit notes. No invoices are created from this screen.</p></section>
 </main>;
}
