"use client";

import {
  ImagePlus,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  createMemory,
  removeMemoryPhoto,
  updateMemory,
  uploadMemoryPhoto,
} from "@/lib/service-user-hub/memories/api";

import type {
  MemoryPhotoRecord,
  MemoryWithPhotos,
} from "@/lib/service-user-hub/memories/types";

type MemoryEditorModalProps = {
  organisationId: string;
  serviceUserId: string;

  memory?: MemoryWithPhotos | null;

  onClose: () => void;
  onSaved: () => void;
};

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
};

function todayInputValue() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The memory could not be saved.";
}

export default function MemoryEditorModal({
  organisationId,
  serviceUserId,
  memory = null,
  onClose,
  onSaved,
}: MemoryEditorModalProps) {
  const editing = Boolean(memory);

  const [title, setTitle] = useState(
    memory?.title ?? "",
  );

  const [story, setStory] = useState(
    memory?.story ?? "",
  );

  const [memoryDate, setMemoryDate] = useState(
    memory?.memory_date ?? todayInputValue(),
  );

  const [peopleInvolved, setPeopleInvolved] =
    useState(memory?.people_involved ?? "");

  const [category, setCategory] = useState(
    memory?.category ?? "",
  );

  const [pendingPhotos, setPendingPhotos] =
    useState<PendingPhoto[]>([]);

  const [existingPhotos, setExistingPhotos] =
    useState<MemoryPhotoRecord[]>(
      memory?.photos ?? [],
    );

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const canSave = useMemo(() => {
    return (
      title.trim().length > 0 &&
      story.trim().length > 0 &&
      memoryDate.trim().length > 0 &&
      !saving
    );
  }, [title, story, memoryDate, saving]);

  useEffect(() => {
    return () => {
      pendingPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, [pendingPhotos]);

  function handleFilesSelected(
    files: FileList | null,
  ) {
    if (!files || files.length === 0) {
      return;
    }

    const nextPhotos = Array.from(files)
      .filter((file) =>
        file.type.startsWith("image/"),
      )
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      }));

    setPendingPhotos((current) => [
      ...current,
      ...nextPhotos,
    ]);
  }

  function updatePendingCaption(
    photoId: string,
    caption: string,
  ) {
    setPendingPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              caption,
            }
          : photo,
      ),
    );
  }

  function removePendingPhoto(photoId: string) {
    setPendingPhotos((current) => {
      const photo = current.find(
        (item) => item.id === photoId,
      );

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      return current.filter(
        (item) => item.id !== photoId,
      );
    });
  }

  async function handleRemoveExistingPhoto(
    photo: MemoryPhotoRecord,
  ) {
    const confirmed = window.confirm(
      "Remove this photo from the memory?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeMemoryPhoto(photo);

      setExistingPhotos((current) =>
        current.filter(
          (item) => item.id !== photo.id,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleSave() {
    if (!canSave) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      let memoryId = memory?.id ?? null;

      if (memoryId) {
        await updateMemory({
          memoryId,

          title,
          story,
          memoryDate,

          peopleInvolved,
          category,
        });
      } else {
        const createdMemory =
          await createMemory({
            organisationId,
            serviceUserId,

            title,
            story,
            memoryDate,

            peopleInvolved,
            category,
          });

        memoryId = createdMemory.id;
      }

      for (
        let index = 0;
        index < pendingPhotos.length;
        index += 1
      ) {
        const photo = pendingPhotos[index];

        await uploadMemoryPhoto({
          organisationId,
          serviceUserId,
          memoryId,

          file: photo.file,
          caption: photo.caption,

          displayOrder:
            existingPhotos.length + index,
        });
      }

      onSaved();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/70 bg-gradient-to-br from-amber-50 via-white to-cyan-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-amber-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
              {editing
                ? "Edit Memory"
                : "New Memory"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              {editing
                ? "Update this memory"
                : "Capture a meaningful moment"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close memory editor"
            disabled={saving}
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

          <div>
            <label
              htmlFor="memory-title"
              className="block text-sm font-semibold text-slate-800"
            >
              Title
            </label>

            <input
              id="memory-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Christmas Party 2026"
              className="mt-2 w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label
              htmlFor="memory-story"
              className="block text-sm font-semibold text-slate-800"
            >
              Story
            </label>

            <textarea
              id="memory-story"
              rows={7}
              value={story}
              onChange={(event) =>
                setStory(event.target.value)
              }
              placeholder="Tell the story of what made this moment meaningful..."
              className="mt-2 w-full resize-y rounded-xl border border-amber-100 bg-white px-4 py-3 text-base leading-7 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep this warm and person-centred. This is
              a memory, not a clinical note.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="memory-date"
                className="block text-sm font-semibold text-slate-800"
              >
                Memory date
              </label>

              <div className="mt-2 flex w-full min-w-0 rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-100">
                <input
                  id="memory-date"
                  type="date"
                  value={memoryDate}
                  onChange={(event) =>
                    setMemoryDate(event.target.value)
                  }
                  className="block w-full min-w-0 border-0 bg-transparent p-0 text-base text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="memory-category"
                className="block text-sm font-semibold text-slate-800"
              >
                Category
              </label>

              <select
                id="memory-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">
                  No category
                </option>

                <option value="Activity">
                  Activity
                </option>

                <option value="Achievement">
                  Achievement
                </option>

                <option value="Birthday">
                  Birthday
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Holiday">
                  Holiday
                </option>

                <option value="Milestone">
                  Milestone
                </option>

                <option value="Outing">
                  Outing
                </option>

                <option value="Celebration">
                  Celebration
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="memory-people"
              className="block text-sm font-semibold text-slate-800"
            >
              People involved
            </label>

            <input
              id="memory-people"
              type="text"
              value={peopleInvolved}
              onChange={(event) =>
                setPeopleInvolved(event.target.value)
              }
              placeholder="e.g. Mum, Dad, Sarah and support staff"
              className="mt-2 w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Photos
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add photographs that help preserve
                  the moment.
                </p>
              </div>

              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 shadow-sm transition hover:bg-amber-50">
                <ImagePlus
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Add photos

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    handleFilesSelected(
                      event.target.files,
                    );

                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {existingPhotos.length > 0 ||
            pendingPhotos.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {existingPhotos.map((photo) => {
                  const signedUrl =
                    memory?.photos.find(
                      (item) =>
                        item.id === photo.id,
                    )?.signed_url ?? null;

                  return (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"
                    >
                      <div className="aspect-[4/3] bg-slate-100">
                        {signedUrl ? (
                          <img
                            src={signedUrl}
                            alt={
                              photo.caption ||
                              "Memory photo"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex items-start justify-between gap-3 p-3">
                        <p className="min-w-0 flex-1 text-sm text-slate-600">
                          {photo.caption ||
                            "No caption"}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveExistingPhoto(
                              photo,
                            )
                          }
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                          aria-label="Remove photo"
                        >
                          <Trash2
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"
                  >
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={photo.previewUrl}
                        alt="New memory photo"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-3 p-3">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(event) =>
                          updatePendingCaption(
                            photo.id,
                            event.target.value,
                          )
                        }
                        placeholder="Optional caption..."
                        className="w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePendingPhoto(
                            photo.id,
                          )
                        }
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />

                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 px-6 py-8 text-center">
                <ImagePlus
                  aria-hidden="true"
                  className="mx-auto h-6 w-6 text-amber-400"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No photos added
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Photos are optional, but they make
                  memories feel much more personal.
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-amber-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!canSave}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />

                  Saving...
                </>
              ) : editing ? (
                "Save Changes"
              ) : (
                "Save Memory"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}