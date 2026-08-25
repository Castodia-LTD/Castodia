import CoreOrganisationTimelinePage from "@/features/core/organisations/CoreOrganisationTimelinePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CoreOrganisationTimelinePage organisationId={id} />;
}