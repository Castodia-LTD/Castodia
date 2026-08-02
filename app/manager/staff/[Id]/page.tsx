
import StaffHubPage from "@/features/manager/admin/staff/StaffHubPage";

type PageProps = {
  params: Promise<{
    staffId: string;
  }>;
};

export default async function Page({
  params,
}: PageProps) {
  const { staffId } = await params;

  return <StaffHubPage staffId={staffId} />;
}