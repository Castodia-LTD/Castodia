"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

import { useTimelineServiceUser } from "../hooks/useTimelineServiceUser";
import { useTimelineEntries } from "../hooks/useTimelineEntries";

import TimelineFilters from "../components/TimelineFilters";
import TimelineEntryList from "../components/TimelineEntryList";
import TimelineEntryPanel from "../components/TimelineEntryPanel";

export default function TimelinePage() {
  const params = useParams();
  const serviceUserId = params.id as string;

  const [selectedType, setSelectedType] = useState("All");

  const {
    serviceUser,
    loadingServiceUser,
  } = useTimelineServiceUser(serviceUserId);

  const {
    entries,
    loadingEntries,
    reloadEntries,
  } = useTimelineEntries(serviceUserId);

  const loading = loadingServiceUser || loadingEntries;

  const filteredEntries =
    selectedType === "All"
      ? entries
      : entries.filter(
          (entry) => entry.entry_type === selectedType
        );

  return (
    <CastodiaPageShell
      title={serviceUser?.full_name || "Timeline"}
      description={
        serviceUser?.house_name
          ? `${serviceUser.house_name} timeline records`
          : "Daily timeline records"
      }
      maxWidth="wide"
    >
      {loading ? (
        <CastodiaCard>
          <p className="text-sm text-slate-500">
            Loading timeline...
          </p>
        </CastodiaCard>
      ) : (
        <>
          <TimelineFilters
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onClear={() => setSelectedType("All")}
          />

          <TimelineEntryList entries={filteredEntries} />

          <TimelineEntryPanel
            serviceUserId={serviceUserId}
            onSaved={reloadEntries}
          />
        </>
      )}
    </CastodiaPageShell>
  );
}