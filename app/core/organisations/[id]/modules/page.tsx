import CoreOrganisationModulesPage from "@/features/core/organisations/CoreOrganisationModulesPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CoreOrganisationModulesPage organisationId={id} />;
}