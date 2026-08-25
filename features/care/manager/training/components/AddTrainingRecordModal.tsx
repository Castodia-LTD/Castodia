"use client";

import {
  FileCheck2,
  Loader2,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  CastodiaButton,
} from "@/components/castodia";
import type {
  TrainingStaffMember,
} from "@/lib/care/training/types";

export type AddTrainingRecordValues = {
  staffId: string;
  courseName: string;
  provider: string;
  completionDate: string;
  expiryDate: string;
  notes: string;
  certificate: File | null;
};

type AddTrainingRecordModalProps = {
  open: boolean;
  saving: boolean;
  staff: TrainingStaffMember[];
  courseOptions: string[];
  onClose: () => void;
  onSave: (
    values: AddTrainingRecordValues
  ) => void | Promise<void>;
};

const MAX_CERTIFICATE_SIZE =
  10 * 1024 * 1024;

const acceptedCertificateTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function AddTrainingRecordModal({
  open,
  saving,
  staff,
  courseOptions,
  onClose,
  onSave,
}: AddTrainingRecordModalProps) {
  const [selectedStaffId, setSelectedStaffId] =
    useState("");
  const [selectedCourse, setSelectedCourse] =
    useState("");
  const [customCourse, setCustomCourse] =
    useState("");
  const [provider, setProvider] = useState("");
  const [completionDate, setCompletionDate] =
    useState("");
  const [expiryDate, setExpiryDate] =
    useState("");
  const [notes, setNotes] = useState("");
  const [certificate, setCertificate] =
    useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedStaffId("");
      setSelectedCourse("");
      setCustomCourse("");
      setProvider("");
      setCompletionDate("");
      setExpiryDate("");
      setNotes("");
      setCertificate(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleCertificateChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setCertificate(null);
      return;
    }

    if (
      !acceptedCertificateTypes.includes(
        selectedFile.type
      )
    ) {
      alert(
        "Please choose a PDF, Word document, JPG, PNG or WebP file."
      );
      event.target.value = "";
      return;
    }

    if (
      selectedFile.size >
      MAX_CERTIFICATE_SIZE
    ) {
      alert(
        "The certificate must be smaller than 10 MB."
      );
      event.target.value = "";
      return;
    }

    setCertificate(selectedFile);
  }

  function resolveCourseName() {
    if (selectedCourse === "__custom__") {
      return customCourse.trim();
    }

    return selectedCourse.trim();
  }

  async function handleSave() {
    const courseName = resolveCourseName();

    if (!selectedStaffId) {
      alert("Select a staff member.");
      return;
    }

    if (!courseName) {
      alert("Select or enter a course name.");
      return;
    }

    if (!completionDate) {
      alert("Enter the completion date.");
      return;
    }

    await onSave({
      staffId: selectedStaffId,
      courseName,
      provider: provider.trim(),
      completionDate,
      expiryDate,
      notes: notes.trim(),
      certificate,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-training-record-title"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-training-record-title"
              className="text-xl font-semibold text-slate-950"
            >
              Add training record
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record completed training and
              attach evidence where available.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close add training record"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="training-staff"
              className="text-sm font-medium text-slate-700"
            >
              Staff member
            </label>

            <select
              id="training-staff"
              value={selectedStaffId}
              onChange={(event) =>
                setSelectedStaffId(
                  event.target.value
                )
              }
              disabled={saving}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">
                Select staff member
              </option>

              {staff.map((person) => (
                <option
                  key={person.id}
                  value={person.id}
                >
                  {person.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="training-course"
              className="text-sm font-medium text-slate-700"
            >
              Course
            </label>

            <select
              id="training-course"
              value={selectedCourse}
              onChange={(event) => {
                setSelectedCourse(
                  event.target.value
                );

                if (
                  event.target.value !==
                  "__custom__"
                ) {
                  setCustomCourse("");
                }
              }}
              disabled={saving}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">
                Select course
              </option>

              {courseOptions.map((course) => (
                <option
                  key={course}
                  value={course}
                >
                  {course}
                </option>
              ))}

              <option value="__custom__">
                Other / Custom course
              </option>
            </select>
          </div>

          {selectedCourse === "__custom__" ? (
            <div className="sm:col-span-2">
              <label
                htmlFor="custom-course"
                className="text-sm font-medium text-slate-700"
              >
                Custom course name
              </label>

              <input
                id="custom-course"
                value={customCourse}
                onChange={(event) =>
                  setCustomCourse(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="Enter the course name"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="training-provider"
              className="text-sm font-medium text-slate-700"
            >
              Provider
            </label>

            <input
              id="training-provider"
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value)
              }
              disabled={saving}
              placeholder="Training provider"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label
              htmlFor="completion-date"
              className="text-sm font-medium text-slate-700"
            >
              Completion date
            </label>

            <input
              id="completion-date"
              type="date"
              value={completionDate}
              onChange={(event) =>
                setCompletionDate(
                  event.target.value
                )
              }
              disabled={saving}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label
              htmlFor="training-expiry-date"
              className="text-sm font-medium text-slate-700"
            >
              Expiry date
            </label>

            <input
              id="training-expiry-date"
              type="date"
              value={expiryDate}
              onChange={(event) =>
                setExpiryDate(event.target.value)
              }
              disabled={saving}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="training-certificate"
              className="text-sm font-medium text-slate-700"
            >
              Certificate
            </label>

            <input
              id="training-certificate"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleCertificateChange}
              disabled={saving}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:font-semibold file:text-cyan-700"
            />

            <p className="mt-2 text-xs text-slate-500">
              PDF, Word, JPG, PNG or WebP.
              Maximum 10 MB.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="training-notes"
              className="text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="training-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              disabled={saving}
              rows={4}
              placeholder="Optional notes"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <CastodiaButton
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </CastodiaButton>

          <CastodiaButton
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileCheck2 className="h-4 w-4" />
                Save Training Record
              </>
            )}
          </CastodiaButton>
        </div>
      </div>
    </div>
  );
}