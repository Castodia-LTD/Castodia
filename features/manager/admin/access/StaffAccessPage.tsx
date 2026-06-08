"use client";

import { useEffect, useState } from "react";
import AccessRowCard from "@/components/admin/permissions/AccessRowCard";
import { supabase } from "@/lib/supabase";

import type {
  AccessRow,
  ServiceUser,
  Staff,
} from "@/lib/admin/permissions/types";

export default function StaffServiceUserAccessPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [accessRows, setAccessRows] = useState<AccessRow[]>([]);

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedServiceUserId, setSelectedServiceUserId] = useState("");

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

  async function loadData() {
    const organisationId = await getCurrentOrganisationId();

    if (!organisationId) return;

    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("organisation_id", organisationId)
      .order("full_name");

    if (staffError) {
      alert(staffError.message);
      return;
    }

    const { data: serviceUserData, error: serviceUserError } = await supabase
      .from("service_users")
      .select("id, full_name, house_name")
      .eq("organisation_id", organisationId)
      .eq("is_active", true)
      .order("full_name");

    if (serviceUserError) {
      alert(serviceUserError.message);
      return;
    }

    const { data: accessData, error: accessError } = await supabase
      .from("staff_service_user_access")
      .select("id, staff_id, service_user_id")
      .order("created_at", { ascending: false });

    if (accessError) {
      alert(accessError.message);
      return;
    }

    setStaff(staffData || []);
    setServiceUsers(serviceUserData || []);
    setAccessRows(accessData || []);
  }

  async function addAccess() {
    if (!selectedStaffId || !selectedServiceUserId) {
      alert("Please select both a staff member and a service user.");
      return;
    }

    const existing = accessRows.find(
      (row) =>
        row.staff_id === selectedStaffId &&
        row.service_user_id === selectedServiceUserId
    );

    if (existing) {
      alert("This staff member already has access to this service user.");
      return;
    }

    const { error } = await supabase.from("staff_service_user_access").insert({
      staff_id: selectedStaffId,
      service_user_id: selectedServiceUserId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedStaffId("");
    setSelectedServiceUserId("");

    await loadData();
  }

  async function removeAccess(id: string) {
    const confirmed = confirm("Remove this access permission?");

    if (!confirmed) return;

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

  function getStaffName(staffId: string) {
    return (
      staff.find((person) => person.id === staffId)?.full_name ||
      "Unknown staff member"
    );
  }

  function getServiceUserName(serviceUserId: string) {
    const serviceUser = serviceUsers.find((user) => user.id === serviceUserId);

    if (!serviceUser) return "Unknown service user";

    return serviceUser.house_name
      ? `${serviceUser.full_name} — ${serviceUser.house_name}`
      : serviceUser.full_name;
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Access Permissions</h1>

          <p className="mt-2 text-slate-400">
            Assign staff members to the service users they support.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Assign Access</h2>

            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
            >
              <option value="">Select staff member</option>

              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.full_name}{" "}
                  {person.role === "manager" ? "(Manager)" : "(Staff)"}
                </option>
              ))}
            </select>

            <select
              value={selectedServiceUserId}
              onChange={(e) => setSelectedServiceUserId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
            >
              <option value="">Select service user</option>

              {serviceUsers.map((serviceUser) => (
                <option key={serviceUser.id} value={serviceUser.id}>
                  {serviceUser.house_name
                    ? `${serviceUser.full_name} — ${serviceUser.house_name}`
                    : serviceUser.full_name}
                </option>
              ))}
            </select>

            <button
              onClick={addAccess}
              className="w-full rounded-xl bg-blue-500 p-4 font-semibold"
            >
              Assign Access
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {accessRows.length === 0 && (
              <p className="text-slate-400">No access permissions assigned.</p>
            )}

            {accessRows.map((row) => (
              <AccessRowCard
                key={row.id}
                staffName={getStaffName(row.staff_id)}
                serviceUserName={getServiceUserName(row.service_user_id)}
                onRemove={() => removeAccess(row.id)}
              />
            ))}
          </div>
        </div>
      </main>
  );
}