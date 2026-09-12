"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { CastodiaBadge, CastodiaButton, CastodiaCard } from "@/components/castodia";
import { createMentalCapacityDocumentUrl } from "@/lib/care/mental-capacity/api";
import type { MentalCapacityDocumentRecord } from "@/lib/care/mental-capacity/types";

type Props = {
  document: MentalCapacityDocumentRecord;
  serviceUserId: string;
  portal: "manager" | "support";
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MentalCapacityDocumentView({ document, serviceUserId, portal }: Props) {
  const [opening, setOpening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function openDocument() {
    const documentWindow = window.open("", "_blank");
    if (documentWindow) documentWindow.opener = null;
    setOpening(true);
    setErrorMessage(null);

    try {
      const url = await createMentalCapacityDocumentUrl(document.storage_path);
      if (documentWindow) {
        documentWindow.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error) {
      documentWindow?.close();
      setErrorMessage(
        error instanceof Error ? error.message : "The document could not be opened.",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/care/${portal}/service-users/${serviceUserId}/mental-capacity`}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            ← All mental capacity assessments
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-teal-700">
            {document.title}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{document.decision}</h2>
        </div>
        <CastodiaBadge variant="info" className="self-start">Uploaded document</CastodiaBadge>
      </div>

      {portal === "support" ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
          Read-only completed record. You can securely view or download the document but cannot change it.
        </div>
      ) : null}

      {errorMessage ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <CastodiaCard>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessment date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatDate(document.assessment_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatDate(document.review_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed by</dt>
            <dd className="mt-1 font-semibold text-slate-950">{document.completed_by}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uploaded</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {new Date(document.uploaded_at).toLocaleDateString("en-GB")}
            </dd>
          </div>
        </dl>
      </CastodiaCard>

      <CastodiaCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-950">{document.file_name}</h3>
            <p className="mt-1 text-sm text-slate-500">{formatFileSize(document.file_size_bytes)}</p>
          </div>
          <CastodiaButton type="button" disabled={opening} onClick={() => void openDocument()}>
            <span className="inline-flex items-center gap-2">
              {opening ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Download aria-hidden="true" className="h-4 w-4" />}
              {opening ? "Opening…" : "View or download"}
            </span>
          </CastodiaButton>
        </div>

        {document.notes ? (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-950">Notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{document.notes}</p>
          </div>
        ) : null}
      </CastodiaCard>
    </div>
  );
}
