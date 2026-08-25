import CoreOrganisationHubPage from "@/features/core/organisations/CoreOrganisationHubPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CoreOrganisationHubPage organisationId={id} />;
}