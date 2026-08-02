"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileArchive,
  FileCheck2,
  FileSearch,
  FolderSearch2,
  ListChecks,
  Map,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  CastodiaBadge,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type ComplianceItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  badge?: string;
};

const assuranceItems: ComplianceItem[] = [
  {
    title: "Incident Reviews",
    description:
      "Review behaviour incidents and record management oversight, outcomes and lessons learned.",
    href: "/manager/incidents",
    icon: AlertTriangle,
    available: true,
  },
  {
    title: "Audits",
    description:
      "Complete and review medication, care, health and safety, environmental and governance audits.",
    href: "/manager/compliance/audits",
    icon: ClipboardCheck,
    available: false,
  },
  {
    title: "Policies",
    description:
      "Manage organisational policies, review dates, versions and staff acknowledgement.",
    href: "/manager/compliance/policies",
    icon: BookOpenCheck,
    available: false,
  },
];

const readinessItems: ComplianceItem[] = [
  {
    title: "Quality Statements",
    description:
      "Review evidence and readiness against the relevant CQC quality statements.",
    href: "/manager/compliance/quality-statements",
    icon: ShieldCheck,
    available: false,
  },
  {
    title: "Evidence Map",
    description:
      "See which Castodia records support each quality statement and where evidence is missing.",
    href: "/manager/compliance/evidence-map",
    icon: Map,
    available: false,
  },
  {
    title: "Inspection Risks",
    description:
      "Identify gaps, overdue requirements and weaknesses that could affect inspection readiness.",
    href: "/manager/compliance/inspection-risks",
    icon: ShieldAlert,
    available: false,
  },
  {
    title: "CQC Evidence",
    description:
      "Browse the evidence available across care records, staffing, safeguarding and governance.",
    href: "/manager/compliance/cqc-evidence",
    icon: FolderSearch2,
    available: false,
  },
];

const improvementItems: ComplianceItem[] = [
  {
    title: "Improvement Plan",
    description:
      "Turn identified risks and evidence gaps into assigned, monitored improvement actions.",
    href: "/manager/compliance/improvement-plan",
    icon: Target,
    available: false,
  },
  {
    title: "Inspection Pack",
    description:
      "Prepare an organised inspection bundle containing evidence, audits, actions and service information.",
    href: "/manager/compliance/inspection-pack",
    icon: FileArchive,
    available: false,
  },
];

function ComplianceHubCard({
  item,
  pendingReviews,
}: {
  item: ComplianceItem;
  pendingReviews?: number;
}) {
  const Icon = item.icon;

  const content = (
    <CastodiaCard interactive={item.available}>
      <div className="flex h-full items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              {item.title}
            </h2>

            {item.available ? (
              <CastodiaBadge variant="success">Available</CastodiaBadge>
            ) : (
              <CastodiaBadge variant="neutral">Planned</CastodiaBadge>
            )}

            {item.title === "Incident Reviews" &&
              typeof pendingReviews === "number" &&
              pendingReviews > 0 && (
                <CastodiaBadge variant="warning">
                  {pendingReviews} awaiting review
                </CastodiaBadge>
              )}

            {item.badge && (
              <CastodiaBadge variant="neutral">{item.badge}</CastodiaBadge>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
              item.available ? "text-teal-700" : "text-slate-400"
            }`}
          >
            {item.available ? "Open" : "Coming later"}
            {item.available && <ArrowRight size={16} />}
          </div>
        </div>
      </div>
    </CastodiaCard>
  );

  if (!item.available) {
    return <div className="h-full">{content}</div>;
  }

  return (
    <Link href={item.href} className="block h-full">
      {content}
    </Link>
  );
}

function ComplianceSection({
  title,
  description,
  items,
  pendingReviews,
}: {
  title: string;
  description: string;
  items: ComplianceItem[];
  pendingReviews?: number;
}) {
  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ComplianceHubCard
            key={item.title}
            item={item}
            pendingReviews={pendingReviews}
          />
        ))}
      </div>
    </section>
  );
}

export default function CompliancePage() {
  const [pendingIncidentReviews, setPendingIncidentReviews] = useState<
    number | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadPendingReviews() {
      const { count, error } = await supabase
        .from("timeline_entries")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("entry_type", "Behaviour Incident")
        .eq("reviewed", false);

      if (!active) return;

      if (error) {
        console.error(
          "Unable to load outstanding incident reviews:",
          error.message
        );
        setPendingIncidentReviews(null);
        return;
      }

      setPendingIncidentReviews(count ?? 0);
    }

    loadPendingReviews();

    return () => {
      active = false;
    };
  }, []);

  return (
    <CastodiaPageShell
      title="Compliance"
      description="Manage governance, review evidence and prepare your service for inspection."
      maxWidth="wide"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <CastodiaCard padding="md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Awaiting review</p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {pendingIncidentReviews === null
                  ? "—"
                  : pendingIncidentReviews}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Behaviour incidents requiring oversight
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle size={20} />
            </div>
          </div>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Quality framework</p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                CQC Quality Statements
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Evidence-led inspection preparation
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Scale size={20} />
            </div>
          </div>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Readiness indicator</p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                Available in Insights
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Compliance provides the evidence behind the score
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Sparkles size={20} />
            </div>
          </div>
        </CastodiaCard>
      </section>

      <CastodiaCard padding="md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FileSearch size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Evidence, not a predicted CQC rating
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Compliance brings together the records supporting Castodia&apos;s
              inspection-readiness indicator. The overall score belongs in
              Insights, while this hub explains the evidence, gaps, risks and
              actions behind it.
            </p>
          </div>
        </div>
      </CastodiaCard>

      <div className="space-y-10">
        <ComplianceSection
          title="Operational assurance"
          description="Complete management reviews and maintain the core governance controls used across the service."
          items={assuranceItems}
          pendingReviews={pendingIncidentReviews ?? undefined}
        />

        <ComplianceSection
          title="CQC readiness"
          description="Understand what evidence exists, how it supports the quality statements and where inspection risks remain."
          items={readinessItems}
        />

        <ComplianceSection
          title="Improvement and inspection"
          description="Act on identified weaknesses and organise the evidence needed during an inspection."
          items={improvementItems}
        />
      </div>

      <CastodiaCard padding="md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                How the compliance workflow fits together
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Reviews and audits create evidence. The evidence map connects
                that information to quality statements. Identified gaps become
                inspection risks and improvement-plan actions.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-500">
            <ListChecks size={17} />
            Evidence-led governance
          </div>
        </div>
      </CastodiaCard>
    </CastodiaPageShell>
  );
}