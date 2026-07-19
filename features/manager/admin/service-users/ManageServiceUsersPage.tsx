"use client";

import { useEffect, useState } from "react";
import EditServiceUserModal from "@/components/admin/service-users/EditServiceUserModal";
import { supabase } from "@/lib/supabase";
import type { ServiceUser } from "@/lib/admin/service-users/types";

import {
  CastodiaPageShell,
  CastodiaCard,
  CastodiaButton,
  CastodiaBadge,
  CastodiaSection,
} from "@/components/castodia";

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
  const cleanFirstName = firstName.trim();
  const cleanSurname = surname.trim();

  if (!cleanFirstName || !cleanSurname) {
    alert("First name and surname are required.");
    return;
  }

  const organisationId = await getCurrentOrganisationId();

  if (!organisationId) return;

      const { error } = await supabase.from("service_users").insert({
    first_name: cleanFirstName,
    surname: cleanSurname,
    full_name: `${cleanFirstName} ${cleanSurname}`,
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
    <CastodiaPageShell
      title="Service Users"
      description="Create and manage service user profiles."
      maxWidth="wide"
    >
      <CastodiaSection title="Create Service User">
        <CastodiaCard>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Surname
              </label>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Surname"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                House
              </label>
              <input
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="House name"
              />
            </div>

            <CastodiaButton onClick={createServiceUser}>
              Create
            </CastodiaButton>
          </div>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection
        title="Profiles"
        description={`${serviceUsers.length} service user${
          serviceUsers.length === 1 ? "" : "s"
        } found`}
      >
        {serviceUsers.length === 0 ? (
          <CastodiaCard>
            <p className="text-sm text-slate-500">No service users found.</p>
          </CastodiaCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceUsers.map((serviceUser) => (
              <CastodiaCard key={serviceUser.id} padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {serviceUser.first_name} {serviceUser.surname}
                    </h2>

                    {serviceUser.house_name && (
                      <p className="mt-1 text-sm text-slate-500">
                        {serviceUser.house_name}
                      </p>
                    )}
                  </div>

                  <CastodiaBadge
                    variant={serviceUser.is_active ? "success" : "neutral"}
                  >
                    {serviceUser.is_active ? "Active" : "Inactive"}
                  </CastodiaBadge>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <CastodiaButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(serviceUser)}
                  >
                    Edit
                  </CastodiaButton>

                  {serviceUser.is_active && (
                    <CastodiaButton
                      variant="danger"
                      size="sm"
                      onClick={() => deactivateServiceUser(serviceUser.id)}
                    >
                      Deactivate
                    </CastodiaButton>
                  )}
                </div>
              </CastodiaCard>
            ))}
          </div>
        )}
      </CastodiaSection>

      <EditServiceUserModal
        editing={editing}
        setEditing={setEditing}
        onSave={saveProfile}
      />
    </CastodiaPageShell>
  );
}