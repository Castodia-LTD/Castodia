import { notFound } from "next/navigation";

import StaffDocumentsPage from "@/features/manager/staff/documents/StaffDocumentsPage";

type PageProps = {
  params: Promise<{
    id?: string;
    Id?: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const staffId = resolvedParams.id ?? resolvedParams.Id;

  if (!staffId || !UUID_PATTERN.test(staffId)) {
    console.error("Invalid Documents route parameters:", resolvedParams);
    notFound();
  }

  return <StaffDocumentsPage staffId={staffId} />;
}