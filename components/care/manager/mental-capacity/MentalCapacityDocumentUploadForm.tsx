"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";

import { CastodiaButton } from "@/components/castodia";
import {
  FormAlert,
  FormCheckbox,
  FormField,
  FormInput,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";
import { uploadMentalCapacityDocument } from "@/lib/care/mental-capacity/api";

type Props = { serviceUserId: string };

export function MentalCapacityDocumentUploadForm({ serviceUserId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [decision, setDecision] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [completedBy, setCompletedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Choose the completed PDF or Word document.");
      return;
    }
    if (!confirmed) {
      setErrorMessage("Confirm that this is a completed MCA for the selected person.");
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const document = await uploadMentalCapacityDocument({
        serviceUserId,
        title,
        decision,
        assessmentDate,
        reviewDate,
        completedBy,
        notes,
        file,
      });
      router.push(
        `/care/manager/service-users/${serviceUserId}/mental-capacity/uploaded/${document.id}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The completed MCA could not be uploaded.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Upload completed MCA</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Add an assessment completed outside Castodia to this person’s mental capacity record.
        </p>
      </div>

      <FormAlert variant="info" title="Completed documents only">
        Upload the final signed or otherwise authorised version. Castodia stores the document securely but does not verify its legal sufficiency.
      </FormAlert>
      {errorMessage ? <FormAlert variant="error">{errorMessage}</FormAlert> : null}

      <FormSection title="Document details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Assessment title" htmlFor="mca-upload-title" required description="For example: Medication assessment">
            <FormInput id="mca-upload-title" value={title} required disabled={uploading} onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <FormField label="Completed by" htmlFor="mca-upload-completed-by" required description="Name or role of the assessor">
            <FormInput id="mca-upload-completed-by" value={completedBy} required disabled={uploading} onChange={(event) => setCompletedBy(event.target.value)} />
          </FormField>
        </div>

        <FormField label="Exact decision assessed" htmlFor="mca-upload-decision" required>
          <FormTextarea id="mca-upload-decision" value={decision} required disabled={uploading} onChange={(event) => setDecision(event.target.value)} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Assessment date" htmlFor="mca-upload-assessment-date" required>
            <FormInput id="mca-upload-assessment-date" type="date" value={assessmentDate} required disabled={uploading} onChange={(event) => setAssessmentDate(event.target.value)} />
          </FormField>
          <FormField label="Review date" htmlFor="mca-upload-review-date" description="Optional where no review date was specified">
            <FormInput id="mca-upload-review-date" type="date" min={assessmentDate || undefined} value={reviewDate} disabled={uploading} onChange={(event) => setReviewDate(event.target.value)} />
          </FormField>
        </div>

        <FormField label="PDF or Word document" htmlFor="mca-upload-file" required>
          <FormInput
            id="mca-upload-file"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            disabled={uploading}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:font-semibold file:text-cyan-700"
          />
          <p className="mt-2 text-xs text-slate-500">PDF, DOC or DOCX. Maximum 10 MB.</p>
        </FormField>

        <FormField label="Notes" htmlFor="mca-upload-notes" description="Optional context about the document or review arrangements">
          <FormTextarea id="mca-upload-notes" value={notes} disabled={uploading} onChange={(event) => setNotes(event.target.value)} />
        </FormField>

        <FormCheckbox
          checked={confirmed}
          disabled={uploading}
          required
          onChange={(event) => setConfirmed(event.target.checked)}
          label="I confirm this is a completed MCA for the selected service user"
          description="The title, decision, assessor and dates entered above accurately identify the uploaded record."
        />
      </FormSection>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <CastodiaButton
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => router.push(`/care/manager/service-users/${serviceUserId}/mental-capacity`)}
        >
          Cancel
        </CastodiaButton>
        <CastodiaButton type="submit" disabled={uploading}>
          <span className="inline-flex items-center gap-2">
            {uploading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <FileUp aria-hidden="true" className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload completed MCA"}
          </span>
        </CastodiaButton>
      </div>
    </form>
  );
}
