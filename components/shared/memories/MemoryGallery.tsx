"use client";

import {
  ImagePlus,
  Sparkles,
} from "lucide-react";

import { MemoryCard } from "@/components/shared/memories/MemoryCard";

import type {
  MemoryPortal,
  MemoryWithPhotos,
} from "@/lib/service-user-hub/memories/types";

type MemoryGalleryProps = {
  memories: MemoryWithPhotos[];
  portal: MemoryPortal;

  onOpenMemory: (
    memory: MemoryWithPhotos,
  ) => void;

  onCreateMemory?: () => void;
};

export function MemoryGallery({
  memories,
  portal,
  onOpenMemory,
  onCreateMemory,
}: MemoryGalleryProps) {
  const canCreate = portal === "support";

  if (memories.length === 0) {
    return (
      <MemoryEmptyState
        canCreate={canCreate}
        onCreateMemory={onCreateMemory}
      />
    );
  }

  return (
    <section
      aria-labelledby="memory-gallery-heading"
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="memory-gallery-heading"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Memories
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Meaningful moments, experiences and
            achievements from this person&apos;s life.
          </p>
        </div>

        {canCreate && onCreateMemory ? (
          <button
            type="button"
            onClick={onCreateMemory}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
          >
            <ImagePlus
              aria-hidden="true"
              className="h-4 w-4"
            />

            New Memory
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onOpen={() =>
              onOpenMemory(memory)
            }
          />
        ))}
      </div>
    </section>
  );
}

type MemoryEmptyStateProps = {
  canCreate: boolean;
  onCreateMemory?: () => void;
};

function MemoryEmptyState({
  canCreate,
  onCreateMemory,
}: MemoryEmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-amber-100/80 bg-gradient-to-br from-amber-50/80 via-white/90 to-cyan-50/60 px-8 py-12 text-center shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-amber-500 shadow-sm ring-1 ring-amber-100">
        <Sparkles
          aria-hidden="true"
          className="h-6 w-6"
        />
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        Memories
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
        Memories preserve meaningful moments,
        achievements and experiences from this
        person&apos;s life.
      </p>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        They create a positive record of the things
        that matter, the people involved and the
        moments worth remembering.
      </p>

      <p className="mx-auto mt-5 max-w-xl text-sm font-semibold text-slate-700">
        No memories have been added yet.
      </p>

      {canCreate && onCreateMemory ? (
        <button
          type="button"
          onClick={onCreateMemory}
          className="mt-7 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
        >
          <ImagePlus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Add the first memory
        </button>
      ) : null}
    </section>
  );
}