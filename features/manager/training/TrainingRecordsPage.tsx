"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { suggestedTrainingCourses } from "@/lib/training/suggestedCourses";
import type {
  TrainingRecord,
  TrainingStaffMember,
  TrainingStatus,
} from "@/lib/training/types";
import {
  getTrainingStatus,
  sanitiseTrainingFileName,
} from "@/lib/training/utils";

import AddTrainingRecordModal, {
  type AddTrainingRecordValues,
} from "./components/AddTrainingRecordModal";
import TrainingRecordsTable from "./components/TrainingRecordsTable";

type CurrentProfile = {
  id: string;
  organisation_id: string;
};

type StatusFilter = "all" | TrainingStatus;

export default function TrainingRecordsPage() {
  const [staff, setStaff] = useState<TrainingStaffMember[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);

  const [organisationId, setOrganisationId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [staffFilter, setStaffFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setPageError(null);

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

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, organisation_id")
          .eq("id", user.id)
          .single();

      if (profileError || !profile?.organisation_id) {
        throw new Error(
          profileError?.message ||
            "Your organisation could not be identified."
        );
      }

      const currentProfile = profile as CurrentProfile;

      const [staffResult, trainingResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq(
            "organisation_id",
            currentProfile.organisation_id
          )
          .order("full_name"),

        supabase
          .from("staff_training_records")
          .select("*")
          .eq(
            "organisation_id",
            currentProfile.organisation_id
          )
          .order("completion_date", {
            ascending: false,
          }),
      ]);

      if (staffResult.error) {
        throw new Error(staffResult.error.message);
      }

      if (trainingResult.error) {
        throw new Error(trainingResult.error.message);
      }

      setOrganisationId(currentProfile.organisation_id);
      setCurrentUserId(user.id);

      setStaff(
        (staffResult.data ?? []) as TrainingStaffMember[]
      );

      setRecords(
        (trainingResult.data ?? []) as TrainingRecord[]
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load training records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const staffNameMap = useMemo(() => {
    return new Map(
      staff.map((person) => [
        person.id,
        person.full_name,
      ])
    );
  }, [staff]);

  const existingCourseNames = useMemo(() => {
    const courseMap = new Map<string, string>();

    records.forEach((record) => {
      const courseName = record.course_name.trim();

      if (!courseName) {
        return;
      }

      const normalisedName = courseName.toLowerCase();

      if (!courseMap.has(normalisedName)) {
        courseMap.set(normalisedName, courseName);
      }
    });

    return Array.from(courseMap.values()).sort(
      (first, second) =>
        first.localeCompare(second)
    );
  }, [records]);

  const courseOptions = useMemo(() => {
    const courseMap = new Map<string, string>();

    suggestedTrainingCourses.forEach((course) => {
      courseMap.set(course.toLowerCase(), course);
    });

    existingCourseNames.forEach((course) => {
      const normalisedName = course.toLowerCase();

      if (!courseMap.has(normalisedName)) {
        courseMap.set(normalisedName, course);
      }
    });

    return Array.from(courseMap.values()).sort(
      (first, second) =>
        first.localeCompare(second)
    );
  }, [existingCourseNames]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const staffName =
        staffNameMap.get(record.staff_id) ?? "";

      const status = getTrainingStatus(
        record.expiry_date
      );

      const matchesSearch =
        !query ||
        record.course_name
          .toLowerCase()
          .includes(query) ||
        staffName.toLowerCase().includes(query) ||
        (record.provider ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const matchesStaff =
        !staffFilter ||
        record.staff_id === staffFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStaff
      );
    });
  }, [
    records,
    searchTerm,
    staffFilter,
    staffNameMap,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    let current = 0;
    let dueSoon = 0;
    let expired = 0;
    let noExpiry = 0;

    records.forEach((record) => {
      const status = getTrainingStatus(
        record.expiry_date
      );

      if (status === "current") {
        current += 1;
      }

      if (status === "due-soon") {
        dueSoon += 1;
      }

      if (status === "expired") {
        expired += 1;
      }

      if (status === "no-expiry") {
        noExpiry += 1;
      }
    });

    return {
      current,
      dueSoon,
      expired,
      noExpiry,
    };
  }, [records]);

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
  }

  async function saveTrainingRecord(
    values: AddTrainingRecordValues
  ) {
    if (!organisationId || !currentUserId) {
      alert(
        "Your organisation or user account could not be identified."
      );
      return;
    }

    const existingCourseName = courseOptions.find(
      (course) =>
        course.toLowerCase() ===
        values.courseName.trim().toLowerCase()
    );

    const courseName =
      existingCourseName ??
      values.courseName.trim();

    if (!courseName) {
      alert("Enter a course name.");
      return;
    }

    setSaving(true);

    const recordId = crypto.randomUUID();

    let certificateStoragePath: string | null =
      null;

    try {
      if (values.certificate) {
        const safeFileName =
          sanitiseTrainingFileName(
            values.certificate.name
          );

        certificateStoragePath = [
          organisationId,
          values.staffId,
          "training",
          recordId,
          safeFileName,
        ].join("/");

        const { error: uploadError } =
          await supabase.storage
            .from("staff-documents")
            .upload(
              certificateStoragePath,
              values.certificate,
              {
                cacheControl: "3600",
                upsert: false,
                contentType:
                  values.certificate.type,
              }
            );

        if (uploadError) {
          throw new Error(uploadError.message);
        }
      }

      const { error: insertError } =
        await supabase
          .from("staff_training_records")
          .insert({
            id: recordId,
            organisation_id: organisationId,
            staff_id: values.staffId,
            course_name: courseName,
            provider:
              values.provider.trim() || null,
            completion_date:
              values.completionDate,
            expiry_date:
              values.expiryDate || null,
            certificate_storage_path:
              certificateStoragePath,
            certificate_file_name:
              values.certificate?.name ?? null,
            certificate_mime_type:
              values.certificate?.type || null,
            certificate_file_size:
              values.certificate?.size ?? null,
            notes: values.notes.trim() || null,
            created_by: currentUserId,
          });

      if (insertError) {
        if (certificateStoragePath) {
          await supabase.storage
            .from("staff-documents")
            .remove([
              certificateStoragePath,
            ]);
        }

        throw new Error(insertError.message);
      }

      setModalOpen(false);
      await loadPageData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save the training record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function viewCertificate(
    record: TrainingRecord
  ) {
    if (!record.certificate_storage_path) {
      alert(
        "No certificate is attached to this record."
      );
      return;
    }

    const { data, error } =
      await supabase.storage
        .from("staff-documents")
        .createSignedUrl(
          record.certificate_storage_path,
          60
        );

    if (error || !data?.signedUrl) {
      alert(
        error?.message ||
          "Unable to open the certificate."
      );
      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function deleteTrainingRecord(
    record: TrainingRecord
  ) {
    const staffName =
      staffNameMap.get(record.staff_id) ??
      "this staff member";

    const confirmed = window.confirm(
      `Delete "${record.course_name}" for ${staffName}?`
    );

    if (!confirmed) {
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("staff_training_records")
        .delete()
        .eq("id", record.id)
        .eq(
          "organisation_id",
          record.organisation_id
        );

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    if (record.certificate_storage_path) {
      const { error: storageError } =
        await supabase.storage
          .from("staff-documents")
          .remove([
            record.certificate_storage_path,
          ]);

      if (storageError) {
        alert(
          `The training record was deleted, but its certificate could not be removed: ${storageError.message}`
        );
      }
    }

    await loadPageData();
  }

  if (loading) {
    return (
      <CastodiaCard>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading training records...
        </div>
      </CastodiaCard>
    );
  }

  if (pageError) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center">
          <h1 className="text-xl font-semibold text-slate-950">
            Training records could not be loaded
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {pageError}
          </p>

          <CastodiaButton
            className="mt-6"
            onClick={() => void loadPageData()}
          >
            Try again
          </CastodiaButton>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <CastodiaPageShell
      title="Training"
      description="Manage staff training records, certificates and renewal dates."
      maxWidth="wide"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/manager/staff">
            <CastodiaButton variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Staff
            </CastodiaButton>
          </Link>

          <CastodiaButton
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Training Record
          </CastodiaButton>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Current
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.current}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Due soon
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.dueSoon}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Expired
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.expired}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            No expiry
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {summary.noExpiry}
          </p>
        </CastodiaCard>
      </div>

      <CastodiaSection
        title="Training Records"
        description={`${filteredRecords.length} record${
          filteredRecords.length === 1
            ? ""
            : "s"
        } shown`}
      >
        <CastodiaCard>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by course, staff member or provider"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="all">
                All statuses
              </option>

              <option value="current">
                Current
              </option>

              <option value="due-soon">
                Due soon
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="no-expiry">
                No expiry
              </option>
            </select>

            <select
              value={staffFilter}
              onChange={(event) =>
                setStaffFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">
                All staff
              </option>

              {staff.map((person) => (
                <option
                  key={person.id}
                  value={person.id}
                >
                  {person.full_name}
                </option>
              ))}
            </select>
          </div>
        </CastodiaCard>

        <TrainingRecordsTable
          records={filteredRecords}
          staff={staff}
          onViewCertificate={viewCertificate}
          onDeleteRecord={deleteTrainingRecord}
        />
      </CastodiaSection>

      <AddTrainingRecordModal
        open={modalOpen}
        saving={saving}
        staff={staff}
        courseOptions={courseOptions}
        onClose={closeModal}
        onSave={saveTrainingRecord}
      />
    </CastodiaPageShell>
  );
}