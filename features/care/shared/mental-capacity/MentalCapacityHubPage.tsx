"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MentalCapacityList } from "@/components/care/shared/mental-capacity/MentalCapacityList";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";
import { getMentalCapacityAssessments } from "@/lib/care/mental-capacity/api";
import type { MentalCapacityAssessmentRecord } from "@/lib/care/mental-capacity/types";

import {
  loadMentalCapacityServiceUsers,
  selectMentalCapacityServiceUser,
} from "./load-service-users";
import { MentalCapacityError, MentalCapacityLoading } from "./page-state";
import type { MentalCapacityPortal, MentalCapacityServiceUser } from "./types";

type Props = { portal: MentalCapacityPortal };

type LoadedData = {
  selectedServiceUser: MentalCapacityServiceUser;
  serviceUsers: MentalCapacityServiceUser[];
  assessments: MentalCapacityAssessmentRecord[];
};

export default function MentalCapacityHubPage({ portal }: Props) {
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
      const [serviceUsers, assessments] = await Promise.all([
        loadMentalCapacityServiceUsers(),
        getMentalCapacityAssessments(serviceUserId),
      ]);
      const selectedServiceUser = selectMentalCapacityServiceUser(
        serviceUsers,
        serviceUserId,
      );

      setLoadedData({ selectedServiceUser, serviceUsers, assessments });
    } catch (error) {
      setLoadedData(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The mental capacity assessments could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [serviceUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPage(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPage]);

  if (loading) return <MentalCapacityLoading label="Loading capacity assessments…" />;
  if (errorMessage || !loadedData) {
    return (
      <MentalCapacityError
        message={errorMessage || "The mental capacity assessments could not be opened."}
        retry={() => void loadPage()}
      />
    );
  }

  const { selectedServiceUser, serviceUsers, assessments } = loadedData;

  return (
    <div className="space-y-6">
      <ServiceUserHubHeader
        id={selectedServiceUser.id}
        fullName={selectedServiceUser.full_name}
        houseName={selectedServiceUser.house_name}
        dob={null}
        photoPath={selectedServiceUser.photo_path}
        portal={portal}
        serviceUsers={serviceUsers.map(({ id, full_name }) => ({ id, full_name }))}
        onServiceUserChange={(nextId) => {
          if (nextId && nextId !== serviceUserId) {
            router.push(`/care/${portal}/service-users/${nextId}/mental-capacity`);
          }
        }}
      />
      <MentalCapacityList
        assessments={assessments}
        serviceUserId={serviceUserId}
        portal={portal}
      />
    </div>
  );
}
