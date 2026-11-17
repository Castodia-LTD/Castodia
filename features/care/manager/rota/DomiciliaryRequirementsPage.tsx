"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";

const activityCodes = [
  ["personal_care", "Personal care"], ["medication", "Medication"],
  ["mobility_transfer", "Mobility and transfers"], ["nutrition", "Nutrition"],
  ["community_access", "Community access"], ["companionship", "Companionship"],
] as const;
type Activity = (typeof activityCodes)[number][0];
type Requirement = { id: string; title: string; activity_code: string; required_staff: number; duration_minutes: number; verified_at: string | null };
type Preference = { id: string; activity_code: string; strength: string; preference_kind: string; source_notes: string | null };

export default function DomiciliaryRequirementsPage({ personId }: { personId: string }) {
  const [organisationId, setOrganisationId] = useState("");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [activity, setActivity] = useState<Activity>("personal_care");
  const [title, setTitle] = useState("");
  const [staffCount, setStaffCount] = useState(1);
  const [duration, setDuration] = useState(60);
  const [preferenceActivity, setPreferenceActivity] = useState<Activity>("personal_care");
  const [preferenceStrength, setPreferenceStrength] = useState("mandatory");
  const [preferenceKind, setPreferenceKind] = useState("other");
  const [preferenceNotes, setPreferenceNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function reload() {
    const [a, b] = await Promise.all([
      supabase.from("domiciliary_activity_requirements").select("id,title,activity_code,required_staff,duration_minutes,verified_at").eq("service_user_id", personId).order("created_at", { ascending: false }),
      supabase.from("domiciliary_person_preferences").select("id,activity_code,strength,preference_kind,source_notes").eq("service_user_id", personId).order("created_at", { ascending: false }),
    ]);
    if (a.error || b.error) throw a.error || b.error;
    setRequirements((a.data ?? []) as Requirement[]);
    setPreferences((b.data ?? []) as Preference[]);
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Sign in required");
        const { data: profile, error: profileError } = await supabase.from("profiles").select("organisation_id,role").eq("id", auth.user.id).single();
        if (profileError || !profile?.organisation_id || !["manager","admin","castodia_owner","castodia_admin"].includes(profile.role)) throw new Error("Manager access required");
        const { data: person, error: personError } = await supabase.from("service_users").select("id").eq("id", personId).eq("organisation_id", profile.organisation_id).eq("care_model", "domiciliary").single();
        if (personError || !person) throw new Error("Domiciliary person not found");
        if (!active) return;
        setOrganisationId(profile.organisation_id);
        await reload();
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to load records"); }
    })();
    return () => { active = false; };
  }, [personId]);

  async function saveRequirement(event: React.FormEvent) {
    event.preventDefault();
    if (!organisationId || !title.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: saveError } = await supabase.from("domiciliary_activity_requirements").insert({
        organisation_id: organisationId, service_user_id: personId, title: title.trim(),
        activity_code: activity, required_staff: staffCount, duration_minutes: duration,
      });
      if (saveError) throw saveError;
      setTitle(""); await reload();
      setNotice("Requirement saved as unverified. A manager must confirm source evidence before scheduling.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save requirement"); }
    finally { setBusy(false); }
  }
  async function savePreference(event: React.FormEvent) {
    event.preventDefault();
    if (!organisationId || !preferenceNotes.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: saveError } = await supabase.from("domiciliary_person_preferences").insert({
        organisation_id: organisationId, service_user_id: personId,
        activity_code: preferenceActivity, strength: preferenceStrength,
        preference_kind: preferenceKind, expressed_by: "person", source_notes: preferenceNotes.trim(),
      });
      if (saveError) throw saveError;
      setPreferenceNotes(""); await reload();
      setNotice("Preference saved as unverified. Confirm the person's wishes and applicable scope.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save preference"); }
    finally { setBusy(false); }
  }
  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";
  return <CastodiaPageShell title="Domiciliary care requirements" description="Record structured visit activities and personal wishes. These records require verification before they can authorise scheduling." maxWidth="wide">
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-900">{notice}</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <CastodiaCard className="p-5">
        <h2 className="mb-3 text-lg font-semibold">Visit activity requirements</h2>
        <form onSubmit={saveRequirement} className="space-y-3">
          <label className="block text-sm">Activity<select className={input} value={activity} onChange={e => setActivity(e.target.value as Activity)}>{activityCodes.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <label className="block text-sm">Visit description<input className={input} value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} /></label>
          <label className="block text-sm">Staff required<input className={input} type="number" min={1} max={10} value={staffCount} onChange={e => setStaffCount(Number(e.target.value))} required /></label>
          <label className="block text-sm">Duration (minutes)<input className={input} type="number" min={5} max={1440} value={duration} onChange={e => setDuration(Number(e.target.value))} required /></label>
          <button disabled={busy || !organisationId} className="rounded-lg bg-cyan-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save draft requirement</button>
        </form>
        <ul className="mt-4 space-y-2">{requirements.map(r => <li key={r.id} className="rounded-lg border p-3 text-sm"><strong>{r.title}</strong><div>{r.activity_code} · {r.required_staff}:1 · {r.duration_minutes} minutes</div><div className="text-amber-800">{r.verified_at ? "Verified" : "Needs verification"}</div></li>)}</ul>
      </CastodiaCard>
      <CastodiaCard className="p-5">
        <h2 className="mb-3 text-lg font-semibold">Person's wishes and preferences</h2>
        <form onSubmit={savePreference} className="space-y-3">
          <label className="block text-sm">Applies to<select className={input} value={preferenceActivity} onChange={e => setPreferenceActivity(e.target.value as Activity)}>{activityCodes.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label>
          <label className="block text-sm">Priority<select className={input} value={preferenceStrength} onChange={e => setPreferenceStrength(e.target.value)}><option value="mandatory">Mandatory personal requirement</option><option value="strong">Strong preference</option><option value="general">General preference</option></select></label>
          <label className="block text-sm">Type<select className={input} value={preferenceKind} onChange={e => setPreferenceKind(e.target.value)}><option value="other">Other care preference</option><option value="continuity">Continuity / familiar staff</option></select></label>
          <label className="block text-sm">Person's expressed wishes and source<textarea className={input} rows={4} value={preferenceNotes} onChange={e => setPreferenceNotes(e.target.value)} required /></label>
          <button disabled={busy || !organisationId} className="rounded-lg bg-cyan-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save draft preference</button>
        </form>
        <ul className="mt-4 space-y-2">{preferences.map(p => <li key={p.id} className="rounded-lg border p-3 text-sm"><strong>{p.activity_code} · {p.strength}</strong><p className="whitespace-pre-wrap">{p.source_notes}</p><p className="text-amber-800">Requires structured verification before automated matching</p></li>)}</ul>
      </CastodiaCard>
    </div>
  </CastodiaPageShell>;
}
