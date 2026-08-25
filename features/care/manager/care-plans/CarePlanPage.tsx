"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { CarePlanEditor } from "@/components/care/manager/care-plans/CarePlanEditor";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";

import {
  createCarePlan,
  getCarePlanById,
  getCurrentCarePlan,
  getCurrentCarePlanManager,
} from "@/lib/care/service-user-hub/care-plans/api";
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

type LoadedManagerCarePlan = {
  carePlan: CarePlanRecord;
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

export default function CarePlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const serviceUserId = params.id;

  const [loadedData, setLoadedData] =
    useState<LoadedManagerCarePlan | null>(null);

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
      const manager = await getCurrentCarePlanManager();

      const [serviceUsersResult, existingCarePlan] =
        await Promise.all([
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

          getCurrentCarePlan(serviceUserId),
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

      let carePlan = existingCarePlan;

      if (!carePlan) {
        const carePlanId = await createCarePlan(serviceUserId);
        carePlan = await getCarePlanById(carePlanId);
      }

      let planOwnerName: string | null = manager.full_name ?? null;

      if (
        carePlan.plan_owner_id &&
        carePlan.plan_owner_id !== manager.id
      ) {
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
        sections: carePlan.sections,
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
      `/care/manager/service-users/${nextServiceUserId}/care-plans`,
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
        portal="manager"
        serviceUsers={serviceUsers.map((serviceUser) => ({
          id: serviceUser.id,
          full_name: serviceUser.full_name,
        }))}
        onServiceUserChange={handleServiceUserChange}
      />

      <CarePlanEditor
        carePlan={carePlan}
        storedSections={sections}
        planOwnerName={planOwnerName}
        onSaved={loadPage}
        onPublished={loadPage}
      />
    </div>
  );
}