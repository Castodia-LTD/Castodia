"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Pencil,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { Staff } from "@/lib/admin/staff/types";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

type StaffWithPhoto = Staff & {
  photo_url?: string | null;
};

type StaffRole = "manager" | "support";

type CreateStaffResponse = {
  error?: string;
  staffId?: string;
  userId?: string;
  user?: {
    id?: string;
  };
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const allowedPhotoTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function StaffAdminPage() {
  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  const editPhotoInputRef =
    useRef<HTMLInputElement | null>(null);

  const [staff, setStaff] =
    useState<StaffWithPhoto[]>([]);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState<StaffRole>("support");

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [loadingStaff, setLoadingStaff] =
    useState(true);

  const [creatingStaff, setCreatingStaff] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState<StaffWithPhoto | null>(null);

  const [editFullName, setEditFullName] =
    useState("");

  const [editRole, setEditRole] =
    useState<StaffRole>("support");

  const [editPhoto, setEditPhoto] =
    useState<File | null>(null);

  const [
    editPhotoPreview,
    setEditPhotoPreview,
  ] = useState<string | null>(null);

  const [
    removeExistingPhoto,
    setRemoveExistingPhoto,
  ] = useState(false);

  const [savingStaff, setSavingStaff] =
    useState(false);

  const initials = useMemo(() => {
    if (!fullName.trim()) {
      return "";
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("");
  }, [fullName]);

  async function loadStaff() {
    setLoadingStaff(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        data: currentProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("organisation_id")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !currentProfile?.organisation_id
      ) {
        alert("Organisation not found.");
        return;
      }

      const { data, error } =
        await supabase
          .from("profiles")
          .select(
            "id, full_name, role, photo_url",
          )
          .eq(
            "organisation_id",
            currentProfile.organisation_id,
          )
          .order("full_name");

      if (error) {
        alert(error.message);
        return;
      }

      setStaff(
        (data ?? []) as StaffWithPhoto[],
      );
    } finally {
      setLoadingStaff(false);
    }
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedPhoto =
      event.target.files?.[0];

    if (!selectedPhoto) {
      return;
    }

    if (
      !allowedPhotoTypes.includes(
        selectedPhoto.type,
      )
    ) {
      alert(
        "Please choose a JPG, PNG or WebP image.",
      );

      event.target.value = "";
      return;
    }

    if (
      selectedPhoto.size >
      MAX_PHOTO_SIZE
    ) {
      alert(
        "The profile photo must be smaller than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(selectedPhoto);

    setPhotoPreview(
      URL.createObjectURL(selectedPhoto),
    );
  }

  function removePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview(null);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("support");
    removePhoto();
  }

  function startEditing(
    person: StaffWithPhoto,
  ) {
    if (editPhotoPreview) {
      URL.revokeObjectURL(
        editPhotoPreview,
      );
    }

    setEditingStaff(person);

    setEditFullName(
      person.full_name,
    );

    setEditRole(
      person.role === "manager"
        ? "manager"
        : "support",
    );

    setEditPhoto(null);
    setEditPhotoPreview(null);
    setRemoveExistingPhoto(false);

    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value =
        "";
    }
  }

  function cancelEditing() {
    if (editPhotoPreview) {
      URL.revokeObjectURL(
        editPhotoPreview,
      );
    }

    setEditingStaff(null);
    setEditFullName("");
    setEditRole("support");
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setRemoveExistingPhoto(false);

    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value =
        "";
    }
  }

  function handleEditPhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedPhoto =
      event.target.files?.[0];

    if (!selectedPhoto) {
      return;
    }

    if (
      !allowedPhotoTypes.includes(
        selectedPhoto.type,
      )
    ) {
      alert(
        "Please choose a JPG, PNG or WebP image.",
      );

      event.target.value = "";
      return;
    }

    if (
      selectedPhoto.size >
      MAX_PHOTO_SIZE
    ) {
      alert(
        "The profile photo must be smaller than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (editPhotoPreview) {
      URL.revokeObjectURL(
        editPhotoPreview,
      );
    }

    setEditPhoto(selectedPhoto);

    setEditPhotoPreview(
      URL.createObjectURL(selectedPhoto),
    );

    setRemoveExistingPhoto(false);
  }

  function removeEditPhoto() {
    if (editPhotoPreview) {
      URL.revokeObjectURL(
        editPhotoPreview,
      );
    }

    setEditPhoto(null);
    setEditPhotoPreview(null);
    setRemoveExistingPhoto(true);

    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value =
        "";
    }
  }

  async function uploadStaffPhoto(
    staffId: string,
    selectedPhoto: File,
  ) {
    const extension =
      selectedPhoto.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath =
      `${staffId}/profile-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("staff-photos")
        .upload(
          filePath,
          selectedPhoto,
          {
            cacheControl: "3600",
            upsert: true,
            contentType:
              selectedPhoto.type,
          },
        );

    if (uploadError) {
      throw new Error(
        uploadError.message,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("staff-photos")
      .getPublicUrl(filePath);

    const {
      error: profileUpdateError,
    } = await supabase
      .from("profiles")
      .update({
        photo_url: publicUrl,
      })
      .eq("id", staffId);

    if (profileUpdateError) {
      await supabase.storage
        .from("staff-photos")
        .remove([filePath]);

      throw new Error(
        profileUpdateError.message,
      );
    }

    return publicUrl;
  }

  async function saveStaffChanges() {
    if (!editingStaff) {
      return;
    }

    const trimmedName =
      editFullName.trim();

    if (!trimmedName) {
      alert(
        "Enter the staff member's name.",
      );

      return;
    }

    setSavingStaff(true);

    try {
      const updates: {
        full_name: string;
        role: StaffRole;
        photo_url?: null;
      } = {
        full_name: trimmedName,
        role: editRole,
      };

      if (
        removeExistingPhoto &&
        !editPhoto
      ) {
        updates.photo_url = null;
      }

      const { error: updateError } =
        await supabase
          .from("profiles")
          .update(updates)
          .eq(
            "id",
            editingStaff.id,
          );

      if (updateError) {
        throw new Error(
          updateError.message,
        );
      }

      if (editPhoto) {
        await uploadStaffPhoto(
          editingStaff.id,
          editPhoto,
        );
      }

      await loadStaff();

      cancelEditing();

      alert(
        "Staff profile updated successfully.",
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update the staff profile.",
      );
    } finally {
      setSavingStaff(false);
    }
  }

  async function createStaff() {
    const trimmedName =
      fullName.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedName) {
      alert(
        "Enter the staff member's name.",
      );

      return;
    }

    if (!trimmedEmail) {
      alert(
        "Enter the staff member's email address.",
      );

      return;
    }

    if (!password) {
      alert(
        "Enter a temporary password.",
      );

      return;
    }

    if (password.length < 8) {
      alert(
        "The temporary password must contain at least 8 characters.",
      );

      return;
    }

    setCreatingStaff(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "You must be logged in.",
        );

        return;
      }

      const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  throw new Error(
    "Your session has expired. Please sign in again.",
  );
}

const response = await fetch(
  "/api/admin/create-staff",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      fullName: trimmedName,
      email: trimmedEmail,
      password,
      role,
    }),
  },
);

      const result =
        (await response.json()) as CreateStaffResponse;

      if (!response.ok) {
        alert(
          result.error ||
            "Unable to create staff member.",
        );

        return;
      }

      const createdStaffId =
        result.staffId ??
        result.userId ??
        result.user?.id;

      if (
        photo &&
        createdStaffId
      ) {
        try {
          await uploadStaffPhoto(
            createdStaffId,
            photo,
          );
        } catch (photoError) {
          const message =
            photoError instanceof Error
              ? photoError.message
              : "The profile photo could not be uploaded.";

          alert(
            `The staff account was created, but the photo could not be saved: ${message}`,
          );
        }
      } else if (
        photo &&
        !createdStaffId
      ) {
        alert(
          "The staff account was created, but the API did not return the staff ID, so the photo could not be attached.",
        );
      }

      resetForm();

      await loadStaff();

      alert(
        "Staff member created successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create staff member.";

      alert(message);
    } finally {
      setCreatingStaff(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview,
        );
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (editPhotoPreview) {
        URL.revokeObjectURL(
          editPhotoPreview,
        );
      }
    };
  }, [editPhotoPreview]);

  return (
    <CastodiaPageShell
      title="Staff Management"
      description="Create staff logins and manage staff access across your organisation."
      maxWidth="wide"
    >
      <div className="mb-6">
        <Link
          href="/manager/staff"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition hover:text-cyan-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Hub
        </Link>
      </div>

      <CastodiaSection title="Create Staff Login">
        <CastodiaCard>
          <div className="grid gap-6 xl:grid-cols-[160px_minmax(0,1fr)]">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Profile photo
              </p>

              <div className="mt-2 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-200">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Selected staff profile"
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : initials ? (
                    <span className="text-2xl font-bold text-slate-600">
                      {initials}
                    </span>
                  ) : (
                    <UserRound
                      className="h-10 w-10 text-slate-500"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handlePhotoChange
                  }
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() =>
                    photoInputRef.current?.click()
                  }
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <Camera
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  {photo
                    ? "Change photo"
                    : "Choose photo"}
                </button>

                {photo ? (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <X
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    Remove
                  </button>
                ) : null}

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  JPG, PNG or WebP.
                  <br />
                  Maximum 5 MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="staff-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Staff name
                </label>

                <input
                  id="staff-name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                  placeholder="Staff name"
                  autoComplete="name"
                  disabled={creatingStaff}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="staff-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="staff-email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  disabled={creatingStaff}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="staff-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Temporary password
                </label>

                <input
                  id="staff-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Temporary password"
                  type="password"
                  autoComplete="new-password"
                  disabled={creatingStaff}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="staff-role"
                  className="text-sm font-medium text-slate-700"
                >
                  Role
                </label>

                <select
                  id="staff-role"
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target
                        .value as StaffRole,
                    )
                  }
                  disabled={creatingStaff}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="support">
                    Support Worker
                  </option>

                  <option value="manager">
                    Manager
                  </option>
                </select>
              </div>

              <div className="md:col-span-2 md:flex md:justify-end">
                <CastodiaButton
                  onClick={createStaff}
                  disabled={creatingStaff}
                >
                  {creatingStaff ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Creating staff...
                    </>
                  ) : (
                    "Create Staff"
                  )}
                </CastodiaButton>
              </div>
            </div>
          </div>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection
        title="Staff Members"
        description={
          loadingStaff
            ? "Loading staff members..."
            : `${staff.length} staff member${
                staff.length === 1
                  ? ""
                  : "s"
              } found`
        }
      >
        {loadingStaff ? (
          <CastodiaCard>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />

              Loading staff members...
            </div>
          </CastodiaCard>
        ) : staff.length === 0 ? (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              No staff members found.
            </p>
          </CastodiaCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((person) => {
              const personInitials =
                person.full_name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) =>
                    part
                      .charAt(0)
                      .toUpperCase(),
                  )
                  .join("");

              return (
                <CastodiaCard
                  key={person.id}
                  padding="md"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-blue-500 to-teal-400">
                      {person.photo_url ? (
                        <Image
                          src={
                            person.photo_url
                          }
                          alt={`${person.full_name}'s profile`}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {personInitials ||
                            "?"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-slate-950">
                            {
                              person.full_name
                            }
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {person.role ===
                            "manager"
                              ? "Manager"
                              : "Support Worker"}
                          </p>
                        </div>

                        <CastodiaBadge
                          variant={
                            person.role ===
                            "manager"
                              ? "info"
                              : "neutral"
                          }
                        >
                          {person.role ===
                          "manager"
                            ? "Manager"
                            : "Support"}
                        </CastodiaBadge>

                        <button
                          type="button"
                          onClick={() =>
                            startEditing(
                              person,
                            )
                          }
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                          aria-label={`Edit ${person.full_name}`}
                        >
                          <Pencil
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </CastodiaCard>
              );
            })}
          </div>
        )}
      </CastodiaSection>

      {editingStaff ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-staff-title"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !savingStaff
            ) {
              cancelEditing();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-staff-title"
                  className="text-xl font-semibold text-slate-950"
                >
                  Edit staff profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the staff
                  member&apos;s name,
                  role or profile photo.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={savingStaff}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                aria-label="Close edit profile"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[150px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Profile photo
                </p>

                <div className="mt-2 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-blue-500 to-teal-400">
                    {editPhotoPreview ? (
                      <Image
                        src={
                          editPhotoPreview
                        }
                        alt="New staff profile"
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : editingStaff.photo_url &&
                      !removeExistingPhoto ? (
                      <Image
                        src={
                          editingStaff.photo_url
                        }
                        alt={`${editingStaff.full_name}'s profile`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {editFullName
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) =>
                            part
                              .charAt(0)
                              .toUpperCase(),
                          )
                          .join("") || "?"}
                      </span>
                    )}
                  </div>

                  <input
                    ref={
                      editPhotoInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleEditPhotoChange
                    }
                    disabled={savingStaff}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      editPhotoInputRef.current?.click()
                    }
                    disabled={savingStaff}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Camera
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Choose photo
                  </button>

                  {editPhotoPreview ||
                  (editingStaff.photo_url &&
                    !removeExistingPhoto) ? (
                    <button
                      type="button"
                      onClick={
                        removeEditPhoto
                      }
                      disabled={
                        savingStaff
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div>
                  <label
                    htmlFor="edit-staff-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Staff name
                  </label>

                  <input
                    id="edit-staff-name"
                    value={editFullName}
                    onChange={(event) =>
                      setEditFullName(
                        event.target.value,
                      )
                    }
                    disabled={savingStaff}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-staff-role"
                    className="text-sm font-medium text-slate-700"
                  >
                    Role
                  </label>

                  <select
                    id="edit-staff-role"
                    value={editRole}
                    onChange={(event) =>
                      setEditRole(
                        event.target
                          .value as StaffRole,
                      )
                    }
                    disabled={savingStaff}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  >
                    <option value="support">
                      Support Worker
                    </option>

                    <option value="manager">
                      Manager
                    </option>
                  </select>
                </div>

                <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <CastodiaButton
                    variant="secondary"
                    onClick={
                      cancelEditing
                    }
                    disabled={
                      savingStaff
                    }
                  >
                    Cancel
                  </CastodiaButton>

                  <CastodiaButton
                    onClick={
                      saveStaffChanges
                    }
                    disabled={
                      savingStaff
                    }
                  >
                    {savingStaff ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <Save
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Save changes
                      </>
                    )}
                  </CastodiaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </CastodiaPageShell>
  );
}