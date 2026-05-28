"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Staff = {
  id: string;
  full_name: string;
  role: "manager" | "staff";
};

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
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Link href="/admin" className="text-slate-400">
        ← Admin Portal
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Staff Management</h1>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create Staff Login</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Staff name"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Temporary password"
          type="password"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "manager" | "staff")}
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        >
          <option value="staff">Support Worker</option>
          <option value="manager">Manager</option>
        </select>

        <button
          onClick={createStaff}
          className="w-full rounded-xl bg-blue-500 p-4 font-semibold"
        >
          Create Staff
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {staff.map((person) => (
          <div key={person.id} className="rounded-2xl bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">{person.full_name}</h2>
            <p className="text-slate-400">
              {person.role === "manager" ? "Manager" : "Support Worker"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}