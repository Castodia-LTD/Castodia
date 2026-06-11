"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CastodiaPageShell,
} from "@/components/castodia";

import ManagerServiceUserCard from "./components/ManagerServiceUserCard";
import type { ServiceUser } from "./types";

export default function ManagerServiceUsersPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);

  async function loadServiceUsers() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    const { data } = await supabase
      .from("service_users")
      .select(`
        id,
        full_name,
        first_name,
        surname,
        photo_url,
        house_name
      `)
      .eq("organisation_id", profile?.organisation_id)
      .eq("is_active", true)
      .order("full_name");

    setServiceUsers(data || []);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <CastodiaPageShell
      title="Service Users"
      description="Select a service user to manage records and documents."
      maxWidth="full"
     >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {serviceUsers.map((serviceUser) => (
          <ManagerServiceUserCard
            key={serviceUser.id}
            serviceUser={serviceUser}
          />
        ))}
      </div>
    </CastodiaPageShell>
  );
}