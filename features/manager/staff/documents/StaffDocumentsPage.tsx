"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaSection,
} from "@/components/castodia";
import { supabase } from "@/lib/supabase";

type StaffDocumentsPageProps = {
  staffId: string;
};

type DocumentCategory =
  | "employment"
  | "compliance"
  | "identity"
  | "insurance"
  | "qualifications"
  | "other";

type StaffDocument = {
  id: string;
  organisation_id: string;
  staff_id: string;
  category: DocumentCategory;
  document_type: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
};

type StaffProfile = {
  id: string;
  full_name: string;
  organisation_id: string;
};

const categories: Array<{
  value: DocumentCategory;
  label: string;
}> = [
  { value: "employment", label: "Employment" },
  { value: "compliance", label: "Compliance" },
  { value: "identity", label: "Identity" },
  { value: "insurance", label: "Insurance" },
  { value: "qualifications", label: "Qualifications" },
  { value: "other", label: "Other" },
];

const documentTypes: Record<DocumentCategory, string[]> = {
  employment: [
    "Contract",
    "Offer Letter",
    "Job Description",
    "Probation Review",
    "Contract Amendment",
  ],

  compliance: [
    "DBS Certificate",
    "DBS Update Service",
    "Right to Work Check",
    "Occupational Health Clearance",
    "Professional Registration",
  ],

  identity: [
    "Passport",
    "Driving Licence",
    "Birth Certificate",
    "Proof of Address",
    "National Insurance",
  ],

  insurance: [
    "Vehicle Insurance",
    "Business Insurance",
    "MOT",
  ],

  qualifications: [
    "Care Certificate",
    "NVQ",
    "Degree",
    "Other Qualification",
  ],

  other: [
    "Fit Note",
    "Disciplinary Letter",
    "Return to Work",
    "Other",
  ],
};

const acceptedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatDate(value: string | null) {
  if (!value) return "Not recorded";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) {
    return {
      label: "No expiry",
      variant: "neutral" as const,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);
  const difference = Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return {
      label: "Expired",
      variant: "danger" as const,
    };
  }

  if (difference <= 30) {
    return {
      label: "Expires soon",
      variant: "warning" as const,
    };
  }

  return {
    label: "Valid",
    variant: "success" as const,
  };
}

function sanitiseFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

export default function StaffDocumentsPage({
  staffId,
}: StaffDocumentsPageProps) {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [documents, setDocuments] = useState<StaffDocument[]>([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [category, setCategory] =
    useState<DocumentCategory>("employment");
  const [documentType, setDocumentType] = useState(
    documentTypes.employment[0]
  );
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setPageError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be signed in.");
      }

      const { data: currentProfile, error: currentProfileError } =
        await supabase
          .from("profiles")
          .select("organisation_id")
          .eq("id", user.id)
          .single();

      if (
        currentProfileError ||
        !currentProfile?.organisation_id
      ) {
        throw new Error(
          currentProfileError?.message ||
            "Your organisation could not be identified."
        );
      }

      const { data: staffProfile, error: staffError } =
        await supabase
          .from("profiles")
          .select("id, full_name, organisation_id")
          .eq("id", staffId)
          .eq(
            "organisation_id",
            currentProfile.organisation_id
          )
          .single();

      if (staffError || !staffProfile) {
        throw new Error(
          staffError?.message || "Staff member not found."
        );
      }

      const { data: documentData, error: documentError } =
        await supabase
          .from("staff_documents")
          .select(
            `
              id,
              organisation_id,
              staff_id,
              category,
              document_type,
              file_name,
              storage_path,
              mime_type,
              file_size,
              issue_date,
              expiry_date,
              notes,
              uploaded_by,
              created_at
            `
          )
          .eq("staff_id", staffId)
          .eq(
            "organisation_id",
            currentProfile.organisation_id
          )
          .order("created_at", { ascending: false });

      if (documentError) {
        throw new Error(documentError.message);
      }

      setStaff(staffProfile as StaffProfile);
      setDocuments(
        (documentData ?? []) as StaffDocument[]
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load staff documents."
      );
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const documentsByCategory = useMemo(() => {
    return categories.map((categoryOption) => ({
      ...categoryOption,
      documents: documents.filter(
        (document) =>
          document.category === categoryOption.value
      ),
    }));
  }, [documents]);

  function resetUploadForm() {
    setCategory("employment");
    setDocumentType(documentTypes.employment[0]);
    setIssueDate("");
    setExpiryDate("");
    setNotes("");
    setFile(null);
  }

  function closeUpload() {
    if (uploading) return;

    resetUploadForm();
    setUploadOpen(false);
  }

  function handleCategoryChange(
    nextCategory: DocumentCategory
  ) {
    setCategory(nextCategory);
    setDocumentType(documentTypes[nextCategory][0]);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!acceptedFileTypes.includes(selectedFile.type)) {
      alert(
        "Please choose a PDF, Word document, JPG, PNG or WebP file."
      );
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("The document must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function uploadDocument() {
    if (!staff) return;

    if (!documentType.trim()) {
      alert("Select a document type.");
      return;
    }

    if (!file) {
      alert("Choose a document to upload.");
      return;
    }

    setUploading(true);

    const documentId = crypto.randomUUID();
    const safeFileName = sanitiseFileName(file.name);

    const storagePath = [
      staff.organisation_id,
      staff.id,
      documentId,
      safeFileName,
    ].join("/");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          userError?.message || "You must be signed in."
        );
      }

      const { error: uploadError } = await supabase.storage
        .from("staff-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: insertError } = await supabase
        .from("staff_documents")
        .insert({
          id: documentId,
          organisation_id: staff.organisation_id,
          staff_id: staff.id,
          category,
          document_type: documentType.trim(),
          file_name: file.name,
          storage_path: storagePath,
          mime_type: file.type || null,
          file_size: file.size,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          notes: notes.trim() || null,
          uploaded_by: user.id,
        });

      if (insertError) {
        await supabase.storage
          .from("staff-documents")
          .remove([storagePath]);

        throw new Error(insertError.message);
      }

      closeUpload();
      await loadDocuments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload the document."
      );
    } finally {
      setUploading(false);
    }
  }

  async function viewDocument(document: StaffDocument) {
    const { data, error } = await supabase.storage
      .from("staff-documents")
      .createSignedUrl(document.storage_path, 60);

    if (error || !data?.signedUrl) {
      alert(
        error?.message || "Unable to open the document."
      );
      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function deleteDocument(document: StaffDocument) {
    const confirmed = window.confirm(
      `Delete "${document.document_type}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("staff-documents")
      .remove([document.storage_path]);

    if (storageError) {
      alert(storageError.message);
      return;
    }

    const { error: databaseError } = await supabase
      .from("staff_documents")
      .delete()
      .eq("id", document.id);

    if (databaseError) {
      alert(
        `The file was removed, but its database record could not be deleted: ${databaseError.message}`
      );
      return;
    }

    await loadDocuments();
  }

  if (loading) {
    return (
      <CastodiaCard>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading staff documents...
        </div>
      </CastodiaCard>
    );
  }

  if (pageError || !staff) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center">
          <h1 className="text-xl font-semibold text-slate-950">
            Documents could not be loaded
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {pageError || "Staff member not found."}
          </p>

          <Link
            href="/manager/staff"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>
        </div>
      </CastodiaCard>
    );
  }
return (
  <div className="space-y-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-slate-950">
      Documents
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Store employment, identity, compliance, insurance and qualification
      records for {staff.full_name}.
    </p>
  </div>

  <div className="flex items-center gap-2">
    <Link href={`/manager/staff/${staff.id}`}>
      <CastodiaButton variant="secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </CastodiaButton>
    </Link>

    <CastodiaButton onClick={() => setUploadOpen(true)}>
      <Plus className="h-4 w-4" />
      Upload Document
    </CastodiaButton>
  </div>
</div>

      {documents.length === 0 ? (
        <CastodiaCard>
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-400" />

            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              No documents uploaded
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Upload the first document for this staff member.
            </p>

            <div className="mt-6">
              <CastodiaButton
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </CastodiaButton>
            </div>
          </div>
        </CastodiaCard>
      ) : (
        documentsByCategory.map((group) => (
          <CastodiaSection
            key={group.value}
            title={group.label}
            description={`${group.documents.length} document${
              group.documents.length === 1 ? "" : "s"
            }`}
          >
            {group.documents.length === 0 ? (
              <CastodiaCard>
                <p className="text-sm text-slate-500">
                  No {group.label.toLowerCase()} documents.
                </p>
              </CastodiaCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.documents.map((document) => {
                  const expiryStatus = getExpiryStatus(
                    document.expiry_date
                  );

                  return (
                    <CastodiaCard
                      key={document.id}
                      className="h-full"
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-950">
                                {document.document_type}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {document.file_name}
                              </p>
                            </div>
                          </div>

                          <CastodiaBadge
                            variant={expiryStatus.variant}
                          >
                            {expiryStatus.label}
                          </CastodiaBadge>
                        </div>

                        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Issue date
                            </dt>

                            <dd className="mt-1 font-medium text-slate-700">
                              {formatDate(document.issue_date)}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Expiry date
                            </dt>

                            <dd className="mt-1 font-medium text-slate-700">
                              {formatDate(document.expiry_date)}
                            </dd>
                          </div>
                        </dl>

                        {document.notes && (
                          <p className="mt-4 line-clamp-3 text-sm text-slate-500">
                            {document.notes}
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          <p className="mb-3 text-xs text-slate-400">
                            {formatFileSize(document.file_size)}
                          </p>

                          <div className="flex items-center gap-2">
                            <CastodiaButton
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                void viewDocument(document)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </CastodiaButton>

                            <CastodiaButton
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                void deleteDocument(document)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </CastodiaButton>
                          </div>
                        </div>
                      </div>
                    </CastodiaCard>
                  );
                })}
              </div>
            )}
          </CastodiaSection>
        ))
      )}

      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-document-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !uploading
            ) {
              closeUpload();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="upload-document-title"
                  className="text-xl font-semibold text-slate-950"
                >
                  Upload document
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a document to {staff.full_name}&apos;s
                  staff record.
                </p>
              </div>

              <button
                type="button"
                onClick={closeUpload}
                disabled={uploading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                aria-label="Close upload document"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="document-category"
                  className="text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="document-category"
                  value={category}
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value as DocumentCategory
                    )
                  }
                  disabled={uploading}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {categories.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="document-type"
                  className="text-sm font-medium text-slate-700"
                >
                  Document type
                </label>

                <select
                  id="document-type"
                  value={documentType}
                  onChange={(event) =>
                    setDocumentType(event.target.value)
                  }
                  disabled={uploading}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {documentTypes[category].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="issue-date"
                  className="text-sm font-medium text-slate-700"
                >
                  Issue date
                </label>

                <input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(event) =>
                    setIssueDate(event.target.value)
                  }
                  disabled={uploading}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="expiry-date"
                  className="text-sm font-medium text-slate-700"
                >
                  Expiry date
                </label>

                <input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(event) =>
                    setExpiryDate(event.target.value)
                  }
                  disabled={uploading}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="document-file"
                  className="text-sm font-medium text-slate-700"
                >
                  File
                </label>

                <input
                  id="document-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:font-semibold file:text-cyan-700"
                />

                <p className="mt-2 text-xs text-slate-500">
                  PDF, Word, JPG, PNG or WebP. Maximum 10 MB.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="document-notes"
                  className="text-sm font-medium text-slate-700"
                >
                  Notes
                </label>

                <textarea
                  id="document-notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  disabled={uploading}
                  rows={4}
                  placeholder="Optional notes about this document"
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <CastodiaButton
                variant="secondary"
                onClick={closeUpload}
                disabled={uploading}
              >
                Cancel
              </CastodiaButton>

              <CastodiaButton
                onClick={() => void uploadDocument()}
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </CastodiaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}