"use client";

import { FormEvent, useEffect, useState } from "react";
import { listAssignedServiceUsers, submitConfidentialSafeguardingReport, type AssignedServiceUser } from "@/lib/care/support-reporting/api";

export default function ConfidentialSafeguardingReportForm() {
  const [serviceUsers, setServiceUsers] = useState<AssignedServiceUser[]>([]);
  const [serviceUserId, setServiceUserId] = useState("");
  const [summary, setSummary] = useState("");
  const [happenedAt, setHappenedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [immediateDanger, setImmediateDanger] = useState("");
  const [location, setLocation] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    listAssignedServiceUsers().then(setServiceUsers).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!serviceUserId || !summary.trim()) {
      setMessage("Select a service user and record the factual concern.");
      return;
    }
    setSaving(true);
    try {
      await submitConfidentialSafeguardingReport({ serviceUserId, concernSummary: summary, happenedAt: new Date(happenedAt).toISOString(), immediateDanger, location, anonymous });
      setMessage("Your confidential report has been sent to the safeguarding manager.");
      setSummary(""); setImmediateDanger(""); setLocation(""); setAnonymous(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The report could not be sent.");
    } finally { setSaving(false); }
  }

  return <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div><h2 className="text-xl font-bold text-slate-950">Confidential safeguarding report</h2><p className="mt-1 text-sm text-slate-600">Record facts only. This is sent privately to the safeguarding manager and is not added to the service user timeline.</p></div>
    <label className="block text-sm font-medium text-slate-800">Service user<select value={serviceUserId} onChange={(e) => setServiceUserId(e.target.value)} disabled={loading || saving} className="mt-1 block w-full rounded-xl border border-slate-300 p-3"><option value="">Select service user</option>{serviceUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}{user.house_name ? ` — ${user.house_name}` : ""}</option>)}</select></label>
    <label className="block text-sm font-medium text-slate-800">When did this happen?<input type="datetime-local" value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} required disabled={saving} className="mt-1 block w-full rounded-xl border border-slate-300 p-3" /></label>
    <label className="block text-sm font-medium text-slate-800">What did you see, hear or notice?<textarea value={summary} onChange={(e) => setSummary(e.target.value)} required rows={6} disabled={saving} className="mt-1 block w-full rounded-xl border border-slate-300 p-3" placeholder="Use factual, observable information. Do not assess the risk or draw conclusions." /></label>
    <label className="block text-sm font-medium text-slate-800">Immediate danger or action taken (optional)<textarea value={immediateDanger} onChange={(e) => setImmediateDanger(e.target.value)} rows={3} disabled={saving} className="mt-1 block w-full rounded-xl border border-slate-300 p-3" /></label>
    <label className="block text-sm font-medium text-slate-800">Location (optional)<input value={location} onChange={(e) => setLocation(e.target.value)} disabled={saving} className="mt-1 block w-full rounded-xl border border-slate-300 p-3" /></label>
    <label className="flex gap-3 text-sm text-slate-700"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} disabled={saving} /> Do not show my name to the safeguarding manager</label>
    {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
    <button type="submit" disabled={saving || loading} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Sending…" : "Send confidential report"}</button>
  </form>;
}
