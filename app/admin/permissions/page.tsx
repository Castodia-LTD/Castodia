"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Staff = {
  id: string;
  full_name: string;
  role: string;
};

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

type AccessRow = {
  id: string;
  staff_id: string;
  service_user_id: string;
};

export default function PermissionsPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [accessRows, setAccessRows] = useState<AccessRow[]>([]);

  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedServiceUser, setSelectedServiceUser] = useState("");

  async function loadData() {
    const { data: staffData } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name");

    const { data: serviceUserData } = await supabase
      .from("service_users")
      .select("id, full_name, house_name")
      .eq("is_active", true)
      .order("full_name");

    const { data: accessData } = await supabase
      .from("staff_service_user_access")
      .select("*");

    setStaff(staffData || []);
    setServiceUsers(serviceUserData || []);
    setAccessRows(accessData || []);
  }

  async function assignAccess() {
    if (!selectedStaff || !selectedServiceUser) {
      alert("Select staff and service user.");
      return;
    }

    const { error } = await supabase.from("staff_service_user_access").insert({
      staff_id: selectedStaff,
      service_user_id: selectedServiceUser,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedStaff("");
    setSelectedServiceUser("");
    await loadData();
  }

  async function removeAccess(id: string) {
    const { error } = await supabase
      .from("staff_service_user_access")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  function getStaffName(id: string) {
    return staff.find((person) => person.id === id)?.full_name || "Unknown";
  }

  function getServiceUserName(id: string) {
    const su = serviceUsers.find((person) => person.id === id);
    return su ? `${su.full_name} — ${su.house_name}` : "Unknown";
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Link href="/admin" className="text-slate-400">
        ← Admin Portal
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Access Permissions</h1>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Assign Staff Access</h2>

        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        >
          <option value="">Select staff member</option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name} —{" "}
              {person.role === "manager" ? "Manager" : "Support Worker"}
            </option>
          ))}
        </select>

        <select
          value={selectedServiceUser}
          onChange={(e) => setSelectedServiceUser(e.target.value)}
          className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        >
          <option value="">Select service user</option>
          {serviceUsers.map((su) => (
            <option key={su.id} value={su.id}>
              {su.full_name} — {su.house_name}
            </option>
          ))}
        </select>

        <button
          onClick={assignAccess}
          className="w-full rounded-xl bg-blue-500 p-4 font-semibold"
        >
          Assign Access
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {accessRows.map((row) => (
          <div key={row.id} className="rounded-2xl bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">
              {getStaffName(row.staff_id)}
            </h2>
            <p className="text-slate-400">
              Can access: {getServiceUserName(row.service_user_id)}
            </p>

            <button
              onClick={() => removeAccess(row.id)}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 font-semibold"
            >
              Remove Access
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}