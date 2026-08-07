"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { MemoryGallery } from "@/components/shared/memories/MemoryGallery";
import { MemoryViewerModal } from "@/components/shared/memories/MemoryViewerModal";
import MemoryEditorModal from "@/components/support/memories/MemoryEditorModal";
import MemoryGovernanceModal from "@/components/manager/memories/MemoryGovernanceModal";

import ServiceUserHubHeader from "@/features/manager/service-users/components/ServiceUserHubHeader";

import { getMemories } from "@/lib/service-user-hub/memories/api";
import { supabase } from "@/lib/supabase";

import type {
  MemoryPortal,
  MemoryWithPhotos,
} from "@/lib/service-user-hub/memories/types";

type ServiceUserRecord = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_path: string | null;
  house_name: string | null;
  organisation_id: string;
};

type LoadedMemoriesPage = {
  selectedServiceUser: ServiceUserRecord;
  serviceUsers: ServiceUserRecord[];
  memories: MemoryWithPhotos[];
};

type MemoriesPageProps = {
  portal: MemoryPortal;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Memories could not be loaded.";
}

export default function MemoriesPage({
  portal,
}: MemoriesPageProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const serviceUserId = params.id;

  const [loadedData, setLoadedData] =
    useState<LoadedMemoriesPage | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [selectedMemory, setSelectedMemory] =
    useState<MemoryWithPhotos | null>(null);

  const [editingMemory, setEditingMemory] =
    useState<MemoryWithPhotos | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);

  const [governanceMemory, setGovernanceMemory] =
    useState<MemoryWithPhotos | null>(null);

  const loadPage = useCallback(async () => {
    if (!serviceUserId) {
      setErrorMessage("No service user was selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const [serviceUsersResult, memories] =
        await Promise.all([
          supabase
            .from("service_users")
            .select(`
              id,
              full_name,
              first_name,
              surname,
              photo_path,
              house_name,
              organisation_id
            `)
            .order("full_name", {
              ascending: true,
            }),

          getMemories(serviceUserId),
        ]);

      if (serviceUsersResult.error) {
        throw new Error(
          serviceUsersResult.error.message,
        );
      }

      const serviceUsers =
        (serviceUsersResult.data ??
          []) as ServiceUserRecord[];

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
        memories,
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

    setSelectedMemory(null);
    setEditingMemory(null);
    setEditorOpen(false);
    setGovernanceMemory(null);

    router.push(
      `/${portal}/service-users/${nextServiceUserId}/memories`,
    );
  }

  function handleCreateMemory() {
    if (portal !== "support") {
      return;
    }

    setEditingMemory(null);
    setEditorOpen(true);
  }

  function handleEditMemory(
    memory: MemoryWithPhotos,
  ) {
    if (portal !== "support") {
      return;
    }

    setSelectedMemory(null);
    setEditingMemory(memory);
    setEditorOpen(true);
  }

  function handleGovernance(
    memory: MemoryWithPhotos,
  ) {
    if (portal !== "manager") {
      return;
    }

    setSelectedMemory(null);
    setGovernanceMemory(memory);
  }

  async function handleChanged() {
    setSelectedMemory(null);
    setEditingMemory(null);
    setEditorOpen(false);
    setGovernanceMemory(null);

    await loadPage();
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 rounded-3xl border border-amber-100/80 bg-gradient-to-br from-amber-50/80 via-white/85 to-cyan-50/60 text-slate-600 shadow-sm backdrop-blur-md">
        <Loader2
          aria-hidden="true"
          className="h-5 w-5 animate-spin text-amber-500"
        />

        <span>Loading memories...</span>
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
          Memories unavailable
        </h1>

        <p className="mt-2 max-w-lg text-sm text-red-800">
          {errorMessage ||
            "Memories could not be opened."}
        </p>

        <button
          type="button"
          onClick={() => void loadPage()}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  const {
    selectedServiceUser,
    serviceUsers,
    memories,
  } = loadedData;

  return (
    <>
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
          onServiceUserChange={
            handleServiceUserChange
          }
        />

        <MemoryGallery
          memories={memories}
          portal={portal}
          onOpenMemory={(memory) =>
            setSelectedMemory(memory)
          }
          onCreateMemory={
            portal === "support"
              ? handleCreateMemory
              : undefined
          }
        />
      </div>

      {selectedMemory ? (
        <MemoryViewerModal
          memory={selectedMemory}
          portal={portal}
          onClose={() =>
            setSelectedMemory(null)
          }
          onEdit={
            portal === "support"
              ? () =>
                  handleEditMemory(
                    selectedMemory,
                  )
              : undefined
          }
          onChangeFamilyAccess={
            portal === "manager"
              ? () =>
                  handleGovernance(
                    selectedMemory,
                  )
              : undefined
          }
          onArchive={
            portal === "manager"
              ? () =>
                  handleGovernance(
                    selectedMemory,
                  )
              : undefined
          }
        />
      ) : null}

      {portal === "support" &&
      editorOpen ? (
        <MemoryEditorModal
          organisationId={
            selectedServiceUser.organisation_id
          }
          serviceUserId={
            selectedServiceUser.id
          }
          memory={editingMemory}
          onClose={() => {
            setEditorOpen(false);
            setEditingMemory(null);
          }}
          onSaved={() =>
            void handleChanged()
          }
        />
      ) : null}

      {portal === "manager" &&
      governanceMemory ? (
        <MemoryGovernanceModal
          memory={governanceMemory}
          onClose={() =>
            setGovernanceMemory(null)
          }
          onChanged={() =>
            void handleChanged()
          }
        />
      ) : null}
    </>
  );
}