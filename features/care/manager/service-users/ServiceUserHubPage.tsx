"use client";

import { useParams } from "next/navigation";

import {
  CastodiaPageShell,
  CastodiaCard,
} from "@/components/castodia";

export default function ServiceUserHubPage() {
  const params = useParams();

  const sections = [
    "Care Plans",
    "Risk Assessments",
    "MCA",
    "DoLS",
    "Documents",
    "Medication",
    "Behaviour Incidents",
    "Timeline",
  ];

  return (
    <CastodiaPageShell
      title="Service User Hub"
      description={`ID: ${params.id}`}
      maxWidth="wide"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <CastodiaCard
            key={section}
            className="cursor-pointer transition hover:scale-[1.01]"
          >
            <h3 className="text-lg font-semibold">
              {section}
            </h3>
          </CastodiaCard>
        ))}
      </div>
    </CastodiaPageShell>
  );
}