import type { TrainingStatus } from "./types";

export function getTrainingStatus(
  expiryDate: string | null
): TrainingStatus {
  if (!expiryDate) {
    return "no-expiry";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return "expired";
  }

  if (daysUntilExpiry <= 30) {
    return "due-soon";
  }

  return "current";
}

export function getTrainingStatusLabel(
  status: TrainingStatus
) {
  if (status === "current") return "Current";
  if (status === "due-soon") return "Due soon";
  if (status === "expired") return "Expired";

  return "No expiry";
}

export function getTrainingStatusVariant(
  status: TrainingStatus
) {
  if (status === "current") return "success" as const;
  if (status === "due-soon") return "warning" as const;
  if (status === "expired") return "danger" as const;

  return "neutral" as const;
}

export function formatTrainingDate(value: string | null) {
  if (!value) return "Not recorded";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-GB"
  );
}

export function sanitiseTrainingFileName(
  fileName: string
) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}