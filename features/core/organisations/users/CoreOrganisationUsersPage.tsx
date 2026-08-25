"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CastodiaPageShell } from "@/components/castodia";

type Organisation = {
  id: string;
  name: string;
};

type OrganisationUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type CreateUserForm = {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  role: string;
};

const initialForm: CreateUserForm = {
  firstName: "",
  surname: "",
  email: "",
  password: "",
  role: "manager",
};

function getUserName(user: OrganisationUser) {
  const fullName = [user.first_name, user.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || "Unnamed user";
}

function formatRole(role: string | null) {
  if (!role) {
    return "User";
  }

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CoreOrganisationUsersPage() {
  const params = useParams<{ id: string }>();
  const organisationId =
    typeof params?.id === "string" ? params.id : undefined;

  const [organisation, setOrganisation] =
    useState<Organisation | null>(null);

  const [users, setUsers] = useState<OrganisationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(initialForm);

  const loadPage = useCallback(
    async (showRefreshState = false) => {
      if (!organisationId) {
        setPageError("The organisation ID is missing from the URL.");
        setLoading(false);
        return;
      }

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError(null);

      try {
        const [organisationResult, usersResult] = await Promise.all([
          supabase
            .from("organisations")
            .select("id, name")
            .eq("id", organisationId)
            .maybeSingle(),

          supabase
            .from("profiles")
            .select(
              "id, first_name, surname, email, role, is_active, created_at"
            )
            .eq("organisation_id", organisationId)
            .order("created_at", { ascending: true }),
        ]);

        if (organisationResult.error) {
          console.error(
            "Organisation load error:",
            organisationResult.error
          );

          throw new Error(
            organisationResult.error.message ||
              "The organisation could not be loaded."
          );
        }

        if (!organisationResult.data) {
          throw new Error("The organisation could not be found.");
        }

        if (usersResult.error) {
          console.error("Organisation users load error:", usersResult.error);

          throw new Error(
            usersResult.error.message ||
              "The organisation users could not be loaded."
          );
        }

        setOrganisation(organisationResult.data);
        setUsers(usersResult.data ?? []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading this page.";

        setPageError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organisationId]
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  function updateForm(
    field: keyof CreateUserForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!organisationId) {
      setFormError("The organisation ID is missing.");
      return;
    }

    const firstName = form.firstName.trim();
    const surname = form.surname.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const role = form.role;

    if (!firstName) {
      setFormError("Enter the user's first name.");
      return;
    }

    if (!surname) {
      setFormError("Enter the user's surname.");
      return;
    }

    if (!email) {
      setFormError("Enter the user's email address.");
      return;
    }

    if (!password || password.length < 8) {
      setFormError("The temporary password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.access_token) {
        throw new Error(
          "Your session has expired. Sign in again and retry."
        );
      }

      const response = await fetch(
        `/api/core/organisations/${organisationId}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            firstName,
            surname,
            email,
            password,
            role,
          }),
        }
      );

      const result = (await response.json().catch(() => null)) as
        | {
            error?: string;
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            "The user could not be created."
        );
      }

      setForm(initialForm);
      setShowCreateForm(false);
      setSuccessMessage(
        `${firstName} ${surname} has been added to ${organisation?.name ?? "the organisation"}.`
      );

      await loadPage(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the user.";

      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <CastodiaPageShell
        title="Organisation users"
        description="Loading organisation users..."
        maxWidth="full"
      >
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin" size={22} />
            <span className="font-semibold">Loading users...</span>
          </div>
        </div>
      </CastodiaPageShell>
    );
  }

  if (pageError || !organisation) {
    return (
      <CastodiaPageShell
        title="Organisation users"
        description="This organisation could not be loaded."
        maxWidth="full"
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-800">
            Unable to load organisation
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {pageError ?? "The organisation could not be found."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadPage()}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800"
            >
              <RefreshCw size={17} />
              Retry
            </button>

            <Link
              href="/core/organisations"
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
            >
              <ArrowLeft size={17} />
              Back to organisations
            </Link>
          </div>
        </div>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell
      title={`${organisation.name} users`}
      description="Create and manage the accounts connected to this organisation."
      maxWidth="full"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
              <Users size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Organisation users
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                {users.length === 1
                  ? "1 user is connected to this organisation."
                  : `${users.length} users are connected to this organisation.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/core/organisations/${organisation.id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Organisation hub
            </Link>

            <button
              type="button"
              onClick={() => void loadPage(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setFormError(null);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-teal-600"
            >
              <Plus size={18} />
              Add user
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
            {successMessage}
          </div>
        )}

        {showCreateForm && (
          <form
            onSubmit={handleCreateUser}
            className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Create organisation user
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Create the user&apos;s login and connect it to{" "}
                  {organisation.name}.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  First name
                </span>

                <input
                  type="text"
                  value={form.firstName}
                  onChange={(event) =>
                    updateForm("firstName", event.target.value)
                  }
                  autoComplete="given-name"
                  disabled={submitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
                  placeholder="First name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Surname
                </span>

                <input
                  type="text"
                  value={form.surname}
                  onChange={(event) =>
                    updateForm("surname", event.target.value)
                  }
                  autoComplete="family-name"
                  disabled={submitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
                  placeholder="Surname"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Email address
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm("email", event.target.value)
                  }
                  autoComplete="email"
                  disabled={submitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
                  placeholder="manager@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Temporary password
                </span>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  autoComplete="new-password"
                  disabled={submitting}
                  minLength={8}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
                  placeholder="At least 8 characters"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">
                  Role
                </span>

                <select
                  value={form.role}
                  onChange={(event) =>
                    updateForm("role", event.target.value)
                  }
                  disabled={submitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100"
                >
                  <option value="manager">Manager</option>
                  <option value="support_worker">Support worker</option>
                  <option value="admin">Organisation admin</option>
                </select>
              </label>
            </div>

            {formError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormError(null);
                  setForm(initialForm);
                }}
                disabled={submitting}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating user...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create user
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <Users size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No organisation users yet
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Create the first manager account for {organisation.name}. This
              account will be able to sign in to the organisation&apos;s
              CastodiaCare Manager portal.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-cyan-600 hover:to-teal-600"
            >
              <Plus size={18} />
              Create first user
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Connected users
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Users currently assigned to {organisation.name}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                            <UserRound size={21} />
                          </div>

                          <div>
                            <p className="font-bold text-slate-950">
                              {getUserName(user)}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {user.email ?? "No email recorded"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                          <ShieldCheck size={14} />
                          {formatRole(user.role)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            user.is_active === false
                              ? "inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                              : "inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                          }
                        >
                          {user.is_active === false ? "Inactive" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-GB"
                            )
                          : "Not recorded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CastodiaPageShell>
  );
}