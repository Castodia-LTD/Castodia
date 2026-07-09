import PlatformOrganisationTimelinePage from "@/features/platform/organisations/PlatformOrganisationTimelinePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlatformOrganisationTimelinePage organisationId={id} />;
}