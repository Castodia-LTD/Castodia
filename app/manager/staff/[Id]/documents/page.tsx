import StaffDocumentsPage from "@/features/manager/staff/documents/StaffDocumentsPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <StaffDocumentsPage staffId={id} />;
}