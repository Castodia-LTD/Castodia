"use client";

import { useEffect, useState } from "react";
import {
  ContentWidth,
  PageHeader,
  SectionCard,
} from "@/components/layout";
import { supabase } from "@/lib/supabase";
import TimelineServiceUserCard from "./components/TimelineServiceUserCard";
import type { ServiceUser } from "./types";

export default function TimelinesPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadServiceUsers() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    if (profile.role === "manager") {
      const { data, error } = await supabase
        .from("service_users")
        .select("id, full_name, first_name, surname, house_name")
        .eq("organisation_id", profile.organisation_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setServiceUsers(data || []);
      setLoading(false);
      return;
    }

    const { data: accessData, error: accessError } = await supabase
      .from("staff_service_user_access")
      .select(`
        service_users (
          id,
          full_name,
          first_name,
          surname,
          house_name
        )
      `)
      .eq("staff_id", user.id);

    if (accessError) {
      alert(accessError.message);
      setLoading(false);
      return;
    }

    const assignedServiceUsers =
      accessData?.map((row: any) => row.service_users).filter(Boolean) || [];

    setServiceUsers(assignedServiceUsers);
    setLoading(false);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <ContentWidth>
      <PageHeader
        title="Timelines"
        subtitle="Select a service user to open their daily records."
      />

      {loading && (
        <SectionCard>
          <p className="text-sm text-slate-400">Loading service users...</p>
        </SectionCard>
      )}

      {!loading && serviceUsers.length === 0 && (
        <SectionCard>
          <p className="text-sm text-slate-400">No service users assigned.</p>
        </SectionCard>
      )}

      {!loading && serviceUsers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceUsers.map((serviceUser) => (
            <TimelineServiceUserCard
              key={serviceUser.id}
              serviceUser={serviceUser}
            />
          ))}
        </div>
      )}
    </ContentWidth>
  );
}