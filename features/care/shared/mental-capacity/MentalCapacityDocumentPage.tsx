"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { MentalCapacityDocumentView } from "@/components/care/shared/mental-capacity/MentalCapacityDocumentView";
import ServiceUserHubHeader from "@/features/care/manager/service-users/components/ServiceUserHubHeader";
import { getMentalCapacityDocument } from "@/lib/care/mental-capacity/api";
import type { MentalCapacityDocumentRecord } from "@/lib/care/mental-capacity/types";

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
  document: MentalCapacityDocumentRecord;
};

export default function MentalCapacityDocumentPage({ portal }: Props) {
  const params = useParams<{ id: string; documentId: string }>();
  const router = useRouter();
  const serviceUserId = params.id;
  const documentId = params.documentId;
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [serviceUsers, document] = await Promise.all([
        loadMentalCapacityServiceUsers(),
        getMentalCapacityDocument(documentId),
      ]);
      const selectedServiceUser = selectMentalCapacityServiceUser(serviceUsers, serviceUserId);
      if (document.service_user_id !== serviceUserId) {
        throw new Error("This document does not belong to the selected service user.");
      }
      setLoadedData({ selectedServiceUser, serviceUsers, document });
    } catch (error) {
      setLoadedData(null);
      setErrorMessage(error instanceof Error ? error.message : "The MCA document could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [documentId, serviceUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPage(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPage]);

  if (loading) return <MentalCapacityLoading label="Loading MCA document…" />;
  if (errorMessage || !loadedData) {
    return <MentalCapacityError message={errorMessage || "The MCA document could not be opened."} retry={() => void loadPage()} />;
  }

  const { selectedServiceUser, serviceUsers, document } = loadedData;
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
      <MentalCapacityDocumentView document={document} serviceUserId={serviceUserId} portal={portal} />
    </div>
  );
}
