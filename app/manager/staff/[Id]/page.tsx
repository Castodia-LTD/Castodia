// staff hub route
import StaffHubPage from "@/features/manager/admin/staff/StaffHubPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <StaffHubPage staffId={id} />;
}