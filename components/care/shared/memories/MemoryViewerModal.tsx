"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import type {
  MemoryPortal,
  MemoryWithPhotos,
} from "@/lib/care/service-user-hub/memories/types";

type MemoryViewerModalProps = {
  memory: MemoryWithPhotos;
  portal: MemoryPortal;

  onClose: () => void;

  onEdit?: () => void;

  onChangeFamilyAccess?: () => void;

  onArchive?: () => void;
};

function formatDate(value: string) {
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

export function MemoryViewerModal({
  memory,
  portal,
  onClose,
  onEdit,
  onChangeFamilyAccess,
  onArchive,
}: MemoryViewerModalProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = memory.photos;
  const selectedPhoto = photos[photoIndex] ?? null;

  const isSupport = portal === "support";
  const isManager = portal === "manager";

  function previousPhoto() {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((current) =>
      current === 0
        ? photos.length - 1
        : current - 1,
    );
  }

  function nextPhoto() {
    if (photos.length <= 1) {
      return;
    }

    setPhotoIndex((current) =>
      current === photos.length - 1
        ? 0
        : current + 1,
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/70 bg-gradient-to-br from-amber-50 via-white to-cyan-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-amber-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
              Memory
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-slate-950 sm:text-2xl">
              {memory.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close memory"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {selectedPhoto?.signed_url ? (
            <section>
              <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-slate-100">
                <img
                  src={selectedPhoto.signed_url}
                  alt={
                    selectedPhoto.caption ||
                    `Photo from ${memory.title}`
                  }
                  className="max-h-[520px] w-full object-contain"
                />

                {photos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={previousPhoto}
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/65 text-white shadow-lg backdrop-blur transition hover:bg-slate-950/80"
                    >
                      <ChevronLeft
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={nextPhoto}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/65 text-white shadow-lg backdrop-blur transition hover:bg-slate-950/80"
                    >
                      <ChevronRight
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </button>

                    <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      {photoIndex + 1} / {photos.length}
                    </div>
                  </>
                ) : null}

                {!selectedPhoto.family_visible ? (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                    <LockKeyhole
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />

                    Staff only photo
                  </div>
                ) : null}
              </div>

              {selectedPhoto.caption ? (
                <p className="mt-2 text-center text-sm text-slate-500">
                  {selectedPhoto.caption}
                </p>
              ) : null}

              {photos.length > 1 ? (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setPhotoIndex(index)}
                      aria-label={`View photo ${index + 1}`}
                      className={[
                        "h-14 w-14 overflow-hidden rounded-xl border bg-slate-100 transition",
                        index === photoIndex
                          ? "border-amber-400 ring-2 ring-amber-100"
                          : "border-slate-200 hover:border-amber-200",
                      ].join(" ")}
                    >
                      {photo.signed_url ? (
                        <img
                          src={photo.signed_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-2xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  aria-hidden="true"
                  className="h-4 w-4 text-amber-500"
                />

                {formatDate(memory.memory_date)}
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

              {memory.category ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  {memory.category}
                </span>
              ) : null}
            </div>

            <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">
              {memory.story}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Family access
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {memory.family_visible
                    ? "This memory is available to family."
                    : "This memory is currently staff only."}
                </p>

                {memory.family_visibility_note ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {memory.family_visibility_note}
                  </p>
                ) : null}
              </div>

              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold",
                  memory.family_visible
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {memory.family_visible
                  ? "Shared with family"
                  : "Staff only"}
              </span>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-amber-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-slate-400">
              {memory.creator_name ? (
                <p>
                  Added by {memory.creator_name}
                </p>
              ) : null}

              <p>
                Recorded{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(
                  new Date(memory.created_at),
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isSupport && onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 shadow-sm transition hover:bg-amber-50"
                >
                  Edit Memory
                </button>
              ) : null}

              {isManager &&
              onChangeFamilyAccess ? (
                <button
                  type="button"
                  onClick={onChangeFamilyAccess}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm transition hover:bg-cyan-50"
                >
                  Family access
                </button>
              ) : null}

              {isManager && onArchive ? (
                <button
                  type="button"
                  onClick={onArchive}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <Trash2
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  Delete Memory
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}