import PlatformOrganisationTimelineCategoryPage from "@/features/platform/organisations/PlatformOrganisationTimelineCategoryPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const { id, category } = await params;

  return (
    <PlatformOrganisationTimelineCategoryPage
      organisationId={id}
      categoryKey={category}
    />
  );
}