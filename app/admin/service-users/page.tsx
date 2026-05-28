"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  first_name: string;
  surname: string;
  house_name: string | null;
  photo_url: string | null;
  key_notes: string | null;
  allergies: string | null;
  communication_needs: string | null;
  risk_notes: string | null;

  continence_care_enabled: boolean;
  track_pad_changes: boolean;
  track_bristol_stool_chart: boolean;

  is_active: boolean;
};

export default function ServiceUsersAdminPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [houseName, setHouseName] = useState("");

  const [editing, setEditing] = useState<ServiceUser | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null);

  async function loadServiceUsers() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.organisation_id) {
      alert("Organisation not found.");
      return;
    }

    setOrganisationId(profile.organisation_id);

    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        first_name,
        surname,
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
      .eq("organisation_id", profile.organisation_id)
      .eq("is_active", true)
      .order("first_name");

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUsers(data || []);
  }

  async function createServiceUser() {
  if (!firstName.trim()) {
  alert("First name is required.");
  return;
  }

    const { error } = await supabase.from("service_users").insert({
      first_name: firstName.trim(),
      surname: surname.trim(),
      house_name: houseName.trim() || null,
      organisation_id: organisationId,
      photo_url: null,
      key_notes: null,
      allergies: null,
      communication_needs: null,
      risk_notes: null,

      continence_care_enabled: false,
      track_pad_changes: false,
      track_bristol_stool_chart: false,

      is_active: true,
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

    const { error } = await supabase
      .from("service_users")
      .update({
        first_name: editing.first_name,
        surname: editing.surname,
        house_name: editing.house_name,
        photo_url: editing.photo_url,
        key_notes: editing.key_notes,
        allergies: editing.allergies,
        communication_needs: editing.communication_needs,
        risk_notes: editing.risk_notes,

        continence_care_enabled:
          editing.continence_care_enabled,

        track_pad_changes:
          editing.track_pad_changes,

        track_bristol_stool_chart:
          editing.track_bristol_stool_chart,
      })
      .eq("id", editing.id)
      .eq("organisation_id", organisationId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(null);

    await loadServiceUsers();
  }

  async function deactivateServiceUser(id: string) {
    const confirmed = confirm(
      "Deactivate this service user? Their records will remain stored."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("service_users")
      .update({
        is_active: false,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editing?.id === id) {
      setEditing(null);
    }

    await loadServiceUsers();
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-lg px-4 py-6">
        <Link href="/admin" className="text-slate-400">
          ← Admin Portal
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Service Users
        </h1>

        <p className="mt-2 text-slate-400">
          Create service users and maintain profile information.
        </p>

        <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold">
            Create Service User
          </h2>

          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          />
          <input
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Surname"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          />

          <input
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="House name"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          />

          <button
            onClick={createServiceUser}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
          >
            Create Service User
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {serviceUsers.map((su) => (
            <div
              key={su.id}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  {su.photo_url ? (
                    <img
                      src={su.photo_url}
                      alt={su.first_name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-cyan-300">
                      {su.first_name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-semibold">
                      {su.first_name}
                    </h2>

                    <p className="text-slate-400">
                      {su.house_name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => setEditing(su)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deactivateServiceUser(su.id)}
                    className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300"
                  >
                    Deactivate
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
            <div className="mx-auto my-8 w-full max-w-screen-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">

              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">
                  Edit Profile
                </h2>

                <button
                  onClick={() => setEditing(null)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 space-y-4">

                <input
                  value={editing.first_name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      first_name: e.target.value,
                    })
                  }
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
                />

                <input
                  value={editing.house_name || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      house_name: e.target.value,
                    })
                  }
                  placeholder="House name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
                />

                <textarea
                  value={editing.key_notes || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      key_notes: e.target.value,
                    })
                  }
                  placeholder="Key notes"
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
                />

                <textarea
                  value={editing.allergies || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      allergies: e.target.value,
                    })
                  }
                  placeholder="Allergies"
                  className="min-h-28 w-full rounded-2xl border border-red-500/20 bg-red-950/30 p-4 text-white outline-none"
                />

                <textarea
                  value={editing.communication_needs || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      communication_needs: e.target.value,
                    })
                  }
                  placeholder="Communication needs"
                  className="min-h-28 w-full rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 text-white outline-none"
                />

                <textarea
                  value={editing.risk_notes || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      risk_notes: e.target.value,
                    })
                  }
                  placeholder="Risk notes"
                  className="min-h-28 w-full rounded-2xl border border-amber-500/20 bg-amber-950/30 p-4 text-white outline-none"
                />

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                  <h3 className="text-lg font-semibold text-emerald-300">
                    Continence Care
                  </h3>

                  <div className="mt-4 space-y-3">

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editing.continence_care_enabled || false}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            continence_care_enabled: e.target.checked,
                          })
                        }
                      />

                      <span>Enable continence care</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editing.track_pad_changes || false}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            track_pad_changes: e.target.checked,
                          })
                        }
                      />

                      <span>Track pad changes</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editing.track_bristol_stool_chart || false}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            track_bristol_stool_chart: e.target.checked,
                          })
                        }
                      />

                      <span>Track Bristol stool chart</span>
                    </label>

                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
                >
                  Save Profile
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}