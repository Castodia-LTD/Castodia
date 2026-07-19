"use client";

import { useState } from "react";

import ServiceUserHero from "@/components/service-user-hub/ServiceUserHero";

import AboutMeCard from "./AboutMeCard";
import AboutMeForm from "./AboutMeForm";
import DetailRow from "./DetailRow";

import type { ServiceUserAboutMe } from "@/lib/service-user-hub/about-me/types";

type AboutMeViewProps = {
  serviceUserId: string;

  serviceUser: {
    fullName: string;
    photoUrl?: string | null;
    houseName?: string | null;
    dateOfBirth?: string | null;
  };

  initialData: ServiceUserAboutMe | null;
};

function formatUpdatedAt(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ListItems({
  items,
  emptyText,
  bulletClassName = "bg-cyan-600",
}: {
  items?: string[] | null;
  emptyText: string;
  bulletClassName?: string;
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ul className="min-w-0 space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex min-w-0 gap-3 text-sm text-slate-800"
        >
          <span
            aria-hidden="true"
            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClassName}`}
          />

          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutMeView({
  serviceUserId,
  serviceUser,
  initialData,
}: AboutMeViewProps) {
  const [record, setRecord] =
    useState<ServiceUserAboutMe | null>(initialData);

  const [isEditing, setIsEditing] = useState(false);

  function handleSaved(savedRecord: ServiceUserAboutMe) {
    setRecord(savedRecord);
    setIsEditing(false);
  }

  const lastUpdated = formatUpdatedAt(record?.updated_at);

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <ServiceUserHero
        fullName={serviceUser.fullName}
        preferredName={record?.preferred_name}
        photoUrl={serviceUser.photoUrl}
        houseName={serviceUser.houseName}
        dateOfBirth={serviceUser.dateOfBirth}
      />

      {isEditing ? (
        <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <AboutMeForm
            serviceUserId={serviceUserId}
            initialData={record}
            onCancel={() => setIsEditing(false)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="hidden sm:block" />

            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                About Me
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Person-centred information about this service user.
              </p>
            </div>

            <div className="justify-self-center sm:justify-self-end">
              <div className="flex flex-col items-center gap-2 sm:items-end">
                {lastUpdated && (
                  <p className="text-xs text-slate-500">
                    Last updated {lastUpdated}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  {record ? "Edit About Me" : "Create About Me"}
                </button>
              </div>
            </div>
          </div>

          {!record ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                No About Me information has been added
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Add person-centred details including preferences,
                communication needs and important information.
              </p>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Add About Me information
              </button>
            </div>
          ) : (
            <>
              <AboutMeCard
                title={`About ${record.preferred_name || "Me"}`}
                icon="person"
                accent="cyan"
              >
                {record.about_me ? (
                  <p className="min-w-0 whitespace-pre-wrap break-words leading-7 text-slate-700">
                    {record.about_me}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No personal biography has been added.
                  </p>
                )}
              </AboutMeCard>

              <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <AboutMeCard
                  title="Quick Facts"
                  icon="clipboard"
                  accent="cyan"
                >
                  <div>
                    <DetailRow
                      label="Preferred name"
                      value={record.preferred_name}
                    />

                    <DetailRow
                      label="Gender identity"
                      value={record.gender_identity}
                    />

                    <DetailRow
                      label="NHS number"
                      value={record.nhs_number}
                    />

                    <DetailRow
                      label="Religion"
                      value={record.religion}
                    />

                    <DetailRow
                      label="Nationality"
                      value={record.nationality}
                    />

                    <DetailRow
                      label="Languages"
                      value={
                        record.languages?.length
                          ? record.languages.join(", ")
                          : null
                      }
                    />

                    <DetailRow
                      label="Key worker"
                      value={record.key_worker_name}
                    />

                    <DetailRow
                      label="GP"
                      value={record.gp_name}
                    />

                    <DetailRow
                      label="Emergency contact"
                      value={record.emergency_contact_name}
                    />

                    <DetailRow
                      label="Relationship"
                      value={record.emergency_contact_relationship}
                    />

                    <DetailRow
                      label="Contact number"
                      value={record.emergency_contact_phone}
                    />
                  </div>
                </AboutMeCard>

                <div className="min-w-0 space-y-5">
                  <AboutMeCard
                    title="Likes"
                    icon="heart"
                    accent="pink"
                  >
                    <ListItems
                      items={record.likes}
                      emptyText="No likes have been recorded."
                      bulletClassName="bg-pink-500"
                    />
                  </AboutMeCard>

                  <AboutMeCard
                    title="Dislikes / Triggers"
                    icon="warning"
                    accent="amber"
                  >
                    <ListItems
                      items={record.dislikes_triggers}
                      emptyText="No dislikes or triggers have been recorded."
                      bulletClassName="bg-amber-500"
                    />
                  </AboutMeCard>
                </div>
              </div>

              <AboutMeCard
                title="Communication"
                icon="message"
                accent="blue"
              >
                <div>
                  <DetailRow
                    label="Preferred communication"
                    value={record.preferred_communication}
                  />

                  <DetailRow
                    label="Hearing"
                    value={record.hearing_notes}
                  />

                  <DetailRow
                    label="Vision"
                    value={record.vision_notes}
                  />

                  <DetailRow
                    label="Important notes"
                    value={record.communication_notes}
                  />
                </div>
              </AboutMeCard>

              <AboutMeCard
                title="Important Information"
                icon="info"
                accent="violet"
              >
                <ListItems
                  items={record.important_information}
                  emptyText="No important information has been recorded."
                  bulletClassName="bg-violet-500"
                />
              </AboutMeCard>
            </>
          )}
        </>
      )}
    </div>
  );
}