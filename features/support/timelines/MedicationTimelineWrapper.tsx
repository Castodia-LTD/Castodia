"use client";

import MedicationAdministrationForm from "@/features/manager/emar/components/MedicationAdministrationForm";

type Props = {
  serviceUserId: string;
  onSaved?: () => void;
  onCreateTimelineEntry?: (summary: string) => Promise<void>;
};

export default function MedicationForm({
  serviceUserId,
  onSaved,
  onCreateTimelineEntry,
}: Props) {
  return (
    <MedicationAdministrationForm
      serviceUserId={serviceUserId}
      onSaved={onSaved}
      onCreateTimelineEntry={onCreateTimelineEntry}
    />
  );
}