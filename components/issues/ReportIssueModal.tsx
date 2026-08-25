"use client";

import { AlertTriangle, Bug, Loader2, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CastodiaButton } from "@/components/castodia";

type Category = "technical" | "bug" | "access" | "account" | "feature_request" | "billing" | "security" | "other";
type Urgency = "low" | "medium" | "high" | "urgent";
type Props = { open: boolean; onClose: () => void };
type ApiResult = { error?: string; ticket?: { id: string; ticket_number: number } };

const categories: Array<{ value: Category; label: string }> = [
  { value: "technical", label: "Technical problem" },
  { value: "bug", label: "Something is not working" },
  { value: "access", label: "Access or permissions" },
  { value: "account", label: "Account problem" },
  { value: "feature_request", label: "Feature request" },
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security concern" },
  { value: "other", label: "Other" },
];

async function readJson(response: Response): Promise<ApiResult> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    console.error("Non-JSON issue response:", body.slice(0, 500));
    throw new Error(`The issue API returned ${response.status} instead of JSON.`);
  }
  return response.json() as Promise<ApiResult>;
}

export function ReportIssueModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("technical");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [affectedArea, setAffectedArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);

  function reset() {
    setTitle(""); setDescription(""); setCategory("technical");
    setUrgency("medium"); setAffectedArea(""); setTicketNumber(null);
  }

  function close() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function submitIssue() {
    if (!title.trim()) return alert("Enter a short title for the issue.");
    if (!description.trim()) return alert("Describe what happened.");

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("You must be signed in.");

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          urgency,
          affectedArea: affectedArea.trim() || null,
        }),
      });

      const result = await readJson(response);
      if (!response.ok || !result.ticket) throw new Error(result.error || "The issue could not be submitted.");
      setTicketNumber(result.ticket.ticket_number);
    } catch (error) {
      alert(error instanceof Error ? error.message : "The issue could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => { if (!open) reset(); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700"><Bug className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-semibold text-slate-950">Report an issue</h2><p className="mt-1 text-sm text-slate-500">Send a problem or request to the CastodiaCore team.</p></div>
          </div>
          <button type="button" onClick={close} disabled={submitting} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        {ticketNumber ? (
          <div className="p-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3"><Send className="mt-0.5 h-5 w-5 text-emerald-700" /><div><h3 className="font-semibold text-emerald-950">Ticket #{ticketNumber} submitted</h3><p className="mt-2 text-sm text-emerald-800">The CastodiaCore team can now investigate the issue.</p></div></div>
            </div>
            <div className="mt-6 flex justify-end"><CastodiaButton onClick={close}>Done</CastodiaButton></div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 p-6">
              <label className="text-sm font-medium text-slate-700">Issue title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900" /></label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">Category<select value={category} onChange={(e) => setCategory(e.target.value as Category)} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900">{categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
                <label className="text-sm font-medium text-slate-700">How urgent is it?<select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
              </div>
              <label className="text-sm font-medium text-slate-700">Affected area<input value={affectedArea} onChange={(e) => setAffectedArea(e.target.value)} maxLength={160} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700">What happened?<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} disabled={submitting} className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-900" /></label>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-amber-800">Avoid including service-user health information, medication details or other sensitive care data.</p></div></div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5"><button type="button" onClick={close} disabled={submitting} className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancel</button><CastodiaButton onClick={submitIssue} disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : <><Send className="h-4 w-4" />Submit Ticket</>}</CastodiaButton></div>
          </>
        )}
      </div>
    </div>
  );
}
