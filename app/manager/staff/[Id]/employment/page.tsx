import StaffEmploymentPage from "@/features/manager/staff/employment/StaffEmploymentPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <StaffEmploymentPage staffId={id} />;
}
