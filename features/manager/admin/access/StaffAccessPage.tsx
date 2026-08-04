"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  CastodiaPageShell,
  CastodiaCard,
  CastodiaButton,
  CastodiaSection,
} from "@/components/castodia";

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
  <CastodiaPageShell
    title="Access Permissions"
    description="Assign staff members to the service users they support."
    maxWidth="wide"
    actions={
      <Link href="/manager/staff">
        <CastodiaButton variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to Staff
        </CastodiaButton>
      </Link>
    }
  >
      <CastodiaSection title="Assign Access">
        <CastodiaCard>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Staff member
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select staff member</option>

                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.full_name}{" "}
                    {person.role === "manager" ? "(Manager)" : "(Staff)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Service user
              </label>
              <select
                value={selectedServiceUserId}
                onChange={(e) => setSelectedServiceUserId(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
            </div>

            <CastodiaButton onClick={addAccess}>
              Assign Access
            </CastodiaButton>
          </div>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection
        title="Current Permissions"
        description={`${accessRows.length} permission${
          accessRows.length === 1 ? "" : "s"
        } assigned`}
      >
        {accessRows.length === 0 ? (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              No access permissions assigned.
            </p>
          </CastodiaCard>
        ) : (
          <div className="grid gap-3">
            {accessRows.map((row) => (
              <CastodiaCard key={row.id} padding="md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {getStaffName(row.staff_id)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {getServiceUserName(row.service_user_id)}
                    </p>
                  </div>

                  <CastodiaButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeAccess(row.id)}
                  >
                    Remove
                  </CastodiaButton>
                </div>
              </CastodiaCard>
            ))}
          </div>
        )}
      </CastodiaSection>
    </CastodiaPageShell>
    
  );
}