import EmarPage from "@/features/manager/emar/EmarPage";

type PageProps = {
  params: Promise<{
    serviceUserId: string;
  }>;
};

export default async function Page({
  params,
}: PageProps) {
  const { serviceUserId } = await params;

  return (
    <EmarPage
      initialServiceUserId={serviceUserId}
    />
  );
}