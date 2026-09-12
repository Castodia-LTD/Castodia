"use client";

import { useEffect, useState } from "react";
import { Flag, Heart, Loader2, Sparkles } from "lucide-react";

import { getCurrentFamilyUser } from "@/lib/family/getCurrentFamilyUser";
import { loadFamilyGrowthOverview } from "@/lib/growth/queries";
import { GROWTH_DOMAIN_LABELS, type GrowthOverview } from "@/lib/growth/types";
import { supabase } from "@/lib/supabase";

export default function FamilyGrowthPage() {
  const [overview, setOverview] = useState<GrowthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCurrentFamilyUser().then((family) => {
      const name = family.service_user.first_name?.trim() || family.service_user.full_name?.trim() || "your relative";
      return loadFamilyGrowthOverview(supabase, family.service_user_id, name);
    }).then((data) => { if (mounted) setOverview(data); })
      .catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : "Growth could not be loaded."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="flex min-h-[420px] items-center justify-center gap-3 text-[#61745f]"><Loader2 className="animate-spin" /> Loading Growth…</div>;
  if (error || !overview) return <div className="rounded-[28px] border border-[#decfc0] bg-[#fff8f2] p-6 text-[#795b4c]">{error ?? "Growth is unavailable."}</div>;
  const active = overview.goals.filter((goal) => goal.status === "active");
  const achieved = overview.goals.filter((goal) => goal.status === "achieved");

  return <div className="space-y-8">
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#526b55] via-[#667b60] to-[#405846] p-7 text-white shadow-[0_22px_60px_rgba(57,76,61,0.18)] sm:p-10"><div className="max-w-3xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Sparkles /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#e2eadc]">Growth</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Celebrating what matters to {overview.person.fullName}</h1><p className="mt-4 max-w-2xl leading-7 text-[#edf2e9]">A gentle view of the goals, everyday steps and milestones that have been chosen to share with you.</p></div></section>

    {!active.length ? <section className="rounded-[28px] border border-[#ddd4c7] bg-white/65 p-8 text-center shadow-sm"><Heart className="mx-auto text-[#71826b]" /><h2 className="mt-4 text-xl font-semibold text-[#3e4c42]">Nothing has been shared here yet</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#756d63]">When the care team and {overview.person.fullName} choose to share a goal, it will appear here.</p></section> : <section><h2 className="text-2xl font-semibold text-[#3d4b40]">What matters now</h2><div className="mt-4 grid gap-5 lg:grid-cols-2">{active.map((goal) => { const progress = overview.observations.filter((item) => item.goalIds.includes(goal.id)); return <article key={goal.id} className="rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_12px_40px_rgba(74,83,69,0.08)] backdrop-blur-xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#697d65]">{GROWTH_DOMAIN_LABELS[goal.domain]}</p><h3 className="mt-2 text-xl font-semibold text-[#34423b]">{goal.title}</h3>{goal.desiredOutcome ? <p className="mt-3 leading-7 text-[#665f56]">{goal.desiredOutcome}</p> : null}<div className="mt-5 border-t border-[#e4ddd1] pt-4"><p className="text-sm font-semibold text-[#526455]">Recent moments</p>{progress.length ? <div className="mt-3 space-y-3">{progress.slice(0, 3).map((item) => <div key={item.id} className="rounded-2xl bg-[#f1f4ec] p-4"><div className="flex items-start gap-3"><Flag className="mt-0.5 h-4 w-4 shrink-0 text-[#75886e]" /><div><p className="text-sm leading-6 text-[#4e5a50]">{item.summary || "A positive step was recorded."}</p><p className="mt-1 text-xs text-[#877e72]">{new Date(item.occurredAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</p></div></div></div>)}</div> : <p className="mt-2 text-sm text-[#7d756b]">The first shared progress moment will appear here.</p>}</div></article>; })}</div></section>}

    {achieved.length ? <section><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#dfe9d8] p-3 text-[#526b55]"><Heart /></div><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#74806f]">Worth celebrating</p><h2 className="text-2xl font-semibold text-[#3d4b40]">Milestones reached</h2></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{achieved.map((goal) => <article key={goal.id} className="rounded-[24px] border border-[#d9dfd0] bg-[#f3f6ef] p-5"><Sparkles className="text-[#71826b]" /><h3 className="mt-3 font-semibold text-[#3d4b40]">{goal.title}</h3>{goal.desiredOutcome ? <p className="mt-2 text-sm leading-6 text-[#6c7166]">{goal.desiredOutcome}</p> : null}</article>)}</div></section> : null}
  </div>;
}
