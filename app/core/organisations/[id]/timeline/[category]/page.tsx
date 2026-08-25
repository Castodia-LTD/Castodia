import CoreOrganisationTimelineCategoryPage from "@/features/core/organisations/CoreOrganisationTimelineCategoryPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const { id, category } = await params;

  return (
    <CoreOrganisationTimelineCategoryPage
      organisationId={id}
      categoryKey={category}
    />
  );
}