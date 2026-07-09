import PlatformOrganisationHubPage from "@/features/platform/organisations/PlatformOrganisationHubPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlatformOrganisationHubPage organisationId={id} />;
}