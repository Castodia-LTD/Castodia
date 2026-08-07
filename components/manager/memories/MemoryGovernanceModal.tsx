"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  archiveMemory,
  setMemoryFamilyAccess,
  setMemoryPhotoFamilyAccess,
} from "@/lib/service-user-hub/memories/api";

import type { MemoryWithPhotos } from "@/lib/service-user-hub/memories/types";

type MemoryGovernanceModalProps = {
  memory: MemoryWithPhotos;
  onClose: () => void;
  onChanged: () => void;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The memory settings could not be updated.";
}

export default function MemoryGovernanceModal({
  memory,
  onClose,
  onChanged,
}: MemoryGovernanceModalProps) {
  const [familyVisible, setFamilyVisible] =
    useState(memory.family_visible);

  const [familyNote, setFamilyNote] = useState(
    memory.family_visibility_note ?? "",
  );

  const [photoSettings, setPhotoSettings] = useState(
    memory.photos.map((photo) => ({
      id: photo.id,
      familyVisible: photo.family_visible,
      note: photo.family_visibility_note ?? "",
    })),
  );

  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const hasChanges = useMemo(() => {
    if (familyVisible !== memory.family_visible) {
      return true;
    }

    if (
      familyNote.trim() !==
      (memory.family_visibility_note ?? "").trim()
    ) {
      return true;
    }

    return photoSettings.some((setting) => {
      const original = memory.photos.find(
        (photo) => photo.id === setting.id,
      );

      if (!original) {
        return false;
      }

      return (
        setting.familyVisible !==
          original.family_visible ||
        setting.note.trim() !==
          (
            original.family_visibility_note ?? ""
          ).trim()
      );
    });
  }, [
    familyVisible,
    familyNote,
    photoSettings,
    memory,
  ]);

  function updatePhotoVisibility(
    photoId: string,
    value: boolean,
  ) {
    setPhotoSettings((current) =>
      current.map((setting) =>
        setting.id === photoId
          ? {
              ...setting,
              familyVisible: value,
            }
          : setting,
      ),
    );
  }

  function updatePhotoNote(
    photoId: string,
    value: string,
  ) {
    setPhotoSettings((current) =>
      current.map((setting) =>
        setting.id === photoId
          ? {
              ...setting,
              note: value,
            }
          : setting,
      ),
    );
  }

  async function handleSave() {
    if (!hasChanges || saving) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      if (
        familyVisible !== memory.family_visible ||
        familyNote.trim() !==
          (
            memory.family_visibility_note ?? ""
          ).trim()
      ) {
        await setMemoryFamilyAccess({
          memoryId: memory.id,
          familyVisible,
          note: familyNote,
        });
      }

      for (const setting of photoSettings) {
        const original = memory.photos.find(
          (photo) => photo.id === setting.id,
        );

        if (!original) {
          continue;
        }

        const changed =
          setting.familyVisible !==
            original.family_visible ||
          setting.note.trim() !==
            (
              original.family_visibility_note ??
              ""
            ).trim();

        if (!changed) {
          continue;
        }

        await setMemoryPhotoFamilyAccess({
          photoId: setting.id,
          familyVisible: setting.familyVisible,
          note: setting.note,
        });
      }

      onChanged();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (archiving) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this memory?\n\nThis memory will be removed from staff and family views. The record will be retained securely for audit purposes.",
    );

    if (!confirmed) {
      return;
    }

    setArchiving(true);
    setErrorMessage(null);

    try {
      await archiveMemory(memory.id);

      onChanged();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setArchiving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-50 via-white to-amber-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-cyan-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">
              Manager Controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Family access
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close family access settings"
            disabled={saving || archiving}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <section className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <h3 className="text-base font-bold text-slate-950">
                  Share this memory with family
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Family access controls whether this
                  memory can appear in the Family
                  Portal. Individual photographs can
                  still be restricted below.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFamilyVisible(
                    (current) => !current,
                  )
                }
                className={[
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                  familyVisible
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                {familyVisible ? (
                  <>
                    <Eye
                      aria-hidden="true"
                      className="h-4 w-4"
                    />

                    Family access on
                  </>
                ) : (
                  <>
                    <EyeOff
                      aria-hidden="true"
                      className="h-4 w-4"
                    />

                    Staff only
                  </>
                )}
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="memory-family-note"
                className="block text-sm font-semibold text-slate-800"
              >
                Manager note
              </label>

              <textarea
                id="memory-family-note"
                rows={3}
                value={familyNote}
                onChange={(event) =>
                  setFamilyNote(
                    event.target.value,
                  )
                }
                placeholder="Optional reason for restricting or sharing this memory..."
                className="mt-2 w-full resize-y rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </section>

          {memory.photos.length > 0 ? (
            <section>
              <div>
                <h3 className="text-base font-bold text-slate-950">
                  Photo access
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  A memory can be shared while
                  individual photographs remain
                  staff-only.
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {memory.photos.map(
                  (photo, index) => {
                    const setting =
                      photoSettings.find(
                        (item) =>
                          item.id === photo.id,
                      );

                    if (!setting) {
                      return null;
                    }

                    return (
                      <article
                        key={photo.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                          <div className="aspect-[4/3] bg-slate-100 sm:aspect-auto sm:min-h-[180px]">
                            {photo.signed_url ? (
                              <img
                                src={
                                  photo.signed_url
                                }
                                alt={
                                  photo.caption ||
                                  `Memory photo ${
                                    index + 1
                                  }`
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                Photo unavailable
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  Photo {index + 1}
                                </p>

                                {photo.caption ? (
                                  <p className="mt-1 text-sm text-slate-500">
                                    {photo.caption}
                                  </p>
                                ) : null}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updatePhotoVisibility(
                                    photo.id,
                                    !setting.familyVisible,
                                  )
                                }
                                className={[
                                  "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition",
                                  setting.familyVisible
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-700",
                                ].join(" ")}
                              >
                                {setting.familyVisible ? (
                                  <>
                                    <Eye
                                      aria-hidden="true"
                                      className="h-3.5 w-3.5"
                                    />

                                    Family
                                  </>
                                ) : (
                                  <>
                                    <LockKeyhole
                                      aria-hidden="true"
                                      className="h-3.5 w-3.5"
                                    />

                                    Staff only
                                  </>
                                )}
                              </button>
                            </div>

                            <div>
                              <label
                                htmlFor={`photo-family-note-${photo.id}`}
                                className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                              >
                                Access note
                              </label>

                              <textarea
                                id={`photo-family-note-${photo.id}`}
                                rows={2}
                                value={
                                  setting.note
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updatePhotoNote(
                                    photo.id,
                                    event.target.value,
                                  )
                                }
                                placeholder="e.g. Other service users visible in this photo"
                                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
            <h3 className="text-base font-bold text-red-900">
              Delete Memory
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">
              Deleting removes this memory from
              normal staff and family views. The
              underlying record is retained securely
              for audit purposes.
            </p>

            <button
              type="button"
              onClick={() =>
                void handleArchive()
              }
              disabled={archiving || saving}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {archiving ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />

                  Deleting...
                </>
              ) : (
                <>
                  <Trash2
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  Delete Memory
                </>
              )}
            </button>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-cyan-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || archiving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                void handleSave()
              }
              disabled={
                !hasChanges ||
                saving ||
                archiving
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />

                  Saving...
                </>
              ) : (
                "Save Family Access"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}