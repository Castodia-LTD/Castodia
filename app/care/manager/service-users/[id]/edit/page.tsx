import EditServiceUserPage from "@/features/care/manager/service-users/edit/EditServiceUserPage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EditServiceUserPage serviceUserId={id} />;
}