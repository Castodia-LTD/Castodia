"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CastodiaPageShell } from "@/components/castodia";
import ServiceUserHubHeader from "@/features/manager/service-users/components/ServiceUserHubHeader";
type ServiceUser = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_url: string | null;
  dob?: string | null;
  house_name: string | null;
};

export default function ManagerServiceUsersPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUserId, setSelectedServiceUserId] = useState<string | null>(
    null
  );

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

    if (!profile?.organisation_id) return;

const { data, error } = await supabase
  .from("service_users")
  .select("id, full_name, first_name, surname, photo_url, house_name")
  .eq("organisation_id", profile?.organisation_id)
  .order("full_name");

    const loadedServiceUsers = data || [];

    setServiceUsers(loadedServiceUsers);

    if (loadedServiceUsers.length > 0) {
      setSelectedServiceUserId(loadedServiceUsers[0].id);
    }
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  const selectedServiceUser = useMemo(() => {
    return (
      serviceUsers.find(
        (serviceUser) => serviceUser.id === selectedServiceUserId
      ) || serviceUsers[0]
    );
  }, [serviceUsers, selectedServiceUserId]);

  if (!selectedServiceUser) {
    return (
      <CastodiaPageShell
        title="Service Users"
        description="No active service users found."
        maxWidth="full"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No active service users are currently available.
        </div>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell
      title="Service Users"
      description="View and manage person-centred records."
      maxWidth="full"
    >
      <ServiceUserHubHeader
        id={selectedServiceUser.id}
        fullName={selectedServiceUser.full_name}
        houseName={selectedServiceUser.house_name}
        photoUrl={selectedServiceUser.photo_url}
        dob={null}
        serviceUsers={serviceUsers.map((serviceUser) => ({
          id: serviceUser.id,
          full_name: serviceUser.full_name,
        }))}
        onServiceUserChange={setSelectedServiceUserId}
      />
    </CastodiaPageShell>
  );
}