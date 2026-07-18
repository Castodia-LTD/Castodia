"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

import type {
  StaffCompetency,
  StaffMember,
} from "@/lib/admin/competencies/types";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
};

type MatrixStatus = "competent" | "due-soon" | "overdue" | "not-started" | "actions";

const defaultCompetencyTypes = [
  "Medication Administration",
  "Moving & Handling",
  "Safeguarding",
  "Fire Safety",
];

function getStatus(competency?: StaffCompetency): MatrixStatus {
  if (!competency) return "not-started";

  if (competency.outcome === "Competent With Actions") return "actions";
  if (competency.outcome !== "Competent") return "overdue";

  if (!competency.review_date) return "competent";

  const today = new Date();
  const reviewDate = new Date(competency.review_date);
  const daysUntilReview = Math.ceil(
    (reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilReview < 0) return "overdue";
  if (daysUntilReview <= 30) return "due-soon";

  return "competent";
}

function getStatusLabel(status: MatrixStatus) {
  if (status === "competent") return "Competent";
  if (status === "due-soon") return "Due soon";
  if (status === "overdue") return "Overdue";
  if (status === "actions") return "Actions";
  return "Not started";
}

function getStatusVariant(status: MatrixStatus) {
  if (status === "competent") return "success";
  if (status === "due-soon") return "warning";
  if (status === "overdue") return "danger";
  if (status === "actions") return "info";
  return "neutral";
}

export default function CompetenciesPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [competencies, setCompetencies] = useState<StaffCompetency[]>([]);
  const [loading, setLoading] = useState(true);

  async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, organisation_id, full_name, role")
      .eq("id", user.id)
      .single();

    if (error || !data?.organisation_id) {
      alert("Organisation not found.");
      return null;
    }

    return data;
  }

  async function loadPageData() {
    setLoading(true);

    const profile = await getCurrentUserProfile();

    if (!profile) {
      setLoading(false);
      return;
    }

    const [staffResult, competencyResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("organisation_id", profile.organisation_id)
        .order("full_name"),

      supabase
        .from("staff_competencies")
        .select("*")
        .eq("organisation_id", profile.organisation_id)
        .order("assessment_date", { ascending: false }),
    ]);

    if (staffResult.error) {
      alert(staffResult.error.message);
      setLoading(false);
      return;
    }

    if (competencyResult.error) {
      alert(competencyResult.error.message);
      setLoading(false);
      return;
    }

    setStaff(staffResult.data || []);
    setCompetencies((competencyResult.data || []) as StaffCompetency[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const competencyTypes = useMemo(() => {
    const discovered = competencies.map((item) => item.competency_type);
    return Array.from(new Set([...defaultCompetencyTypes, ...discovered]));
  }, [competencies]);

  const latestCompetencyMap = useMemo(() => {
    const map = new Map<string, StaffCompetency>();

    competencies.forEach((competency) => {
      const key = `${competency.staff_id}:${competency.competency_type}`;

      if (!map.has(key)) {
        map.set(key, competency);
      }
    });

    return map;
  }, [competencies]);

  const summary = useMemo(() => {
    let competent = 0;
    let dueSoon = 0;
    let overdue = 0;
    let notStarted = 0;
    let actions = 0;

    staff.forEach((person) => {
      competencyTypes.forEach((type) => {
        const competency = latestCompetencyMap.get(`${person.id}:${type}`);
        const status = getStatus(competency);

        if (status === "competent") competent += 1;
        if (status === "due-soon") dueSoon += 1;
        if (status === "overdue") overdue += 1;
        if (status === "not-started") notStarted += 1;
        if (status === "actions") actions += 1;
      });
    });

    return { competent, dueSoon, overdue, notStarted, actions };
  }, [staff, competencyTypes, latestCompetencyMap]);

  return (
    <CastodiaPageShell
      title="Competencies"
      description="Track staff competency status across required training and assessment areas."
      maxWidth="wide"
      actions={
  <Link href="/manager/staff/competencies/new">
    <CastodiaButton>
      <Plus size={16} />
      Add Competency
    </CastodiaButton>
  </Link>
}
    >
      <div className="grid gap-4 md:grid-cols-5">
        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Competent</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.competent}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Due soon</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.dueSoon}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.overdue}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Actions</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.actions}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Not started</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.notStarted}
          </p>
        </CastodiaCard>
      </div>

      <CastodiaSection title="Competency Matrix">
        <CastodiaCard padding="none">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">
              Loading competency matrix...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Staff member
                    </th>

                    {competencyTypes.map((type) => (
                      <th
                        key={type}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {staff.length === 0 ? (
                    <tr>
                      <td
                        colSpan={competencyTypes.length + 1}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No staff found.
                      </td>
                    </tr>
                  ) : (
                    staff.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-4">
                          <p className="font-semibold text-slate-950">
                            {person.full_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {person.role === "manager"
                              ? "Manager"
                              : "Support Worker"}
                          </p>
                        </td>

                        {competencyTypes.map((type) => {
                          const competency = latestCompetencyMap.get(
                            `${person.id}:${type}`
                          );

                          const status = getStatus(competency);

                          return (
                            <td key={type} className="px-4 py-4">
                              <button
                                type="button"
                                className="text-left"
                                onClick={() =>
                                  alert(
                                    `${person.full_name} — ${type}\n${getStatusLabel(
                                      status
                                    )}`
                                  )
                                }
                              >
                                <CastodiaBadge variant={getStatusVariant(status)}>
                                  {getStatusLabel(status)}
                                </CastodiaBadge>

                                {competency?.review_date && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    Review{" "}
                                    {new Date(
                                      competency.review_date
                                    ).toLocaleDateString("en-GB")}
                                  </p>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CastodiaCard>
      </CastodiaSection>
    </CastodiaPageShell>
  );
}