"use client";

import { useParams } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  SectionCard,
} from "@/components/layouts";

export default function ServiceUserHubPage() {
  const params = useParams();

  return (
    <PageContainer>
      <PageHeader
        title="Service User Hub"
        subtitle={`ID: ${params.id}`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard>Care Plans</SectionCard>
        <SectionCard>Risk Assessments</SectionCard>
        <SectionCard>MCA</SectionCard>
        <SectionCard>DoLS</SectionCard>
        <SectionCard>Documents</SectionCard>
        <SectionCard>Medication</SectionCard>
        <SectionCard>Behaviour Incidents</SectionCard>
        <SectionCard>Timeline</SectionCard>
      </div>
    </PageContainer>
  );
}