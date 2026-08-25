"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { CarePlanReadView } from "@/components/care/shared/care-plans/CarePlanReadView";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";

import { getPublishedCarePlan } from "@/lib/care/service-user-hub/care-plans/api";
import { supabase } from "@/lib/supabase";

import type {
  CarePlanRecord,
  CarePlanSectionRecord,
} from "@/lib/care/service-user-hub/care-plans/types";

type ServiceUserRecord = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_path: string | null;
  house_name: string | null;
};

type LoadedSupportCarePlan = {
  carePlan: CarePlanRecord | null;
  sections: CarePlanSectionRecord[];
  planOwnerName: string | null;
  selectedServiceUser: ServiceUserRecord;
  serviceUsers: ServiceUserRecord[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The care plan could not be loaded.";
}

export default function SupportCarePlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const serviceUserId = params.id;

  const [loadedData, setLoadedData] =
    useState<LoadedSupportCarePlan | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  const loadPage = useCallback(async () => {
    if (!serviceUserId) {
      setErrorMessage("No service user was selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const [serviceUsersResult, carePlan] = await Promise.all([
        supabase
          .from("service_users")
          .select(`
            id,
            full_name,
            first_name,
            surname,
            photo_path,
            house_name
          `)
          .order("full_name", { ascending: true }),

        getPublishedCarePlan(serviceUserId),
      ]);

      if (serviceUsersResult.error) {
        throw new Error(serviceUsersResult.error.message);
      }

      const serviceUsers =
        (serviceUsersResult.data ?? []) as ServiceUserRecord[];

      const selectedServiceUser =
        serviceUsers.find(
          (serviceUser) => serviceUser.id === serviceUserId,
        ) ?? null;

      if (!selectedServiceUser) {
        throw new Error(
          "This service user could not be found or is not available to your account.",
        );
      }

      let planOwnerName: string | null = null;

      if (carePlan?.plan_owner_id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", carePlan.plan_owner_id)
          .maybeSingle();

        if (error) {
          console.warn(
            "Care-plan owner could not be loaded:",
            error.message,
          );
        } else {
          planOwnerName = data?.full_name ?? null;
        }
      }

      setLoadedData({
        carePlan,
        sections: carePlan?.sections ?? [],
        planOwnerName,
        selectedServiceUser,
        serviceUsers,
      });
    } catch (error) {
      setLoadedData(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [serviceUserId]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  function handleServiceUserChange(nextServiceUserId: string) {
    if (
      !nextServiceUserId ||
      nextServiceUserId === serviceUserId
    ) {
      return;
    }

    router.push(
      `/care/support/service-users/${nextServiceUserId}/care-plans`,
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm">
        <Loader2
          className="h-5 w-5 animate-spin"
          aria-hidden="true"
        />

        <span>Loading care plan...</span>
      </div>
    );
  }

  if (errorMessage || !loadedData) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center">
        <AlertTriangle
          className="h-8 w-8 text-red-600"
          aria-hidden="true"
        />

        <h1 className="mt-4 text-lg font-semibold text-red-950">
          Care plan unavailable
        </h1>

        <p className="mt-2 max-w-lg text-sm text-red-800">
          {errorMessage || "The care plan could not be opened."}
        </p>

        <button
          type="button"
          onClick={() => void loadPage()}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  const {
    carePlan,
    sections,
    planOwnerName,
    selectedServiceUser,
    serviceUsers,
  } = loadedData;

  return (
    <div className="space-y-6">
      <ServiceUserHubHeader
        id={selectedServiceUser.id}
        fullName={selectedServiceUser.full_name}
        houseName={selectedServiceUser.house_name}
        dob={null}
        photoPath={selectedServiceUser.photo_path}
        portal="support"
        serviceUsers={serviceUsers.map((serviceUser) => ({
          id: serviceUser.id,
          full_name: serviceUser.full_name,
        }))}
        onServiceUserChange={handleServiceUserChange}
      />

      {carePlan ? (
        <CarePlanReadView
          carePlan={carePlan}
          sections={sections}
          planOwnerName={planOwnerName}
        />
      ) : (
        <section className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/80 to-teal-50/70 px-10 py-12 text-center shadow-sm backdrop-blur-md">
  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
    Care Plans
  </h2>

  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-700">
    A care plan describes{" "}
    <span className="font-semibold text-slate-900">
      how staff should support this person
    </span>{" "}
    safely, consistently and in accordance with their wishes,
    preferences and assessed needs.
  </p>

  <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">
    It provides clear guidance so that everyone supporting the person can
    deliver safe, consistent and person-centred care.
  </p>
</section>
      )}
    </div>
  );
}