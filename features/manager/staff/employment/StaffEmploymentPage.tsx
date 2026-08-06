
"use client";
import EmploymentSummary from "./components/EmploymentSummary";

import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  HeartPulse,
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import type {
  EmploymentFormValues,
  EmploymentManager,
  StaffEmployment,
} from "@/lib/employment/types";
import {
  createEmptyEmploymentForm,
  employmentToFormValues,
} from "@/lib/employment/utils";
import { supabase } from "@/lib/supabase";

import EmploymentComplianceCard from "./components/EmploymentComplianceCard";
import EmploymentDetailsForm from "./components/EmploymentDetailsForm";
import EmploymentStatusBadge from "./components/EmploymentStatusBadge";

type StaffEmploymentPageProps = {
  staffId: string;
};

type StaffProfile = {
  id: string;
  full_name: string;
  organisation_id: string;
};

export default function StaffEmploymentPage({
  staffId,
}: StaffEmploymentPageProps) {
   console.log("Employment staffId:", staffId);
  const [staff, setStaff] =
    useState<StaffProfile | null>(null);

  const [managers, setManagers] = useState<
    EmploymentManager[]
  >([]);

  const [employment, setEmployment] =
    useState<StaffEmployment | null>(null);

  const [values, setValues] =
    useState<EmploymentFormValues>(
      createEmptyEmploymentForm()
    );

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [pageError, setPageError] = useState<
    string | null
  >(null);

  const [savedMessage, setSavedMessage] =
    useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    setSavedMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be signed in.");
      }

      const { data: currentProfile, error: currentProfileError } =
        await supabase
          .from("profiles")
          .select("organisation_id")
          .eq("id", user.id)
          .single();

      if (
        currentProfileError ||
        !currentProfile?.organisation_id
      ) {
        throw new Error(
          currentProfileError?.message ||
            "Your organisation could not be identified."
        );
      }

      const organisationId =
        currentProfile.organisation_id;

      const [
        staffResult,
        managerResult,
        employmentResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, organisation_id")
          .eq("id", staffId)
          .eq("organisation_id", organisationId)
          .single(),

        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("organisation_id", organisationId)
          .eq("role", "manager")
          .order("full_name"),

        supabase
          .from("staff_employment")
          .select("*")
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .maybeSingle(),
      ]);

      if (staffResult.error || !staffResult.data) {
        throw new Error(
          staffResult.error?.message ||
            "Staff member could not be found."
        );
      }

      if (managerResult.error) {
        throw new Error(managerResult.error.message);
      }

      if (employmentResult.error) {
        throw new Error(
          employmentResult.error.message
        );
      }

      const employmentRecord =
        employmentResult.data as StaffEmployment | null;

      setCurrentUserId(user.id);

      setStaff(
        staffResult.data as StaffProfile
      );

      setManagers(
        (managerResult.data ??
          []) as EmploymentManager[]
      );

      setEmployment(employmentRecord);

setValues(
  employmentRecord
    ? employmentToFormValues(employmentRecord)
    : createEmptyEmploymentForm()
);

setEditing(!employmentRecord);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load employment details."
      );
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  async function saveEmployment() {
    if (!staff || !currentUserId) {
      alert(
        "The staff member or current user could not be identified."
      );
      return;
    }

    if (
      values.end_date &&
      values.start_date &&
      values.end_date < values.start_date
    ) {
      alert(
        "The employment end date cannot be before the start date."
      );
      return;
    }

    if (
      values.probation_end_date &&
      values.start_date &&
      values.probation_end_date <
        values.start_date
    ) {
      alert(
        "The probation end date cannot be before the start date."
      );
      return;
    }

    const contractedHours =
      values.contracted_hours.trim() === ""
        ? null
        : Number(values.contracted_hours);

    if (
      contractedHours !== null &&
      (!Number.isFinite(contractedHours) ||
        contractedHours < 0)
    ) {
      alert(
        "Contracted hours must be a valid positive number."
      );
      return;
    }

    setSaving(true);
    setSavedMessage(null);

    try {
      const record = {
        organisation_id: staff.organisation_id,
        staff_id: staff.id,

        job_title:
          values.job_title.trim() || null,
        department:
          values.department.trim() || null,
        house_name:
          values.house_name.trim() || null,
        manager_id:
          values.manager_id || null,

        employment_status:
          values.employment_status,
        contract_type:
          values.contract_type || null,
        contracted_hours: contractedHours,
        start_date:
          values.start_date || null,
        probation_end_date:
          values.probation_end_date || null,
        end_date:
          values.end_date || null,

        work_email:
          values.work_email.trim() || null,
        work_phone:
          values.work_phone.trim() || null,

        emergency_contact_name:
          values.emergency_contact_name.trim() ||
          null,
        emergency_contact_relationship:
          values.emergency_contact_relationship.trim() ||
          null,
        emergency_contact_phone:
          values.emergency_contact_phone.trim() ||
          null,

        right_to_work_status:
          values.right_to_work_status || null,
        right_to_work_checked_at:
          values.right_to_work_checked_at ||
          null,
        right_to_work_expiry_date:
          values.right_to_work_expiry_date ||
          null,

        dbs_status:
          values.dbs_status || null,
        dbs_level:
          values.dbs_level || null,
        dbs_certificate_number:
          values.dbs_certificate_number.trim() ||
          null,
        dbs_issue_date:
          values.dbs_issue_date || null,
        dbs_update_service:
          values.dbs_update_service,
        dbs_last_checked_at:
          values.dbs_last_checked_at || null,
        dbs_next_check_date:
          values.dbs_next_check_date || null,

        occupational_health_status:
          values.occupational_health_status ||
          null,
        occupational_health_review_date:
          values.occupational_health_review_date ||
          null,
        workplace_adjustments:
          values.workplace_adjustments.trim() ||
          null,

        notes: values.notes.trim() || null,

        created_by:
          employment?.created_by ??
          currentUserId,
        updated_by: currentUserId,
      };

      const { data, error } = await supabase
        .from("staff_employment")
        .upsert(record, {
          onConflict: "staff_id",
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const savedEmployment =
        data as StaffEmployment;

      setEmployment(savedEmployment);

setValues(
  employmentToFormValues(savedEmployment)
);

setSavedMessage(
  "Employment details saved successfully."
);

setEditing(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save employment details."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CastodiaCard>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading employment details...
        </div>
      </CastodiaCard>
    );
  }

  if (pageError || !staff) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center">
          <h1 className="text-xl font-semibold text-slate-950">
            Employment details could not be loaded
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {pageError ||
              "Staff member could not be found."}
          </p>

          <Link
            href="/manager/staff"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Employment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage employment, compliance and
            occupational health details for{" "}
            {staff.full_name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
  <Link href={`/manager/staff/${staff.id}`}>
    <CastodiaButton variant="secondary">
      <ArrowLeft className="h-4 w-4" />
      Back to Staff
    </CastodiaButton>
  </Link>

  {editing ? (
    <>
      {employment && (
        <CastodiaButton
          variant="secondary"
          onClick={() => {
            setValues(
              employmentToFormValues(employment)
            );
            setSavedMessage(null);
            setEditing(false);
          }}
          disabled={saving}
        >
          Cancel
        </CastodiaButton>
      )}

      <CastodiaButton
        onClick={() => void saveEmployment()}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Employment
          </>
        )}
      </CastodiaButton>
    </>
  ) : (
    <CastodiaButton
  onClick={() => setEditing(true)}
>
  <Pencil className="h-4 w-4" />
  Edit Employment
</CastodiaButton>
  )}
</div>
      </div>

      {savedMessage ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          {savedMessage}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <EmploymentStatusBadge
          status={values.employment_status}
        />

        <p className="text-sm text-slate-500">
          {employment
            ? "Existing employment record"
            : "New employment record"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EmploymentComplianceCard
          title="Right to Work"
          status={
            values.right_to_work_status
              ? values.right_to_work_status
                  .replaceAll("_", " ")
                  .replace(/^\w/, (letter) =>
                    letter.toUpperCase()
                  )
              : "Not recorded"
          }
          description={
            values.right_to_work_expiry_date
              ? `Expires ${new Date(
                  `${values.right_to_work_expiry_date}T00:00:00`
                ).toLocaleDateString("en-GB")}`
              : "No expiry date recorded"
          }
          icon={
            <ShieldCheck className="h-5 w-5" />
          }
        />

        <EmploymentComplianceCard
          title="DBS"
          status={
            values.dbs_status
              ? values.dbs_status
                  .replaceAll("_", " ")
                  .replace(/^\w/, (letter) =>
                    letter.toUpperCase()
                  )
              : "Not recorded"
          }
          description={
            values.dbs_next_check_date
              ? `Next check ${new Date(
                  `${values.dbs_next_check_date}T00:00:00`
                ).toLocaleDateString("en-GB")}`
              : "No next check recorded"
          }
          icon={
            <FileCheck2 className="h-5 w-5" />
          }
        />

        <EmploymentComplianceCard
          title="Occupational Health"
          status={
            values.occupational_health_status
              ? values.occupational_health_status
                  .replaceAll("_", " ")
                  .replace(/^\w/, (letter) =>
                    letter.toUpperCase()
                  )
              : "Not recorded"
          }
          description={
            values.occupational_health_review_date
              ? `Review ${new Date(
                  `${values.occupational_health_review_date}T00:00:00`
                ).toLocaleDateString("en-GB")}`
              : "No review date recorded"
          }
          icon={
            <HeartPulse className="h-5 w-5" />
          }
        />

        <EmploymentComplianceCard
          title="Contract"
          status={
            values.contract_type
              ? values.contract_type
                  .replaceAll("_", " ")
                  .replace(/^\w/, (letter) =>
                    letter.toUpperCase()
                  )
              : "Not recorded"
          }
          description={
            values.contracted_hours
              ? `${values.contracted_hours} contracted hours`
              : "Hours not recorded"
          }
          icon={
            <BriefcaseBusiness className="h-5 w-5" />
          }
        />
      </div>

      {editing ? (
  <CastodiaCard>
    <EmploymentDetailsForm
      values={values}
      managers={managers}
      disabled={saving}
      onChange={(nextValues) => {
        setValues(nextValues);
        setSavedMessage(null);
      }}
    />
  </CastodiaCard>
) : (
  employment && (
    <EmploymentSummary
      employment={employment}
      managers={managers}
    />
  )
)}
    </div>
  );
}