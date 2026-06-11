"use client";

import { useParams } from "next/navigation";

import { CastodiaPageShell } from "@/components/castodia";
import TimelineHeader from "@/components/timelines/TimelineHeader";

import TimelineEntryList from "./components/TimelineEntryList";
import TimelineFilters from "./components/TimelineFilters";
import TimelineAddEntryButton from "./components/TimelineAddEntryButton";
import TimelineEntryPanel from "./components/TimelineEntryPanel";

import { useTimelineEntries } from "./hooks/useTimelineEntries";
import { useTimelineForm } from "./hooks/useTimelineForm";
import { useTimelineServiceUser } from "./hooks/useTimelineServiceUser";

export default function TimelineDetailPage() {
  const params = useParams();
  const serviceUserId = params.id as string;

  const serviceUserData = useTimelineServiceUser(serviceUserId);

  const entriesData = useTimelineEntries({
    serviceUserId,
  });

  const form = useTimelineForm();

  if (serviceUserData.loadingServiceUser) {
    return (
      <CastodiaPageShell title="" maxWidth="wide">
        <div className="p-6 text-slate-300">Loading timeline...</div>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell title="" maxWidth="wide">
      <TimelineHeader
        serviceUserName={serviceUserData.serviceUserName}
        selectedDate={entriesData.selectedDate}
        setSelectedDate={(date) => {
          entriesData.setSelectedDate(date);
          form.closeAndReset();
        }}
        onFilterClick={() => entriesData.setFilterOpen(true)}
      />

      {!entriesData.viewingToday && (
        <div className="m-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-slate-300 backdrop-blur">
          Viewing historic records. Entries can only be added to today.
        </div>
      )}

      <TimelineEntryList
        entries={entriesData.filteredEntries}
        serviceUserGender={serviceUserData.serviceUser?.gender}
      />

      <TimelineFilters
        open={entriesData.filterOpen}
        activeFilter={entriesData.activeFilter}
        setActiveFilter={entriesData.setActiveFilter}
        onClose={() => entriesData.setFilterOpen(false)}
      />

      <TimelineAddEntryButton
        show={entriesData.viewingToday && !form.entryPanelOpen}
        onClick={form.openPanel}
      />

      <TimelineEntryPanel
        serviceUserId={serviceUserId}
        organisationId={serviceUserData.serviceUser?.organisation_id ?? ""}
        serviceUserName={serviceUserData.serviceUserName}
        serviceUserGender={serviceUserData.serviceUser?.gender}
        viewingToday={entriesData.viewingToday}
        form={form}
        onSaved={async () => {
          await entriesData.reloadEntries();
        }}
      />
    </CastodiaPageShell>
  );
}