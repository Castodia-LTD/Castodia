import SafeguardingCaseWorkspace from "@/components/manager/safeguarding/SafeguardingCaseWorkspace";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return <SafeguardingCaseWorkspace caseId={caseId} />;
}