"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import AddFamilyMemberForm from "@/components/manager/family-access/AddFamilyMemberForm";
import { supabase } from "@/lib/supabase";

type FamilyAccessModalProps = {
  serviceUserId: string;
  serviceUserName: string;
  onClose: () => void;
};

type FamilyUser = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  relationship: string | null;
  is_active: boolean;
  created_at: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Family access could not be loaded.";
}

export default function FamilyAccessModal({
  serviceUserId,
  serviceUserName,
  onClose,
}: FamilyAccessModalProps) {
  const [familyUsers, setFamilyUsers] =
    useState<FamilyUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadFamilyUsers = useCallback(
    async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const {
          data,
          error,
        } = await supabase
          .from("family_users")
          .select(`
            id,
            auth_user_id,
            full_name,
            email,
            relationship,
            is_active,
            created_at
          `)
          .eq(
            "service_user_id",
            serviceUserId,
          )
          .order("full_name", {
            ascending: true,
          });

        if (error) {
          throw new Error(error.message);
        }

        setFamilyUsers(
          (data ?? []) as FamilyUser[],
        );
      } catch (error) {
        setFamilyUsers([]);

        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [serviceUserId],
  );

  useEffect(() => {
    void loadFamilyUsers();
  }, [loadFamilyUsers]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-access-title"
    >
      <button
        type="button"
        aria-label="Close Family Access"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-slate-50 shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-6 border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur-xl sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-400 text-white shadow-sm">
              <Users
                size={21}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                Castodia Family
              </p>

              <h2
                id="family-access-title"
                className="mt-1 text-xl font-semibold tracking-tight text-slate-950"
              >
                Family Access
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Manage who can access{" "}
                {serviceUserName}&apos;s
                Family area.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6 sm:p-7">
          <div className="space-y-7">
            {/* Existing access */}
            <section>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-950">
                  People with Family access
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Each person has their own
                  individual Castodia Family
                  account.
                </p>
              </div>

              {loading ? (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-600" />

                    Loading Family access...
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadFamilyUsers()
                    }
                    className="mt-3 text-sm font-semibold text-red-900 underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              ) : familyUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center">
                  <UserRound
                    className="mx-auto h-8 w-8 text-slate-400"
                    aria-hidden="true"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No Family access yet
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Add an approved relative or
                    contact below to give them
                    access to{" "}
                    {serviceUserName}&apos;s
                    Family area.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {familyUsers.map(
                    (familyUser) => (
                      <article
                        key={familyUser.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <UserRound
                              size={18}
                              aria-hidden="true"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-950">
                                  {
                                    familyUser.full_name
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {familyUser.relationship ||
                                    "Family contact"}
                                </p>
                              </div>

                              <span
                                className={[
                                  "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                                  familyUser.is_active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500",
                                ].join(
                                  " ",
                                )}
                              >
                                {familyUser.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-slate-600">
                              <Mail
                                size={13}
                                className="shrink-0"
                                aria-hidden="true"
                              />

                              <span className="truncate">
                                {
                                  familyUser.email
                                }
                              </span>
                            </div>

                            {familyUser.is_active ? (
                              <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-teal-700">
                                <ShieldCheck
                                  size={13}
                                  aria-hidden="true"
                                />

                                Family access
                                enabled
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Add new Family user */}
            <section>
              <AddFamilyMemberForm
                serviceUserId={
                  serviceUserId
                }
                serviceUserName={
                  serviceUserName
                }
                onCreated={() => {
                  void loadFamilyUsers();
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}