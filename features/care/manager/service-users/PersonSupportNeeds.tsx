"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Need = { id:string; organisation_id:string; service_user_id:string; activity_code:string; title:string; required_staff:number; duration_minutes:number; earliest_start:string|null; latest_start:string|null; weekdays:number[]; valid_from:string; valid_until:string|null; requirements_notes:string|null; verified_at:string|null };
const activities = [
  ["personal_care","Personal care"],["medication","Medication support"],["mobility_transfer","Mobility and transfers"],
  ["nutrition","Meals and nutrition"],["community_access","Community access"],["companionship","Companionship"],
  ["domestic_support","Domestic support"],["other","Other support"]
] as const;
const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
type Draft={id:string|null;activity_code:string;title:string;required_staff:number;duration_minutes:number;start:string;weekdays:number[];valid_from:string;valid_until:string;notes:string};
const blank=():Draft=>({id:null,activity_code:"personal_care",title:"",required_staff:1,duration_minutes:60,start:"09:00",weekdays:[1,2,3,4,5,6,7],valid_from:today(),valid_until:"",notes:""});
const input="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100";
export default function PersonSupportNeeds({personId,careModel}:{personId:string;careModel:string}){
 const [organisationId,setOrganisationId]=useState("");
 const [actorId,setActorId]=useState("");
 const [items,setItems]=useState<Need[]>([]);
 const [draft,setDraft]=useState<Draft>(blank);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [expanded,setExpanded]=useState(false);
 const load=useCallback(async()=>{
  const {data:auth,error:authError}=await supabase.auth.getUser();
  if(authError||!auth.user) throw authError??new Error("Sign in required");
  const {data:person,error:personError}=await supabase.from("service_users").select("organisation_id").eq("id",personId).single();
  if(personError||!person?.organisation_id) throw personError??new Error("Person organisation not found");
  const {data,error:queryError}=await supabase.from("domiciliary_activity_requirements").select("id,organisation_id,service_user_id,activity_code,title,required_staff,duration_minutes,earliest_start,latest_start,weekdays,valid_from,valid_until,requirements_notes,verified_at").eq("service_user_id",personId).order("earliest_start",{ascending:true});
  if(queryError) throw queryError;
  setActorId(auth.user.id);setOrganisationId(person.organisation_id);setItems((data??[]) as Need[]);
 },[personId]);
 useEffect(()=>{let cancelled=false;setLoading(true);void load().catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Unable to load support needs");}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[load]);
 const weekly=useMemo(()=>items.reduce((sum,n)=>sum+n.duration_minutes*n.weekdays.length/60,0),[items]);
 const staffing=useMemo(()=>items.reduce((sum,n)=>sum+n.duration_minutes*n.weekdays.length*n.required_staff/60,0),[items]);
 const set=(key:keyof Draft,value:Draft[keyof Draft])=>setDraft(prev=>({...prev,[key]:value}));
 const edit=(n:Need)=>{setDraft({id:n.id,activity_code:n.activity_code,title:n.title,required_staff:n.required_staff,duration_minutes:n.duration_minutes,start:n.earliest_start?.slice(0,5)??"09:00",weekdays:n.weekdays,valid_from:n.valid_from,valid_until:n.valid_until??"",notes:n.requirements_notes??""});setExpanded(true);setError("");setNotice("");};
 const save=async(e:React.FormEvent)=>{
  e.preventDefault();setError("");setNotice("");
  if(!organisationId||!draft.weekdays.length||!draft.title.trim()||draft.duration_minutes<1||draft.required_staff<1){setError("Provide a description, duration, staffing and at least one day.");return;}
  const endMinutes=Number(draft.start.slice(0,2))*60+Number(draft.start.slice(3,5))+draft.duration_minutes;
  if(endMinutes>1440){setError("Visit must finish on the same day.");return;}
  setSaving(true);
  try{
   const payload={organisation_id:organisationId,service_user_id:personId,activity_code:draft.activity_code,title:draft.title.trim(),required_staff:draft.required_staff,duration_minutes:draft.duration_minutes,earliest_start:draft.start,latest_start:draft.start,weekdays:draft.weekdays,valid_from:draft.valid_from,valid_until:draft.valid_until||null,requirements_notes:draft.notes.trim()||null};
   const response=draft.id?await supabase.from("domiciliary_activity_requirements").update(payload).eq("id",draft.id).eq("service_user_id",personId):await supabase.from("domiciliary_activity_requirements").insert(payload);
   if(response.error) throw response.error;
   await load();setDraft(blank());setExpanded(false);setNotice("Support need saved. The domiciliary rota now reads this schedule directly from the Person Hub. Review any existing allocations affected by changes.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save support need");}
  finally{setSaving(false);}
 };
 const confirm=async(n:Need)=>{
  if(!actorId||!window.confirm("Confirm that the frequency, duration, staffing and timing reflect this person's current agreed support needs?"))return;
  setSaving(true);setError("");setNotice("");
  try{const {error:e}=await supabase.from("domiciliary_activity_requirements").update({verified_at:new Date().toISOString(),verified_by:actorId}).eq("id",n.id).eq("service_user_id",personId);if(e)throw e;await load();setNotice("Support requirement confirmed for rota planning.");}
  catch(e){setError(e instanceof Error?e.message:"Unable to confirm support requirement");}
  finally{setSaving(false);}
 };
 if(careModel!=="domiciliary")return null;
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Support needs & visits</h2><p className="mt-1 text-sm text-slate-600">This is the person's authoritative recurring visit schedule. The domiciliary rota reads it automatically.</p></div><Link href="/care/manager/rota/domiciliary/builder" className="rounded-xl border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-800">Open rota builder</Link></div>
  {error&&<p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
  {notice&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
  <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Weekly visit hours</p><p className="text-xl font-bold">{weekly.toFixed(2)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Weekly staffing hours</p><p className="text-xl font-bold">{staffing.toFixed(2)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Needs awaiting confirmation</p><p className="text-xl font-bold">{items.filter(x=>!x.verified_at).length}</p></div></div>
  <div className="mt-4 space-y-2">{loading?<p className="text-sm text-slate-500">Loading needs…</p>:items.map(n=><div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><p className="font-semibold text-slate-900">{n.title}</p><p className="text-sm text-slate-600">{n.earliest_start?.slice(0,5)??"Time unset"} · {n.duration_minutes} min · {n.required_staff}:1 · {n.weekdays.map(d=>days[d-1]).join(", ")}</p><p className={`mt-1 text-xs ${n.verified_at?"text-emerald-700":"text-amber-700"}`}>{n.verified_at?"Confirmed":"Awaiting manager confirmation"}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>edit(n)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Edit</button>{!n.verified_at&&<button type="button" disabled={saving} onClick={()=>void confirm(n)} className="rounded-lg bg-cyan-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Confirm</button>}</div></div>)}{!loading&&items.length===0&&<p className="text-sm text-slate-500">No recurring visits recorded. Add the person's first support need below.</p>}</div>
  <button type="button" onClick={()=>{if(expanded){setExpanded(false);setDraft(blank());}else{setDraft(blank());setExpanded(true);}}} className="mt-5 rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white">{expanded?"Close editor":"+ Add support need"}</button>
  {expanded&&<form onSubmit={save} className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold">{draft.id?"Edit support need":"New support need"}</h3>
   <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Support activity<select className={input} value={draft.activity_code} onChange={e=>set("activity_code",e.target.value)}>{activities.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-medium">Description<input className={input} required value={draft.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Morning personal care"/></label><label className="text-sm font-medium">Staff required<select className={input} value={draft.required_staff} onChange={e=>set("required_staff",Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} worker{n>1?"s":""}</option>)}</select></label><label className="text-sm font-medium">Duration (minutes)<input type="number" min={1} max={1440} required className={input} value={draft.duration_minutes} onChange={e=>set("duration_minutes",Number(e.target.value))}/></label><label className="text-sm font-medium">Visit start<input type="time" required className={input} value={draft.start} onChange={e=>set("start",e.target.value)}/></label><label className="text-sm font-medium">Effective from<input type="date" required className={input} value={draft.valid_from} onChange={e=>set("valid_from",e.target.value)}/></label><label className="text-sm font-medium">Effective until (optional)<input type="date" min={draft.valid_from} className={input} value={draft.valid_until} onChange={e=>set("valid_until",e.target.value)}/></label></div>
   <fieldset className="rounded-xl border border-slate-200 bg-white p-3"><legend className="px-1 text-sm font-semibold">Recurring days</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{days.map((name,i)=><label key={name} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.weekdays.includes(i+1)} onChange={e=>set("weekdays",e.target.checked?[...draft.weekdays,i+1].sort():draft.weekdays.filter(d=>d!==i+1))}/>{name}</label>)}</div></fieldset>
   <label className="block text-sm font-medium">Support instructions / relevant evidence (optional)<textarea rows={3} className={input} value={draft.notes} onChange={e=>set("notes",e.target.value)} placeholder="What the person needs, preferences, equipment or safety considerations"/></label>
   <p className="text-xs text-slate-600">Changes to confirmed needs require a new confirmation. Existing allocated shifts are not silently rewritten.</p>
   <button disabled={saving} type="submit" className="rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving…":draft.id?"Save changes":"Save support need"}</button>
  </form>}
 </section>;
}
