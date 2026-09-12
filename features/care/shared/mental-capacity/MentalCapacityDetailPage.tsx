"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MentalCapacityReadView } from "@/components/care/shared/mental-capacity/MentalCapacityReadView";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";
import { getMentalCapacityAssessment } from "@/lib/care/mental-capacity/api";
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
  assessment: MentalCapacityAssessmentRecord;
};

export default function MentalCapacityDetailPage({ portal }: Props) {
  const params = useParams<{ id: string; assessmentId: string }>();
  const router = useRouter();
  const serviceUserId = params.id;
  const assessmentId = params.assessmentId;
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [serviceUsers, assessment] = await Promise.all([
        loadMentalCapacityServiceUsers(),
        getMentalCapacityAssessment(assessmentId),
      ]);
      const selectedServiceUser = selectMentalCapacityServiceUser(
        serviceUsers,
        serviceUserId,
      );

      if (assessment.service_user_id !== serviceUserId) {
        throw new Error("This assessment does not belong to the selected service user.");
      }

      setLoadedData({ selectedServiceUser, serviceUsers, assessment });
    } catch (error) {
      setLoadedData(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The mental capacity assessment could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentId, serviceUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPage(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPage]);

  if (loading) return <MentalCapacityLoading label="Loading capacity assessment…" />;
  if (errorMessage || !loadedData) {
    return (
      <MentalCapacityError
        message={errorMessage || "The mental capacity assessment could not be opened."}
        retry={() => void loadPage()}
      />
    );
  }

  const { selectedServiceUser, serviceUsers, assessment } = loadedData;

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
      <MentalCapacityReadView
        assessment={assessment}
        serviceUserId={serviceUserId}
        portal={portal}
      />
    </div>
  );
}
