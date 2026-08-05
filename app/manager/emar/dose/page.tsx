import { Suspense } from "react";
import DoseManagementPage from "@/features/manager/emar/dose/DoseManagementPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading medication dose management…</div>}>
      <DoseManagementPage />
    </Suspense>
  );
}