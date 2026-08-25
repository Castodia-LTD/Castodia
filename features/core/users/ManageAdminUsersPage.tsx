"use client";

import Image from "next/image";
import {
  Camera,
  Loader2,
  Pencil,
  Shield,
  Trash2,
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

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

type CastodiaRole = "castodia_owner" | "castodia_admin";

type AdministratorUser = {
  id: string;
  full_name: string;
  email: string;
  role: CastodiaRole;
  photo_url?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
};

type UsersResponse = {
  users?: AdministratorUser[];
  user?: AdministratorUser;
  error?: string;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function roleLabel(role: CastodiaRole) {
  return role === "castodia_owner"
    ? "Castodia Owner"
    : "CastodiaCore Administrator";
}

export default function ManageAdminUsersPage() {
  const createPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const [users, setUsers] = useState<AdministratorUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] =
    useState<CastodiaRole | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<CastodiaRole>("castodia_admin");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [editingUser, setEditingUser] =
    useState<AdministratorUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] =
    useState<CastodiaRole>("castodia_admin");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] =
    useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] =
    useState(false);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] =
    useState<string | null>(null);

  const createInitials = useMemo(
    () => getInitials(fullName),
    [fullName]
  );

  const editInitials = useMemo(
    () => getInitials(editFullName),
    [editFullName]
  );

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function authenticatedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
  ) {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("You must be logged in.");
    }

    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function loadUsers() {
    setLoadingUsers(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in.");
        return;
      }

      setCurrentUserId(user.id);

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (
        profile?.role !== "castodia_owner" &&
        profile?.role !== "castodia_admin"
      ) {
        throw new Error(
          "You do not have access to Castodia administrator users."
        );
      }

      setCurrentUserRole(profile.role);

      const response = await authenticatedFetch(
        "/api/core/users"
      );

      const result = (await response.json()) as UsersResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load administrator users."
        );
      }

      setUsers(result.users ?? []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load administrator users."
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  function validatePhoto(
    event: ChangeEvent<HTMLInputElement>,
    preview: string | null,
    setSelectedPhoto: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) {
    const selectedPhoto = event.target.files?.[0];

    if (!selectedPhoto) {
      return;
    }

    if (!allowedPhotoTypes.includes(selectedPhoto.type)) {
      alert("Please choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (selectedPhoto.size > MAX_PHOTO_SIZE) {
      alert("The profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setSelectedPhoto(selectedPhoto);
    setPreview(URL.createObjectURL(selectedPhoto));
  }

  function handleCreatePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    validatePhoto(
      event,
      photoPreview,
      setPhoto,
      setPhotoPreview
    );
  }

  function handleEditPhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    validatePhoto(
      event,
      editPhotoPreview,
      setEditPhoto,
      setEditPhotoPreview
    );
    setRemoveExistingPhoto(false);
  }

  function removeCreatePhoto() {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview(null);

    if (createPhotoInputRef.current) {
      createPhotoInputRef.current.value = "";
    }
  }

  function removeEditPhoto() {
    if (editPhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editPhotoPreview);
    }

    setEditPhoto(null);
    setEditPhotoPreview(null);
    setRemoveExistingPhoto(true);

    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value = "";
    }
  }

  function resetCreateForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("castodia_admin");
    removeCreatePhoto();
  }

  async function uploadProfilePhoto(
    userId: string,
    selectedPhoto: File
  ) {
    const extension =
      selectedPhoto.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      `${userId}/profile-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("staff-photos")
      .upload(filePath, selectedPhoto, {
        cacheControl: "3600",
        upsert: true,
        contentType: selectedPhoto.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("staff-photos")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function createAdministrator() {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      alert("Enter the administrator's name.");
      return;
    }

    if (!trimmedEmail) {
      alert("Enter the administrator's email address.");
      return;
    }

    if (password.length < 8) {
      alert(
        "The temporary password must contain at least 8 characters."
      );
      return;
    }

    if (
      role === "castodia_owner" &&
      currentUserRole !== "castodia_owner"
    ) {
      alert("Only a Castodia Owner can create another owner.");
      return;
    }

    setCreatingUser(true);

    try {
      const response = await authenticatedFetch(
        "/api/core/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: trimmedName,
            email: trimmedEmail,
            password,
            role,
          }),
        }
      );

      const result = (await response.json()) as UsersResponse;

      if (!response.ok || !result.user) {
        throw new Error(
          result.error || "Unable to create administrator."
        );
      }

      if (photo) {
        try {
          const photoUrl = await uploadProfilePhoto(
            result.user.id,
            photo
          );

          const updateResponse = await authenticatedFetch(
            `/api/core/users/${result.user.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ photoUrl }),
            }
          );

          const updateResult =
            (await updateResponse.json()) as UsersResponse;

          if (!updateResponse.ok) {
            alert(
              `The administrator was created, but the photo could not be attached: ${
                updateResult.error || "Unknown error"
              }`
            );
          }
        } catch (photoError) {
          alert(
            `The administrator was created, but the photo could not be uploaded: ${
              photoError instanceof Error
                ? photoError.message
                : "Unknown error"
            }`
          );
        }
      }

      resetCreateForm();
      await loadUsers();
      alert("Administrator created successfully.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to create administrator."
      );
    } finally {
      setCreatingUser(false);
    }
  }

  function openEdit(user: AdministratorUser) {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditRole(user.role);
    setEditPhoto(null);
    setEditPhotoPreview(user.photo_url ?? null);
    setRemoveExistingPhoto(false);
  }

  function closeEdit() {
    if (editPhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editPhotoPreview);
    }

    setEditingUser(null);
    setEditFullName("");
    setEditRole("castodia_admin");
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setRemoveExistingPhoto(false);

    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value = "";
    }
  }

  async function saveAdministrator() {
    if (!editingUser) {
      return;
    }

    const trimmedName = editFullName.trim();

    if (!trimmedName) {
      alert("Enter the administrator's name.");
      return;
    }

    if (
      editRole === "castodia_owner" &&
      currentUserRole !== "castodia_owner"
    ) {
      alert("Only a Castodia Owner can assign owner access.");
      return;
    }

    setSavingUser(true);

    try {
      let photoUrl: string | null | undefined;

      if (editPhoto) {
        photoUrl = await uploadProfilePhoto(
          editingUser.id,
          editPhoto
        );
      } else if (removeExistingPhoto) {
        photoUrl = null;
      }

      const response = await authenticatedFetch(
        `/api/core/users/${editingUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: trimmedName,
            role: editRole,
            ...(photoUrl !== undefined ? { photoUrl } : {}),
          }),
        }
      );

      const result = (await response.json()) as UsersResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to update administrator."
        );
      }

      closeEdit();
      await loadUsers();
      alert("Administrator updated successfully.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update administrator."
      );
    } finally {
      setSavingUser(false);
    }
  }

  async function deleteAdministrator(user: AdministratorUser) {
    if (user.id === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.full_name}?\n\nThis permanently removes their Castodia login and profile.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);

    try {
      const response = await authenticatedFetch(
        `/api/core/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const result = (await response.json()) as UsersResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to delete administrator."
        );
      }

      await loadUsers();
      alert("Administrator deleted.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete administrator."
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }

      if (editPhotoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editPhotoPreview);
      }
    };
  }, [photoPreview, editPhotoPreview]);

  const canManageUsers =
    currentUserRole === "castodia_owner";

  return (
    <CastodiaPageShell
      title="Administrator Users"
      description="Create and manage Castodia Owner and CastodiaCore Administrator accounts."
      maxWidth="wide"
    >
      <CastodiaSection title="Create Administrator Login">
        <CastodiaCard>
          {!canManageUsers && !loadingUsers ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Only a Castodia Owner can create, edit or delete
              administrator accounts.
            </div>
          ) : null}

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
                      alt="Selected administrator profile"
                      fill
                      sizes="96px"
                      unoptimized={photoPreview.startsWith("blob:")}
                      className="object-cover"
                    />
                  ) : createInitials ? (
                    <span className="text-2xl font-bold text-slate-600">
                      {createInitials}
                    </span>
                  ) : (
                    <UserRound
                      className="h-10 w-10 text-slate-500"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <input
                  ref={createPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCreatePhotoChange}
                  disabled={!canManageUsers || creatingUser}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() =>
                    createPhotoInputRef.current?.click()
                  }
                  disabled={!canManageUsers || creatingUser}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  {photo ? "Change photo" : "Choose photo"}
                </button>

                {photo ? (
                  <button
                    type="button"
                    onClick={removeCreatePhoto}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" />
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
                  htmlFor="admin-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Administrator name
                </label>

                <input
                  id="admin-name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Administrator name"
                  autoComplete="name"
                  disabled={!canManageUsers || creatingUser}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="admin-email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  disabled={!canManageUsers || creatingUser}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Temporary password
                </label>

                <input
                  id="admin-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Temporary password"
                  type="password"
                  autoComplete="new-password"
                  disabled={!canManageUsers || creatingUser}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-role"
                  className="text-sm font-medium text-slate-700"
                >
                  Role
                </label>

                <select
                  id="admin-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as CastodiaRole)
                  }
                  disabled={!canManageUsers || creatingUser}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="castodia_admin">
                    CastodiaCore Administrator
                  </option>
                  <option value="castodia_owner">
                    Castodia Owner
                  </option>
                </select>
              </div>

              <div className="md:col-span-2 md:flex md:justify-end">
                <CastodiaButton
                  onClick={createAdministrator}
                  disabled={!canManageUsers || creatingUser}
                >
                  {creatingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating administrator...
                    </>
                  ) : (
                    "Create Administrator"
                  )}
                </CastodiaButton>
              </div>
            </div>
          </div>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection
        title="Administrator Users"
        description={
          loadingUsers
            ? "Loading administrator users..."
            : `${users.length} administrator${
                users.length === 1 ? "" : "s"
              } found`
        }
      >
        {loadingUsers ? (
          <CastodiaCard>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading administrator users...
            </div>
          </CastodiaCard>
        ) : users.length === 0 ? (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              No administrator users found.
            </p>
          </CastodiaCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const deleting = deletingUserId === user.id;

              return (
                <CastodiaCard key={user.id} padding="md">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-blue-500 to-teal-400">
                      {user.photo_url ? (
                        <Image
                          src={user.photo_url}
                          alt={`${user.full_name}'s profile`}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {getInitials(user.full_name) || "?"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-slate-950">
                            {user.full_name}
                          </h2>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>

                        <CastodiaBadge
                          variant={
                            user.role === "castodia_owner"
                              ? "info"
                              : "neutral"
                          }
                        >
                          {user.role === "castodia_owner"
                            ? "Owner"
                            : "Admin"}
                        </CastodiaBadge>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Shield className="h-3.5 w-3.5" />
                        {roleLabel(user.role)}
                        {isCurrentUser ? " · You" : ""}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          disabled={!canManageUsers || savingUser}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteAdministrator(user)
                          }
                          disabled={
                            !canManageUsers ||
                            isCurrentUser ||
                            deleting
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
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

      {editingUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-administrator-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-administrator-title"
                  className="text-xl font-semibold text-slate-950"
                >
                  Edit Administrator
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update profile details and CastodiaCore access.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={savingUser}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close edit administrator"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[140px_minmax(0,1fr)]">
              <div className="flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-200">
                  {editPhotoPreview ? (
                    <Image
                      src={editPhotoPreview}
                      alt="Administrator profile"
                      fill
                      sizes="96px"
                      unoptimized={editPhotoPreview.startsWith("blob:")}
                      className="object-cover"
                    />
                  ) : editInitials ? (
                    <span className="text-2xl font-bold text-slate-600">
                      {editInitials}
                    </span>
                  ) : (
                    <UserRound className="h-10 w-10 text-slate-500" />
                  )}
                </div>

                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditPhotoChange}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() =>
                    editPhotoInputRef.current?.click()
                  }
                  disabled={savingUser}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Camera className="h-4 w-4" />
                  Change
                </button>

                {editPhotoPreview ? (
                  <button
                    type="button"
                    onClick={removeEditPhoto}
                    disabled={savingUser}
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4">
                <div>
                  <label
                    htmlFor="edit-admin-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Administrator name
                  </label>
                  <input
                    id="edit-admin-name"
                    value={editFullName}
                    onChange={(event) =>
                      setEditFullName(event.target.value)
                    }
                    disabled={savingUser}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-admin-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="edit-admin-email"
                    value={editingUser.email}
                    disabled
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email changes require a separate secure
                    account-email workflow.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-admin-role"
                    className="text-sm font-medium text-slate-700"
                  >
                    Role
                  </label>
                  <select
                    id="edit-admin-role"
                    value={editRole}
                    onChange={(event) =>
                      setEditRole(
                        event.target.value as CastodiaRole
                      )
                    }
                    disabled={savingUser}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="castodia_admin">
                      CastodiaCore Administrator
                    </option>
                    <option value="castodia_owner">
                      Castodia Owner
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeEdit}
                disabled={savingUser}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <CastodiaButton
                onClick={saveAdministrator}
                disabled={savingUser}
              >
                {savingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </CastodiaButton>
            </div>
          </div>
        </div>
      ) : null}
    </CastodiaPageShell>
  );
}
