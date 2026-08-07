"use client";

import {
  CalendarDays,
  Image as ImageIcon,
  LockKeyhole,
  Users,
} from "lucide-react";

import type { MemoryWithPhotos } from "@/lib/service-user-hub/memories/types";

type MemoryCardProps = {
  memory: MemoryWithPhotos;
  onOpen: () => void;
};

function formatMemoryDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function MemoryCard({
  memory,
  onOpen,
}: MemoryCardProps) {
  const coverPhoto =
    memory.photos.find((photo) => photo.signed_url) ?? null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group overflow-hidden rounded-3xl border border-amber-100/80",
        "bg-gradient-to-br from-amber-50/70 via-white/90 to-cyan-50/50",
        "text-left shadow-sm backdrop-blur-md",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-amber-300 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-50 to-cyan-50">
        {coverPhoto?.signed_url ? (
          <img
            src={coverPhoto.signed_url}
            alt={
              coverPhoto.caption ||
              `Photo from ${memory.title}`
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 text-amber-500 shadow-sm ring-1 ring-amber-100">
              <ImageIcon
                aria-hidden="true"
                className="h-7 w-7"
              />
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {memory.category ? (
            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
              {memory.category}
            </span>
          ) : null}

          {!memory.family_visible ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
              <LockKeyhole
                aria-hidden="true"
                className="h-3 w-3"
              />

              Staff only
            </span>
          ) : null}
        </div>

        {memory.photos.length > 1 ? (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/70 bg-slate-950/70 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur">
            <ImageIcon
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />

            {memory.photos.length}
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold tracking-tight text-slate-950">
          {memory.title}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {memory.story}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays
              aria-hidden="true"
              className="h-4 w-4 text-amber-500"
            />

            {formatMemoryDate(memory.memory_date)}
          </span>

          {memory.people_involved ? (
            <span className="inline-flex items-center gap-1.5">
              <Users
                aria-hidden="true"
                className="h-4 w-4 text-cyan-600"
              />

              {memory.people_involved}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}