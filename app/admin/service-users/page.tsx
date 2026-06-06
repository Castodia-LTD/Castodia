"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import CreateServiceUserForm from "@/components/admin/service-users/CreateServiceUserForm";
import EditServiceUserModal from "@/components/admin/service-users/EditServiceUserModal";
import ServiceUserCard from "@/components/admin/service-users/ServiceUserCard";
import { supabase } from "@/lib/supabase";
import type { ServiceUser } from "@/lib/admin/service-users/types";

export default function AdminServiceUsersPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [editing, setEditing] = useState<ServiceUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [houseName, setHouseName] = useState("");

  async function getCurrentOrganisationId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (error || !profile?.organisation_id) {
      alert("Organisation not found.");
      return null;
    }

    return profile.organisation_id;
  }

  async function loadServiceUsers() {
    const organisationId = await getCurrentOrganisationId();

    if (!organisationId) return;

    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        first_name,
        surname,
        gender,
        house_name,
        photo_url,
        key_notes,
        allergies,
        communication_needs,
        risk_notes,
        continence_care_enabled,
        track_pad_changes,
        track_bristol_stool_chart,
        is_active
      `)
      .eq("organisation_id", organisationId)
      .order("first_name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUsers(data || []);
  }

  async function createServiceUser() {
    if (!firstName.trim() || !surname.trim()) {
      alert("First name and surname are required.");
      return;
    }

    const organisationId = await getCurrentOrganisationId();

    if (!organisationId) return;

    const { error } = await supabase.from("service_users").insert({
      first_name: firstName.trim(),
      surname: surname.trim(),
      house_name: houseName.trim() || null,
      organisation_id: organisationId,
      is_active: true,
      continence_care_enabled: false,
      track_pad_changes: false,
      track_bristol_stool_chart: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setFirstName("");
    setSurname("");
    setHouseName("");

    await loadServiceUsers();
  }

  async function saveProfile() {
    if (!editing) return;

    if (!editing.first_name.trim() || !editing.surname.trim()) {
      alert("First name and surname are required.");
      return;
    }

    const { error } = await supabase
      .from("service_users")
      .update({
        first_name: editing.first_name.trim(),
        surname: editing.surname.trim(),
        gender: editing.gender || null,
        house_name: editing.house_name?.trim() || null,
        photo_url: editing.photo_url?.trim() || null,
        key_notes: editing.key_notes?.trim() || null,
        allergies: editing.allergies?.trim() || null,
        communication_needs: editing.communication_needs?.trim() || null,
        risk_notes: editing.risk_notes?.trim() || null,
        continence_care_enabled: editing.continence_care_enabled,
        track_pad_changes: editing.continence_care_enabled
          ? editing.track_pad_changes
          : false,
        track_bristol_stool_chart: editing.continence_care_enabled
          ? editing.track_bristol_stool_chart
          : false,
      })
      .eq("id", editing.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(null);
    await loadServiceUsers();
  }

  async function deactivateServiceUser(id: string) {
    const confirmed = confirm(
      "Deactivate this service user? Their existing records will remain stored."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("service_users")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadServiceUsers();
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Service Users</h1>

          <p className="mt-2 text-slate-400">
            Create and manage service user profiles.
          </p>

          <CreateServiceUserForm
            firstName={firstName}
            setFirstName={setFirstName}
            surname={surname}
            setSurname={setSurname}
            
            houseName={houseName}
            setHouseName={setHouseName}
            onCreate={createServiceUser}
          />

          <div className="mt-8 space-y-4">
            {serviceUsers.length === 0 && (
              <p className="text-slate-400">No service users found.</p>
            )}

            {serviceUsers.map((serviceUser) => (
              <ServiceUserCard
                key={serviceUser.id}
                serviceUser={serviceUser}
                onEdit={() => setEditing(serviceUser)}
                onDeactivate={() => deactivateServiceUser(serviceUser.id)}
              />
            ))}
          </div>
        </div>

        <EditServiceUserModal
          editing={editing}
          setEditing={setEditing}
          onSave={saveProfile}
        />
      </main>
    </ManagerShell>
  );
}