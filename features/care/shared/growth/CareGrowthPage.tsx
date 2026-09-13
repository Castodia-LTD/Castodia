"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Flag, Loader2, Plus, Target } from "lucide-react";

import { CastodiaBadge, CastodiaButton, CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";
import { createGrowthGoal, linkGrowthEvidence, recordGrowthGoalReview, setGrowthEvidenceFamilyVisibility, unlinkGrowthEvidence, updateGrowthGoal } from "@/lib/growth/goals";
import { loadGrowthOverview } from "@/lib/growth/queries";
import {
  GROWTH_DOMAIN_LABELS,
  GROWTH_DOMAINS,
  type GrowthDomain,
  type GrowthGoal,
  type GrowthGoalStatus,
  type GrowthOverview,
} from "@/lib/growth/types";
import { supabase } from "@/lib/supabase";

type Props = { portal: "manager" | "support" };
type GoalForm = {
  title: string; desiredOutcome: string; supportApproach: string; domain: GrowthDomain;
  status: GrowthGoalStatus; startDate: string; targetDate: string; familyVisible: boolean;
  reviewNote: string;
};

const blankGoal = (): GoalForm => ({
  title: "", desiredOutcome: "", supportApproach: "",
  domain: "personal_choice_and_confidence", status: "active",
  startDate: new Date().toISOString().slice(0, 10), targetDate: "", familyVisible: false, reviewNote: "",
});

const statusVariant = (status: GrowthGoalStatus) =>
  status === "achieved" ? "success" : status === "paused" ? "warning" : status === "closed" ? "neutral" : "info";

export default function CareGrowthPage({ portal }: Props) {
  const { id = "" } = useParams<{ id: string }>();
  const [overview, setOverview] = useState<GrowthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GrowthGoal | "new" | null>(null);
  const [form, setForm] = useState<GoalForm>(blankGoal);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setOverview(await loadGrowthOverview(supabase, id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Growth could not be loaded."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    // Loading remote state is the purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const active = useMemo(() => overview?.goals.filter((goal) => ["draft", "active", "paused"].includes(goal.status)) ?? [], [overview]);
  const history = useMemo(() => overview?.goals.filter((goal) => ["achieved", "closed"].includes(goal.status)) ?? [], [overview]);
  const attention = active.filter((goal) => goal.targetDate && goal.targetDate < new Date().toISOString().slice(0, 10));

  function openGoal(goal?: GrowthGoal) {
    setEditing(goal ?? "new");
    setForm(goal ? {
      title: goal.title, desiredOutcome: goal.desiredOutcome ?? "", supportApproach: goal.supportApproach ?? "",
      domain: goal.domain, status: goal.status, startDate: goal.startDate,
      targetDate: goal.targetDate ?? "", familyVisible: goal.familyVisible, reviewNote: "",
    } : blankGoal());
  }

  async function saveGoal() {
    if (!form.title.trim()) { setError("Give the goal a clear title."); return; }
    setSaving(true); setError(null);
    try {
      if (editing === "new") {
        await createGrowthGoal(supabase, {
          serviceUserId: id, title: form.title.trim(), desiredOutcome: form.desiredOutcome,
          supportApproach: form.supportApproach, domain: form.domain,
          status: form.status === "draft" ? "draft" : "active", startDate: form.startDate,
          targetDate: form.targetDate || null,
        });
      } else if (editing) {
        await updateGrowthGoal(supabase, {
          goalId: editing.id, title: form.title.trim(), desiredOutcome: form.desiredOutcome,
          supportApproach: form.supportApproach, domain: form.domain, status: form.status,
          startDate: form.startDate, targetDate: form.targetDate || null,
          familyVisible: form.familyVisible,
        });
        if (form.reviewNote.trim()) await recordGrowthGoalReview(supabase, editing.id, form.reviewNote.trim());
      }
      setEditing(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The goal could not be saved."); }
    finally { setSaving(false); }
  }

  async function changeStatus(goal: GrowthGoal, status: GrowthGoalStatus) {
    setSaving(true); setError(null);
    try {
      await updateGrowthGoal(supabase, {
        goalId: goal.id, title: goal.title, desiredOutcome: goal.desiredOutcome,
        supportApproach: goal.supportApproach, domain: goal.domain, status,
        startDate: goal.startDate, targetDate: goal.targetDate, familyVisible: goal.familyVisible,
      });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The status could not be changed."); }
    finally { setSaving(false); }
  }

  async function governEvidence(evidenceId: string, action: "share" | "hide" | "unlink") {
    setSaving(true); setError(null);
    try {
      if (action === "unlink") await unlinkGrowthEvidence(supabase, evidenceId);
      else await setGrowthEvidenceFamilyVisibility(supabase, evidenceId, action === "share");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Evidence could not be updated."); }
    finally { setSaving(false); }
  }

  async function linkEvidence(observationId: string, goalId: string) {
    if (!goalId || !overview) return;
    setSaving(true); setError(null);
    try {
      await linkGrowthEvidence(supabase, { organisationId: overview.goals.find((goal) => goal.id === goalId)?.organisationId ?? "", goalId, observationId });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Evidence could not be linked."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-72 items-center justify-center gap-3 text-slate-600"><Loader2 className="animate-spin text-teal-600" /> Loading Growth…</div>;
  if (!overview) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">{error ?? "Growth is unavailable."}</div>;

  return (
    <CastodiaPageShell title="Growth" description={`What matters now for ${overview.person.fullName}.`} maxWidth="wide">
      <ServiceUserHubHeader id={overview.person.id} fullName={overview.person.fullName}
        houseName={overview.person.houseName} dob={overview.person.dateOfBirth}
        photoPath={overview.person.photoPath} portal={portal} />

      {error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

      <section className="rounded-[28px] bg-gradient-to-br from-teal-700 via-cyan-700 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">What matters now</p>
            <h2 className="mt-2 text-2xl font-semibold">{active[0]?.title ?? "Ready to agree the first meaningful goal"}</h2>
            <p className="mt-2 leading-7 text-cyan-50/90">{active[0]?.desiredOutcome ?? "Use Growth to keep the person's choices, ambitions and everyday progress visible."}</p>
          </div>
          <CastodiaButton onClick={() => openGoal()} className="bg-white text-teal-800 hover:bg-cyan-50"><Plus size={17} /> Add goal</CastodiaButton>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Metric label="Active goals" value={active.length} /><Metric label="Recent progress" value={overview.observations.length} /><Metric label="Need attention" value={attention.length} />
        </div>
      </section>

      <section><div className="mb-4 flex items-center gap-2"><Target className="text-teal-600" /><h2 className="text-xl font-semibold text-slate-950">Active goals</h2></div>
        {active.length ? <div className="grid gap-4 lg:grid-cols-2">{active.map((goal) => <GoalCard key={goal.id} goal={goal} portal={portal} observations={overview.observations.filter((item) => item.goalIds.includes(goal.id))} onEdit={() => openGoal(goal)} onStatus={(status) => void changeStatus(goal, status)} disabled={saving} />)}</div>
          : <CastodiaCard><p className="text-sm text-slate-600">No active goals have been agreed yet.</p></CastodiaCard>}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div><div className="mb-4 flex items-center gap-2"><Flag className="text-cyan-600" /><h2 className="text-xl font-semibold text-slate-950">Recent progress and milestones</h2></div>
          <div className="space-y-3">{overview.observations.length ? overview.observations.slice(0, 8).map((item) => <CastodiaCard key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.summary || GROWTH_DOMAIN_LABELS[item.domain]}</p><p className="mt-1 text-sm text-slate-500">{new Date(item.occurredAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p></div><CastodiaBadge variant={item.progressType === "barrier" ? "warning" : item.progressType === "milestone" ? "success" : "info"}>{item.progressType}</CastodiaBadge></div>{portal === "manager" ? <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">{item.evidenceLinks.map((link) => <div key={link.id} className="flex gap-2"><CastodiaButton size="sm" variant="secondary" disabled={saving} onClick={() => void governEvidence(link.id, link.familyVisible ? "hide" : "share")}>{link.familyVisible ? "Hide from Family" : "Share with Family"}</CastodiaButton><CastodiaButton size="sm" variant="ghost" disabled={saving} onClick={() => void governEvidence(link.id, "unlink")}>Unlink</CastodiaButton></div>)}{active.some((goal) => !item.goalIds.includes(goal.id)) ? <select aria-label="Link evidence to another goal" defaultValue="" disabled={saving} onChange={(event) => { void linkEvidence(item.id, event.target.value); event.currentTarget.value = ""; }} className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"><option value="" disabled>Link to goal…</option>{active.filter((goal) => !item.goalIds.includes(goal.id)).map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select> : null}</div> : null}</CastodiaCard>) : <CastodiaCard><p className="text-sm text-slate-600">Progress recorded through daily support will appear here.</p></CastodiaCard>}</div>
        </div>
        <div><div className="mb-4 flex items-center gap-2"><AlertTriangle className="text-amber-600" /><h2 className="text-xl font-semibold text-slate-950">Areas needing attention</h2></div>
          <div className="space-y-3">{attention.length ? attention.map((goal) => <CastodiaCard key={goal.id}><p className="font-semibold text-slate-900">{goal.title}</p><p className="mt-1 text-sm text-amber-700">Target date has passed: {new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString("en-GB")}</p></CastodiaCard>) : <CastodiaCard><p className="text-sm text-slate-600">There are no overdue active goals.</p></CastodiaCard>}</div>
        </div>
      </section>

      {history.length ? <details className="rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-semibold text-slate-900">Achieved and closed goals ({history.length})</summary><div className="mt-4 grid gap-3 lg:grid-cols-2">{history.map((goal) => <GoalCard key={goal.id} goal={goal} portal={portal} observations={[]} onEdit={() => openGoal(goal)} onStatus={(status) => void changeStatus(goal, status)} disabled={saving} />)}</div></details> : null}

      {editing && (portal === "manager" || editing === "new") ? <GoalEditor portal={portal} form={form} setForm={setForm} editing={editing} saving={saving} onCancel={() => setEditing(null)} onSave={() => void saveGoal()} /> : null}
    </CastodiaPageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-cyan-50/80">{label}</p></div>; }

function GoalCard({ goal, portal, observations, onEdit, onStatus, disabled }: { goal: GrowthGoal; portal: Props["portal"]; observations: GrowthOverview["observations"]; onEdit: () => void; onStatus: (status: GrowthGoalStatus) => void; disabled: boolean }) {
  return <CastodiaCard className="h-full"><div className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{GROWTH_DOMAIN_LABELS[goal.domain]}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{goal.title}</h3></div><CastodiaBadge variant={statusVariant(goal.status)}>{goal.status}</CastodiaBadge></div>
    {goal.desiredOutcome ? <p className="mt-3 text-sm leading-6 text-slate-600">{goal.desiredOutcome}</p> : null}
    {goal.supportApproach ? <div className="mt-4 rounded-xl bg-cyan-50 p-3"><p className="text-xs font-semibold uppercase text-cyan-800">How to support this</p><p className="mt-1 text-sm text-cyan-950">{goal.supportApproach}</p></div> : null}
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500"><span>{observations.length} evidence item{observations.length === 1 ? "" : "s"}</span>{goal.targetDate ? <span>• Target {new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString("en-GB")}</span> : null}{goal.familyVisible ? <span>• Shared with Family</span> : null}</div>
    {portal === "manager" ? <div className="mt-auto flex flex-wrap gap-2 pt-5"><CastodiaButton size="sm" variant="secondary" onClick={onEdit}>Edit</CastodiaButton>{goal.status === "active" ? <CastodiaButton size="sm" variant="secondary" disabled={disabled} onClick={() => onStatus("paused")}>Pause</CastodiaButton> : null}{goal.status === "paused" ? <CastodiaButton size="sm" variant="secondary" disabled={disabled} onClick={() => onStatus("active")}>Activate</CastodiaButton> : null}{!["achieved", "closed"].includes(goal.status) ? <CastodiaButton size="sm" variant="success" disabled={disabled} onClick={() => onStatus("achieved")}><CheckCircle2 size={15} /> Achieved</CastodiaButton> : null}{goal.status !== "closed" ? <CastodiaButton size="sm" variant="ghost" disabled={disabled} onClick={() => onStatus("closed")}>Close</CastodiaButton> : null}</div> : null}
  </div></CastodiaCard>;
}

function GoalEditor({ portal, form, setForm, editing, saving, onCancel, onSave }: { portal: Props["portal"]; form: GoalForm; setForm: React.Dispatch<React.SetStateAction<GoalForm>>; editing: GrowthGoal | "new"; saving: boolean; onCancel: () => void; onSave: () => void }) {
  const field = (key: keyof GoalForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"><div role="dialog" aria-modal="true" aria-labelledby="growth-goal-title" className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-600">{portal === "manager" ? "Manager" : "Support"} Growth</p><h2 id="growth-goal-title" className="mt-1 text-2xl font-semibold text-slate-950">{editing === "new" ? "Agree a new goal" : "Update goal"}</h2></div><CastodiaButton variant="ghost" onClick={onCancel}>Cancel</CastodiaButton></div>
    <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Goal title<input value={form.title} onChange={(event) => field("title", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Desired outcome<textarea value={form.desiredOutcome} onChange={(event) => field("desiredOutcome", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Practical support approach<textarea value={form.supportApproach} onChange={(event) => field("supportApproach", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Growth area<select value={form.domain} onChange={(event) => field("domain", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal">{GROWTH_DOMAINS.map((domain) => <option key={domain} value={domain}>{GROWTH_DOMAIN_LABELS[domain]}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Status<select value={form.status} disabled={editing === "new"} onChange={(event) => field("status", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="achieved">Achieved</option><option value="closed">Closed</option></select></label><label className="text-sm font-semibold text-slate-700">Start date<input type="date" value={form.startDate} onChange={(event) => field("startDate", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Target date<input type="date" value={form.targetDate} onChange={(event) => field("targetDate", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>{editing !== "new" ? <><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Manager progress review (optional)<textarea value={form.reviewNote} onChange={(event) => field("reviewNote", event.target.value)} rows={3} placeholder="Record your review without changing the original evidence" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label><label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f3f6ef] p-4 text-sm text-slate-700"><input type="checkbox" checked={form.familyVisible} onChange={(event) => field("familyVisible", event.target.checked)} className="mt-1 h-4 w-4" /><span><strong className="block text-slate-900">Share this goal with Family</strong>Only the goal is shared. Evidence still needs separate approval.</span></label></> : null}</div>
    <div className="mt-6 flex justify-end gap-3"><CastodiaButton variant="secondary" onClick={onCancel}>Cancel</CastodiaButton><CastodiaButton disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save goal"}</CastodiaButton></div></div></div>;
}
