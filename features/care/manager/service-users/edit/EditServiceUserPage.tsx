"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { CastodiaCard } from "@/components/castodia";
import { createClient } from "@/lib/supabase/client";

const PHOTO_BUCKET = "service-user-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type Props = {
  serviceUserId: string;
};

type ServiceUserRecord = {
  id: string;
  full_name: string;
  house_name: string | null;
  date_of_birth: string | null;
  photo_path: string | null;
};

type SupabaseLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  statusCode?: string;
  error?: string;
};

export default function EditServiceUserPage({
  serviceUserId,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [houseName, setHouseName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(
    null
  );
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(
    null
  );

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadExistingPhoto = useCallback(
    async (photoPath: string | null) => {
      if (!photoPath) {
        setExistingPhotoUrl(null);
        return;
      }

      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photoPath, 60 * 60);

      if (error) {
        console.error("Unable to create profile photo URL:", {
          message: error.message,
          name: error.name,
          photoPath,
        });

        setExistingPhotoUrl(null);
        return;
      }

      setExistingPhotoUrl(data.signedUrl);
    },
    [supabase]
  );

  const loadServiceUser = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("service_users")
      .select(
        "id, full_name, house_name, date_of_birth, photo_path"
      )
      .eq("id", serviceUserId)
      .maybeSingle<ServiceUserRecord>();

    if (error) {
      console.error("Unable to load service user:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        serviceUserId,
      });

      setErrorMessage(
        error.message || "The service user could not be loaded."
      );
      setLoading(false);
      return;
    }

    if (!data) {
      setErrorMessage("No matching service user was found.");
      setLoading(false);
      return;
    }

    setFullName(data.full_name ?? "");
    setHouseName(data.house_name ?? "");
    setDateOfBirth(data.date_of_birth ?? "");
    setExistingPhotoPath(data.photo_path ?? null);

    await loadExistingPhoto(data.photo_path ?? null);

    setLoading(false);
  }, [loadExistingPhoto, serviceUserId, supabase]);

  useEffect(() => {
    void loadServiceUser();
  }, [loadServiceUser]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("The profile photograph must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemovePhoto(false);
  }

  function handleRemovePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedPhoto(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function handleCancelPhotoChange() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedPhoto(null);
    setPreviewUrl(null);
    setRemovePhoto(false);
  }

  function getFileExtension(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension) {
      return extension;
    }

    if (file.type === "image/png") {
      return "png";
    }

    if (file.type === "image/webp") {
      return "webp";
    }

    return "jpg";
  }

  async function uploadProfilePhoto(file: File) {
    const extension = getFileExtension(file);
    const photoPath = `${serviceUserId}/profile-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(photoPath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return photoPath;
  }

  async function deletePhoto(photoPath: string | null) {
    if (!photoPath) {
      return;
    }

    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([photoPath]);

    if (error) {
      console.error("Unable to delete profile photo:", {
        message: error.message,
        name: error.name,
        photoPath,
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedFullName = fullName.trim();
    const cleanedHouseName = houseName.trim();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!cleanedFullName) {
      setErrorMessage("The service user's full name is required.");
      return;
    }

    setSaving(true);

    let newPhotoPath = existingPhotoPath;
    let uploadedPhotoPath: string | null = null;

    try {
      if (selectedPhoto) {
        uploadedPhotoPath = await uploadProfilePhoto(selectedPhoto);
        newPhotoPath = uploadedPhotoPath;
      } else if (removePhoto) {
        newPhotoPath = null;
      }

      const {
        data: updatedServiceUser,
        error: updateError,
      } = await supabase
        .from("service_users")
        .update({
          full_name: cleanedFullName,
          house_name: cleanedHouseName || null,
          date_of_birth: dateOfBirth || null,
          photo_path: newPhotoPath,
        })
        .eq("id", serviceUserId)
        .select("id")
        .maybeSingle();

      if (updateError) {
        if (uploadedPhotoPath) {
          await deletePhoto(uploadedPhotoPath);
        }

        throw updateError;
      }

      if (!updatedServiceUser) {
        if (uploadedPhotoPath) {
          await deletePhoto(uploadedPhotoPath);
        }

        throw new Error(
          "No service user record was updated. Check the service_users update policy."
        );
      }

      if (
        existingPhotoPath &&
        existingPhotoPath !== newPhotoPath
      ) {
        await deletePhoto(existingPhotoPath);
      }

      setExistingPhotoPath(newPhotoPath);
      setSelectedPhoto(null);
      setRemovePhoto(false);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      await loadExistingPhoto(newPhotoPath);

      setSuccessMessage("Service user details updated successfully.");

      router.refresh();

      window.setTimeout(() => {
        router.push(`/care/manager/service-users/${serviceUserId}`);
      }, 700);
    } catch (error: unknown) {
      const supabaseError =
        error && typeof error === "object"
          ? (error as SupabaseLikeError)
          : null;

      console.error("Unable to update service user:", {
        error,
        message: supabaseError?.message,
        details: supabaseError?.details,
        hint: supabaseError?.hint,
        code: supabaseError?.code,
        statusCode: supabaseError?.statusCode,
        storageError: supabaseError?.error,
        serviceUserId,
      });

      setErrorMessage(
        supabaseError?.message ||
          supabaseError?.error ||
          "The service user could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  const displayedPhotoUrl = previewUrl
    ? previewUrl
    : removePhoto
      ? null
      : existingPhotoUrl;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="p-6">
        <CastodiaCard>
          <p className="text-sm font-semibold text-slate-600">
            Loading service user…
          </p>
        </CastodiaCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-cyan-700">
          Service User Hub
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit Service User
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Update the service user&apos;s core details and profile photograph.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <CastodiaCard>
          <div className="space-y-8">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
              >
                {successMessage}
              </div>
            )}

            <section>
              <h2 className="text-lg font-bold text-slate-950">
                Profile Photograph
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Upload a clear photograph in JPG, PNG or WebP format.
              </p>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                {displayedPhotoUrl ? (
                  <img
                    src={displayedPhotoUrl}
                    alt={fullName || "Service user"}
                    className="h-40 w-40 rounded-full object-cover shadow-lg ring-8 ring-cyan-50"
                  />
                ) : (
                  <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-5xl font-bold text-white shadow-lg ring-8 ring-cyan-50">
                    {initials || "SU"}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
                    Choose Photograph
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="sr-only"
                      disabled={saving}
                    />
                  </label>

                  {(existingPhotoPath || selectedPhoto) && !removePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={saving}
                      className="block rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove Photograph
                    </button>
                  )}

                  {(selectedPhoto || removePhoto) && (
                    <button
                      type="button"
                      onClick={handleCancelPhotoChange}
                      disabled={saving}
                      className="block rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel Photo Change
                    </button>
                  )}

                  <p className="text-xs text-slate-500">
                    Maximum file size: 5 MB.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200" />

            <section className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="houseName"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  House
                </label>

                <input
                  id="houseName"
                  type="text"
                  value={houseName}
                  onChange={(event) => setHouseName(event.target.value)}
                  disabled={saving}
                  placeholder="No house assigned"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Date of Birth
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push(`/care/manager/service-users/${serviceUserId}`)
                }
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </CastodiaCard>
      </form>
    </div>
  );
}