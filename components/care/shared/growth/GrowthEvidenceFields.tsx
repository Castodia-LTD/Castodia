"use client";

import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

import { GROWTH_DOMAIN_LABELS, GROWTH_DOMAINS, type GrowthGoal } from "@/lib/growth/types";
import { supabase } from "@/lib/supabase";

const supported = new Set(["Activity", "Community Access", "Social Interaction", "Household Tasks", "Shopping", "Health Observation"]);

type GrowthFormController = {
  growthEnabled: boolean;
  setGrowthEnabled: (value: boolean) => void;
  growthGoalIds: string[];
  setGrowthGoalIds: (update: (current: string[]) => string[]) => void;
  growthDomain: string;
  setGrowthDomain: (value: string) => void;
  growthProgressType: string;
  setGrowthProgressType: (value: string) => void;
  growthSummary: string;
  setGrowthSummary: (value: string) => void;
};

export function GrowthEvidenceFields({ serviceUserId, entryType, form }: { serviceUserId: string; entryType: string; form: GrowthFormController }) {
  const [goals, setGoals] = useState<GrowthGoal[]>([]);
  useEffect(() => {
    let mounted = true;
    if (!supported.has(entryType)) return;
    void supabase.from("growth_goals").select("*").eq("service_user_id", serviceUserId).eq("status", "active")
      .order("target_date", { ascending: true }).then(({ data }) => {
        if (!mounted) return;
        setGoals((data ?? []).map((row) => ({
          id: row.id, organisationId: row.organisation_id, serviceUserId: row.service_user_id,
          title: row.title, desiredOutcome: row.desired_outcome, supportApproach: row.support_approach,
          domain: row.domain, status: row.status, startDate: row.start_date, targetDate: row.target_date,
          achievedAt: row.achieved_at, familyVisible: row.family_visible, sourceType: row.source_type,
          sourceReviewId: row.source_review_id, sourceExternalId: row.source_external_id,
        })));
      });
    return () => { mounted = false; };
  }, [entryType, serviceUserId]);

  if (!supported.has(entryType) || goals.length === 0) return null;
  const toggleGoal = (id: string) => form.setGrowthGoalIds((current: string[]) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.growthEnabled} onChange={(event) => form.setGrowthEnabled(event.target.checked)} className="mt-1 h-4 w-4" /><span><span className="flex items-center gap-2 font-semibold text-teal-950"><Sprout size={17} /> This shows progress toward a goal</span><span className="mt-1 block text-sm text-teal-800">Optional—use this only when the record is genuinely relevant.</span></span></label>
    {form.growthEnabled ? <div className="mt-4 space-y-4 border-t border-teal-200 pt-4"><fieldset><legend className="text-sm font-semibold text-slate-800">Related goal</legend><div className="mt-2 space-y-2">{goals.map((goal) => <label key={goal.id} className="flex cursor-pointer gap-3 rounded-xl border border-white bg-white p-3 text-sm text-slate-700 shadow-sm"><input type="checkbox" checked={form.growthGoalIds.includes(goal.id)} onChange={() => toggleGoal(goal.id)} className="mt-0.5 h-4 w-4" /><span><strong className="block text-slate-900">{goal.title}</strong>{goal.supportApproach ? <span className="mt-1 block text-xs text-slate-500">{goal.supportApproach}</span> : null}</span></label>)}</div></fieldset><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Growth area<select value={form.growthDomain} onChange={(event) => form.setGrowthDomain(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal">{GROWTH_DOMAINS.map((domain) => <option key={domain} value={domain}>{GROWTH_DOMAIN_LABELS[domain]}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">What did this show?<select value={form.growthProgressType} onChange={(event) => form.setGrowthProgressType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal"><option value="progress">Progress</option><option value="maintained">Maintained</option><option value="barrier">Barrier</option><option value="milestone">Milestone</option></select></label></div><label className="block text-sm font-semibold text-slate-700">Short Growth summary<textarea value={form.growthSummary} onChange={(event) => form.setGrowthSummary(event.target.value)} rows={2} placeholder="What changed or mattered?" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal" /></label></div> : null}
  </section>;
}
