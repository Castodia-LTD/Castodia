"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

import type {
  StaffMember,
  StaffSupervision,
} from "@/lib/admin/supervisions/types";
import SupervisionMatrix from "./components/SupervisionMatrix";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
};

function getSupervisionStatus(supervision?: StaffSupervision) {
  if (!supervision) return "not-started";

  if (!supervision?.next_supervision_date) {
  return "not-started";
}

const nextDue = new Date(supervision.next_supervision_date);
  const today = new Date();

  const daysUntilDue = Math.ceil(
    (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 30) return "due-soon";

  return "up-to-date";
}

export default function SupervisionsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [supervisions, setSupervisions] = useState<StaffSupervision[]>([]);
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

    const [staffResult, supervisionResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("organisation_id", profile.organisation_id)
        .order("full_name"),

      supabase
        .from("staff_supervisions")
        .select("*")
        .eq("organisation_id", profile.organisation_id)
        .order("supervision_date", { ascending: false }),
    ]);

    if (staffResult.error) {
      alert(staffResult.error.message);
      setLoading(false);
      return;
    }

    if (supervisionResult.error) {
      alert(supervisionResult.error.message);
      setLoading(false);
      return;
    }

    setStaff(staffResult.data || []);
    setSupervisions((supervisionResult.data || []) as StaffSupervision[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const latestSupervisionMap = useMemo(() => {
    const map = new Map<string, StaffSupervision>();

    supervisions.forEach((supervision) => {
      if (!map.has(supervision.staff_id)) {
        map.set(supervision.staff_id, supervision);
      }
    });

    return map;
  }, [supervisions]);

  const summary = useMemo(() => {
    let upToDate = 0;
    let dueSoon = 0;
    let overdue = 0;
    let notStarted = 0;

    staff.forEach((person) => {
      const latest = latestSupervisionMap.get(person.id);
      const status = getSupervisionStatus(latest);

      if (status === "up-to-date") upToDate += 1;
      if (status === "due-soon") dueSoon += 1;
      if (status === "overdue") overdue += 1;
      if (status === "not-started") notStarted += 1;
    });

    return { upToDate, dueSoon, overdue, notStarted };
  }, [staff, latestSupervisionMap]);

  return (
    <CastodiaPageShell
      title="Supervisions"
      description="Track staff supervision dates, review status and follow-up needs."
      maxWidth="wide"
      actions={
        <Link href="/manager/staff/supervisions/new">
          <CastodiaButton>
            <Plus size={16} />
            New Supervision
          </CastodiaButton>
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Up to date</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.upToDate}
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
          <p className="text-sm text-slate-500">Not started</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.notStarted}
          </p>
        </CastodiaCard>
      </div>

      <CastodiaSection title="Supervision Matrix">
        {loading && (
          <CastodiaCard>
            <p className="text-sm text-slate-500">Loading supervisions...</p>
          </CastodiaCard>
        )}

        {!loading && staff.length === 0 && (
          <CastodiaCard>
            <p className="text-sm text-slate-500">No staff members found.</p>
          </CastodiaCard>
        )}

        {!loading && staff.length > 0 && (
          <SupervisionMatrix staff={staff} supervisions={supervisions} />
        )}
      </CastodiaSection>
    </CastodiaPageShell>
  );
}