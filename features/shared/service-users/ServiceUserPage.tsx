"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CastodiaCard } from "@/components/castodia";
import ServiceUserHubHeader from "@/features/manager/service-users/components/ServiceUserHubHeader";
import { supabase } from "@/lib/supabase";

type Portal = "manager" | "support";

type Props = {
  portal: Portal;
};

type ServiceUser = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_url: string | null;
  house_name: string | null;
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

export default function ServiceUserPage({ portal }: Props) {
  const router = useRouter();

  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUserId, setSelectedServiceUserId] =
    useState<string>("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        let loadedServiceUsers: ServiceUser[] | null = null;
        let finalErrorMessage =
          "The service-user query could not be completed.";

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
          /*
           * Only fields already known to exist are selected here.
           *
           * The previous query also selected `dob` and `active`.
           * If either field does not exist in your table, Supabase rejects
           * the entire request and the page incorrectly appears empty.
           */
          const { data, error } = await supabase
            .from("service_users")
            .select(
              `
                id,
                full_name,
                first_name,
                surname,
                photo_url,
                house_name
              `
            )
            .order("full_name", { ascending: true });

          if (!error) {
            loadedServiceUsers = (data ?? []) as ServiceUser[];
            break;
          }

          finalErrorMessage =
            error.message || "The service-user query failed.";

          console.error(
            `Service-user query attempt ${attempt + 1} failed:`,
            JSON.stringify(
              {
                message: error.message ?? null,
                code: error.code ?? null,
                details: error.details ?? null,
                hint: error.hint ?? null,
              },
              null,
              2
            )
          );

          if (attempt < MAX_RETRIES) {
            await wait(RETRY_DELAY_MS * (attempt + 1));
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
          const currentSelectionStillExists =
            loadedServiceUsers.some(
              (serviceUser) => serviceUser.id === currentId
            );

          if (currentSelectionStillExists) {
            return currentId;
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

        console.error("Unable to load service users:", message);

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
    []
  );

  useEffect(() => {
    mountedRef.current = true;

    void loadServiceUsers();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadServiceUsers]);

  function handleServiceUserChange(serviceUserId: string) {
    if (!serviceUserId) {
      return;
    }

    setSelectedServiceUserId(serviceUserId);

    router.push(`/${portal}/service-users/${serviceUserId}`);
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
            <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />

            <div className="h-12 max-w-sm animate-pulse rounded-xl bg-slate-100" />

            <div className="rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-8 py-10">
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 animate-pulse rounded-full bg-slate-200" />

                <div className="mt-6 h-10 w-64 max-w-full animate-pulse rounded-xl bg-slate-200" />

                <div className="mt-5 flex gap-3">
                  <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
                </div>

                <div className="mt-5 h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-11 w-32 animate-pulse rounded-xl bg-slate-100"
                  />
                )
              )}
            </div>
          </div>
        </CastodiaCard>

        <p className="text-center text-sm font-medium text-slate-500">
          Loading service users...
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
            records. This may be caused by a temporary
            connection, session or permissions issue.
          </p>

          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() => void loadServiceUsers(true)}
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
            The database request completed successfully, but
            no service users are currently available to your
            account.
          </p>

          <button
            type="button"
            onClick={() => void loadServiceUsers(false)}
            disabled={refreshing}
            className="mt-6 rounded-xl border border-cyan-200 bg-white px-6 py-3 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Checking..." : "Check again"}
          </button>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceUserHubHeader
        id={selectedServiceUser.id}
        fullName={selectedServiceUser.full_name}
        houseName={selectedServiceUser.house_name}
        dob={null}
        photoUrl={selectedServiceUser.photo_url}
        portal={portal}
        serviceUsers={serviceUsers.map((serviceUser) => ({
          id: serviceUser.id,
          full_name: serviceUser.full_name,
        }))}
        onServiceUserChange={handleServiceUserChange}
      />

      {refreshing && (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
          Refreshing service-user information...
        </div>
      )}
    </div>
  );
}