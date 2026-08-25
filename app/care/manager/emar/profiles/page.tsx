import { Suspense } from "react";
import MedicationProfilesPage from "@/features/care/manager/emar/profiles/MedicationProfilesPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading medication profiles…</div>}>
      <MedicationProfilesPage />
    </Suspense>
  );
}