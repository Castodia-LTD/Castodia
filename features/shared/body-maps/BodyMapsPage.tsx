"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { BodyMapHistory } from "@/components/shared/body-maps/BodyMapHistory";
import ServiceUserHubHeader from "@/features/manager/service-users/components/ServiceUserHubHeader";

import { supabase } from "@/lib/supabase";

type Portal = "manager" | "support";

type ServiceUserRecord = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_path: string | null;
  house_name: string | null;
  gender: string | null;
};

type LoadedBodyMapsPage = {
  selectedServiceUser: ServiceUserRecord;
  serviceUsers: ServiceUserRecord[];
};

type BodyMapsPageProps = {
  portal: Portal;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The body-map history could not be loaded.";
}

export default function BodyMapsPage({
  portal,
}: BodyMapsPageProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const serviceUserId = params.id;

  const [loadedData, setLoadedData] =
    useState<LoadedBodyMapsPage | null>(null);

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
      const { data, error } = await supabase
        .from("service_users")
        .select(`
          id,
          full_name,
          first_name,
          surname,
          photo_path,
          house_name,
          gender
        `)
        .order("full_name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const serviceUsers =
        (data ?? []) as ServiceUserRecord[];

      const selectedServiceUser =
        serviceUsers.find(
          (serviceUser) =>
            serviceUser.id === serviceUserId,
        ) ?? null;

      if (!selectedServiceUser) {
        throw new Error(
          "This service user could not be found or is not available to your account.",
        );
      }

      setLoadedData({
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

  function handleServiceUserChange(
    nextServiceUserId: string,
  ) {
    if (
      !nextServiceUserId ||
      nextServiceUserId === serviceUserId
    ) {
      return;
    }

    router.push(
      `/${portal}/service-users/${nextServiceUserId}/body-maps`,
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/75 to-teal-50/75 text-slate-600 shadow-sm backdrop-blur-md">
        <Loader2
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-teal-700"
        />

        <span>Loading body maps...</span>
      </div>
    );
  }

  if (errorMessage || !loadedData) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center">
        <AlertTriangle
          aria-hidden="true"
          className="h-8 w-8 text-red-600"
        />

        <h1 className="mt-4 text-lg font-semibold text-red-950">
          Body maps unavailable
        </h1>

        <p className="mt-2 max-w-lg text-sm text-red-800">
          {errorMessage ||
            "The body-map history could not be opened."}
        </p>

        <button
          type="button"
          onClick={() => void loadPage()}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  const {
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
        portal={portal}
        serviceUsers={serviceUsers.map(
          (serviceUser) => ({
            id: serviceUser.id,
            full_name: serviceUser.full_name,
          }),
        )}
        onServiceUserChange={handleServiceUserChange}
      />

      <BodyMapHistory
        serviceUserId={selectedServiceUser.id}
        serviceUserGender={selectedServiceUser.gender}
      />
    </div>
  );
}