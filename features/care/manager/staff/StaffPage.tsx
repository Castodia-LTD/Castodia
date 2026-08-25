"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CastodiaCard } from "@/components/castodia";
import StaffHubPage from "@/features/care/manager/admin/staff/StaffHubPage";
import { supabase } from "@/lib/supabase";

type Portal = "manager" | "support";

type Props = {
  portal: Portal;
};

export type StaffMember = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
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

  return "An unexpected error occurred while loading staff.";
}

export default function StaffPage({ portal }: Props) {
  const router = useRouter();

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  const loadStaff = useCallback(async (showFullLoader = true) => {
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

      const { data: currentProfile, error: profileError } =
        await supabase
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

      let loadedStaff: StaffMember[] | null = null;
      let finalErrorMessage =
        "The staff query could not be completed.";

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              id,
              full_name,
              role,
              photo_url
            `
          )
          .eq(
            "organisation_id",
            currentProfile.organisation_id
          )
          .order("full_name", { ascending: true });
          console.log("Loaded staff:", data);

        if (!error) {
          loadedStaff = (data ?? []) as StaffMember[];
          break;
        }

        finalErrorMessage =
          error.message || "The staff query failed.";

        console.error(
          `Staff query attempt ${attempt + 1} failed:`,
          {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        );

        if (attempt < MAX_RETRIES) {
          await wait(RETRY_DELAY_MS * (attempt + 1));
        }
      }

      if (loadedStaff === null) {
        throw new Error(finalErrorMessage);
      }

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setStaffMembers(loadedStaff);

      setSelectedStaffId((currentId) => {
        const currentSelectionStillExists =
          loadedStaff.some(
            (staffMember) => staffMember.id === currentId
          );

        if (currentSelectionStillExists) {
          return currentId;
        }

        return loadedStaff[0]?.id ?? "";
      });
    } catch (error) {
      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      const message = getErrorMessage(error);

      console.error("Unable to load staff:", message);

      setErrorMessage(message);
      setStaffMembers([]);
      setSelectedStaffId("");
    } finally {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void loadStaff();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadStaff]);

  function handleStaffChange(staffId: string) {
    if (!staffId) {
      return;
    }

    setSelectedStaffId(staffId);

    router.push(`/${portal}/staff/${staffId}`);
  }

  const selectedStaff =
    staffMembers.find(
      (staffMember) => staffMember.id === selectedStaffId
    ) ?? staffMembers[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <CastodiaCard>
          <div className="space-y-5 p-2">
            <div className="h-12 max-w-sm animate-pulse rounded-xl bg-slate-100" />

            <div className="rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-8 py-10">
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 animate-pulse rounded-full bg-slate-200" />

                <div className="mt-6 h-10 w-64 max-w-full animate-pulse rounded-xl bg-slate-200" />

                <div className="mt-5 flex gap-3">
                  <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-11 w-32 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </CastodiaCard>

        <p className="text-center text-sm font-medium text-slate-500">
          Loading staff...
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
            Staff could not be loaded
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Castodia could not retrieve the staff records.
            This may be caused by a temporary connection,
            session or permissions issue.
          </p>

          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() => void loadStaff(true)}
            className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
          >
            Try again
          </button>
        </div>
      </CastodiaCard>
    );
  }

  if (!selectedStaff) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-2xl font-bold text-cyan-800">
            0
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            No staff members available
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            No staff profiles are currently available for
            this organisation.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadStaff(false)}
              disabled={refreshing}
              className="rounded-xl border border-cyan-200 bg-white px-6 py-3 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Checking..." : "Check again"}
            </button>

            {portal === "manager" && (
              <button
                type="button"
                onClick={() =>
                  router.push("/care/manager/admin/staff")
                }
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
              >
                Add Staff Member
              </button>
            )}
          </div>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <div className="space-y-6">
      <StaffHubPage
        staffId={selectedStaff.id}
        staffMembers={staffMembers}
        onStaffChange={handleStaffChange}
      />

      {refreshing && (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
          Refreshing staff information...
        </div>
      )}
    </div>
  );
}