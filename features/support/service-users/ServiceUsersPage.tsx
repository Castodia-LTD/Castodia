"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

import ServiceUserCard from "./components/ServiceUserCard";
import type { ServiceUser } from "./types";

export default function ServiceUsersPage() {
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
        .select(
          `
          id,
          full_name,
          first_name,
          surname,
          house_name,
          photo_url,
          allergies
        `
        )
        .eq("organisation_id", profile.organisation_id)
        .eq("is_active", true)
        .order("full_name");

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
      .select(
        `
        service_users (
          id,
          full_name,
          house_name,
          photo_url,
          allergies
        )
      `
      )
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
    <CastodiaPageShell
      title="Service Users"
      description="View profiles, care information and important notes."
      maxWidth="wide"
    >
      {loading && (
        <CastodiaCard>
          <p className="text-sm text-slate-500">Loading service users...</p>
        </CastodiaCard>
      )}

      {!loading && serviceUsers.length === 0 && (
        <CastodiaCard>
          <p className="text-sm text-slate-500">No service users assigned.</p>
        </CastodiaCard>
      )}

      {!loading && serviceUsers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {serviceUsers.map((serviceUser) => (
            <ServiceUserCard
              key={serviceUser.id}
              serviceUser={serviceUser}
            />
          ))}
        </div>
      )}
    </CastodiaPageShell>
  );
}