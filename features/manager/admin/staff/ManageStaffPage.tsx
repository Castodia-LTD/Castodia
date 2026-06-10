"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Staff } from "@/lib/admin/staff/types";

import {
  CastodiaPageShell,
  CastodiaCard,
  CastodiaButton,
  CastodiaBadge,
  CastodiaSection,
} from "@/components/castodia";

export default function StaffAdminPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "staff">("staff");

  async function loadStaff() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError || !currentProfile?.organisation_id) {
      alert("Organisation not found.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("organisation_id", currentProfile.organisation_id)
      .order("full_name");

    if (error) {
      alert(error.message);
      return;
    }

    setStaff(data || []);
  }

  async function createStaff() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const response = await fetch("/api/admin/create-staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        role,
        creatorId: user.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    setFullName("");
    setEmail("");
    setPassword("");
    setRole("staff");

    await loadStaff();

    alert("Staff member created successfully.");
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <CastodiaPageShell
      title="Staff Management"
      description="Create staff logins and manage staff access across your organisation."
      maxWidth="wide"
    >
      <CastodiaSection title="Create Staff Login">
        <CastodiaCard>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_180px_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Staff name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Staff name"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Temporary password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Temporary password"
                type="password"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "manager" | "staff")
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="staff">Support Worker</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <CastodiaButton onClick={createStaff}>
              Create Staff
            </CastodiaButton>
          </div>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection
        title="Staff Members"
        description={`${staff.length} staff member${staff.length === 1 ? "" : "s"} found`}
      >
        {staff.length === 0 ? (
          <CastodiaCard>
            <p className="text-sm text-slate-500">No staff members found.</p>
          </CastodiaCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((person) => (
              <CastodiaCard key={person.id} padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {person.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {person.role === "manager"
                        ? "Manager"
                        : "Support Worker"}
                    </p>
                  </div>

                  <CastodiaBadge
                    variant={person.role === "manager" ? "info" : "neutral"}
                  >
                    {person.role === "manager" ? "Manager" : "Staff"}
                  </CastodiaBadge>
                </div>
              </CastodiaCard>
            ))}
          </div>
        )}
      </CastodiaSection>
    </CastodiaPageShell>
  );
}