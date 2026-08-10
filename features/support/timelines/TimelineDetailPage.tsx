"use client";

import { useParams } from "next/navigation";
import { CalendarClock } from "lucide-react";

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

  const serviceUserData =
    useTimelineServiceUser(serviceUserId);

  const entriesData = useTimelineEntries({
    serviceUserId,
  });

  const form = useTimelineForm();

  const latestEntryTime =
    entriesData.filteredEntries.length > 0
      ? new Date(
          entriesData.filteredEntries[0].event_time,
        ).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  if (serviceUserData.loadingServiceUser) {
    return (
      <CastodiaPageShell title="Timeline">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-px bg-slate-200" />

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="ml-24 h-24 rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell title="Timeline">
      <main className="mx-auto max-w-6xl pb-24">
        <TimelineHeader
          serviceUserName={
            serviceUserData.serviceUserName
          }
          serviceUserPhotoUrl={
            serviceUserData.serviceUserPhotoUrl
          }
          selectedDate={
            entriesData.selectedDate
          }
          setSelectedDate={(date) => {
            entriesData.setSelectedDate(date);
            form.closeAndReset();
          }}
          onFilterClick={() =>
            entriesData.setFilterOpen(true)
          }
          entryCount={
            entriesData.filteredEntries.length
          }
          latestEntryTime={latestEntryTime}
        />

        {!entriesData.viewingToday && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <CalendarClock
              size={18}
              className="shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <p className="text-sm text-amber-900">
              <span className="font-semibold">
                Historic record.
              </span>{" "}
              Entries can only be added to today&apos;s timeline.
            </p>
          </div>
        )}

        <section className="mt-6">
          {entriesData.loadingEntries ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="ml-0 h-24 animate-pulse rounded-2xl bg-slate-100 sm:ml-[108px]"
                />
              ))}
            </div>
          ) : (
            <TimelineEntryList
              entries={
                entriesData.filteredEntries
              }
              serviceUserGender={
                serviceUserData.serviceUser
                  ?.gender
              }
            />
          )}
        </section>

        <TimelineFilters
          open={entriesData.filterOpen}
          activeFilter={
            entriesData.activeFilter
          }
          setActiveFilter={
            entriesData.setActiveFilter
          }
          onClose={() =>
            entriesData.setFilterOpen(false)
          }
        />

        <TimelineAddEntryButton
          show={
            entriesData.viewingToday &&
            !form.entryPanelOpen
          }
          onClick={form.openPanel}
        />

        <TimelineEntryPanel
          serviceUserId={serviceUserId}
          organisationId={
            serviceUserData.serviceUser
              ?.organisation_id ?? ""
          }
          serviceUserName={
            serviceUserData.serviceUserName
          }
          serviceUserGender={
            serviceUserData.serviceUser
              ?.gender
          }
          viewingToday={
            entriesData.viewingToday
          }
          form={form}
          onSaved={async () => {
            await entriesData.reloadEntries();
          }}
        />
      </main>
    </CastodiaPageShell>
  );
}