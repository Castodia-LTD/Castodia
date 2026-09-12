"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MentalCapacityForm } from "@/components/care/manager/mental-capacity/MentalCapacityForm";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";
import {
  loadMentalCapacityServiceUsers,
  selectMentalCapacityServiceUser,
} from "@/features/care/shared/mental-capacity/load-service-users";
import {
  MentalCapacityError,
  MentalCapacityLoading,
} from "@/features/care/shared/mental-capacity/page-state";
import type { MentalCapacityServiceUser } from "@/features/care/shared/mental-capacity/types";

type LoadedData = {
  selectedServiceUser: MentalCapacityServiceUser;
  serviceUsers: MentalCapacityServiceUser[];
};

export default function NewMentalCapacityAssessmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceUserId = params.id;
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const serviceUsers = await loadMentalCapacityServiceUsers();
      const selectedServiceUser = selectMentalCapacityServiceUser(
        serviceUsers,
        serviceUserId,
      );
      setLoadedData({ selectedServiceUser, serviceUsers });
    } catch (error) {
      setLoadedData(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The assessment form could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [serviceUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPage(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPage]);

  if (loading) return <MentalCapacityLoading label="Loading assessment form…" />;
  if (errorMessage || !loadedData) {
    return (
      <MentalCapacityError
        message={errorMessage || "The assessment form could not be opened."}
        retry={() => void loadPage()}
      />
    );
  }

  const { selectedServiceUser, serviceUsers } = loadedData;

  return (
    <div className="space-y-6">
      <ServiceUserHubHeader
        id={selectedServiceUser.id}
        fullName={selectedServiceUser.full_name}
        houseName={selectedServiceUser.house_name}
        dob={null}
        photoPath={selectedServiceUser.photo_path}
        portal="manager"
        serviceUsers={serviceUsers.map(({ id, full_name }) => ({ id, full_name }))}
        onServiceUserChange={(nextId) => {
          if (nextId && nextId !== serviceUserId) {
            router.push(`/care/manager/service-users/${nextId}/mental-capacity/new`);
          }
        }}
      />
      <MentalCapacityForm serviceUserId={serviceUserId} />
    </div>
  );
}
