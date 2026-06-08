"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader, SectionCard } from "@/components/layouts";
import { supabase } from "@/lib/supabase";
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

    const [{ data: staffData, error: staffError }, { data: supervisionData, error: supervisionError }] =
      await Promise.all([
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

    if (staffError) {
      alert(staffError.message);
      setLoading(false);
      return;
    }

    if (supervisionError) {
      alert(supervisionError.message);
      setLoading(false);
      return;
    }

    setStaff(staffData || []);
    setSupervisions((supervisionData || []) as StaffSupervision[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Supervisions"
        subtitle="Track staff supervision dates, review status and follow-up needs."
      >
        <Link
          href="/manager/supervisions/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30"
        >
          <Plus size={18} />
          New Supervision
        </Link>
      </PageHeader>

      {loading && (
        <SectionCard>
          <p className="text-slate-400">Loading supervisions...</p>
        </SectionCard>
      )}

      {!loading && staff.length === 0 && (
        <SectionCard>
          <p className="text-slate-400">No staff members found.</p>
        </SectionCard>
      )}

      {!loading && staff.length > 0 && (
        <SupervisionMatrix staff={staff} supervisions={supervisions} />
      )}
    </PageContainer>
  );
}