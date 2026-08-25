"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { CastodiaCard } from "@/components/castodia";
import { supabase } from "@/lib/supabase";

import EmarHubPage from "./EmarHubPage";
import type { ServiceUser } from "./types";

type EmarPageProps = {
  initialServiceUserId?: string;
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 750;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "An unexpected error occurred while loading service users.";
}

export default function EmarPage({
  initialServiceUserId = "",
}: EmarPageProps) {
  const router = useRouter();

  const [serviceUsers, setServiceUsers] = useState<
    ServiceUser[]
  >([]);

  const [selectedServiceUserId, setSelectedServiceUserId] =
    useState(initialServiceUserId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  const loadServiceUsers = useCallback(
    async (showFullLoader = true) => {
      const requestId = ++requestIdRef.current;

      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          throw new Error(
            "Your login session could not be confirmed. Please refresh the page or sign in again."
          );
        }

        const {
          data: currentProfile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("organisation_id")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!currentProfile?.organisation_id) {
          throw new Error(
            "Your organisation could not be identified."
          );
        }

        let loadedServiceUsers: ServiceUser[] | null =
          null;

        let finalErrorMessage =
          "The service-user query could not be completed.";

        for (
          let attempt = 0;
          attempt <= MAX_RETRIES;
          attempt += 1
        ) {
          const { data, error } = await supabase
            .from("service_users")
            .select("id, first_name, surname")
            .eq(
              "organisation_id",
              currentProfile.organisation_id
            )
            .eq("is_active", true)
            .order("first_name", {
              ascending: true,
            })
            .order("surname", {
              ascending: true,
            });

          if (!error) {
            loadedServiceUsers =
              (data ?? []) as ServiceUser[];

            break;
          }

          finalErrorMessage =
            error.message ||
            "The service-user query failed.";

          console.error(
            `Service-user query attempt ${
              attempt + 1
            } failed:`,
            {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          );

          if (attempt < MAX_RETRIES) {
            await wait(
              RETRY_DELAY_MS * (attempt + 1)
            );
          }
        }

        if (loadedServiceUsers === null) {
          throw new Error(finalErrorMessage);
        }

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setServiceUsers(loadedServiceUsers);

        setSelectedServiceUserId((currentId) => {
          const preferredId =
            initialServiceUserId || currentId;

          const preferredSelectionExists =
            loadedServiceUsers.some(
              (serviceUser) =>
                serviceUser.id === preferredId
            );

          if (preferredSelectionExists) {
            return preferredId;
          }

          return loadedServiceUsers[0]?.id ?? "";
        });
      } catch (error) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const message = getErrorMessage(error);

        console.error(
          "Unable to load service users:",
          message
        );

        setErrorMessage(message);
        setServiceUsers([]);
        setSelectedServiceUserId("");
      } finally {
        if (
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [initialServiceUserId]
  );

  useEffect(() => {
    mountedRef.current = true;

    void loadServiceUsers();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadServiceUsers]);

  function handleServiceUserChange(
    serviceUserId: string
  ) {
    if (
      !serviceUserId ||
      serviceUserId === selectedServiceUserId
    ) {
      return;
    }

    setSelectedServiceUserId(serviceUserId);

    router.push(
      `/care/manager/emar/${serviceUserId}`
    );
  }

  const selectedServiceUser =
    serviceUsers.find(
      (serviceUser) =>
        serviceUser.id === selectedServiceUserId
    ) ?? serviceUsers[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <CastodiaCard>
          <div className="space-y-5 p-2">
            <div className="h-11 max-w-md animate-pulse rounded-xl bg-slate-100" />

            <div className="rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-7 py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="h-24 w-24 animate-pulse rounded-3xl bg-slate-200" />

                <div className="flex-1">
                  <div className="h-9 w-64 max-w-full animate-pulse rounded-xl bg-slate-200" />

                  <div className="mt-4 h-5 w-48 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-2xl bg-white"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </CastodiaCard>

        <p className="text-center text-sm font-medium text-slate-500">
          Loading medication workspace...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Service users could not be loaded
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Castodia could not retrieve the service-user
            records.
          </p>

          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() =>
              void loadServiceUsers(true)
            }
            className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
          >
            Try again
          </button>
        </div>
      </CastodiaCard>
    );
  }

  if (!selectedServiceUser) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-2xl font-bold text-cyan-800">
            0
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            No service users available
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            No active service users are currently
            available for this organisation.
          </p>

          <button
            type="button"
            onClick={() =>
              void loadServiceUsers(false)
            }
            disabled={refreshing}
            className="mt-6 rounded-xl border border-cyan-200 bg-white px-6 py-3 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Checking..."
              : "Check again"}
          </button>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <div className="space-y-6">
      <EmarHubPage
        serviceUserId={selectedServiceUser.id}
        serviceUsers={serviceUsers}
        onServiceUserChange={
          handleServiceUserChange
        }
      />

      {refreshing ? (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
          Refreshing service-user information...
        </div>
      ) : null}
    </div>
  );
}