"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
  notes: string | null;
};

export default function ServiceUsersAdminPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [houseName, setHouseName] = useState("");
  const [notes, setNotes] = useState("");

  async function loadServiceUsers() {
    const { data, error } = await supabase
      .from("service_users")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUsers(data || []);
  }

  async function createServiceUser() {
    if (!fullName.trim() || !houseName.trim()) {
      alert("Name and house are required.");
      return;
    }

    const { error } = await supabase.from("service_users").insert({
      full_name: fullName.trim(),
      house_name: houseName.trim(),
      notes: notes.trim() || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setFullName("");
    setHouseName("");
    setNotes("");
    await loadServiceUsers();
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Link href="/admin" className="text-slate-400">
        ← Admin Portal
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Service Users</h1>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create Service User</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <input
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="House name"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />

        <button
          onClick={createServiceUser}
          className="w-full rounded-xl bg-blue-500 p-4 font-semibold"
        >
          Create Service User
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {serviceUsers.map((su) => (
          <div key={su.id} className="rounded-2xl bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">{su.full_name}</h2>
            <p className="text-slate-400">{su.house_name}</p>
            {su.notes && <p className="mt-2 text-slate-300">{su.notes}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}