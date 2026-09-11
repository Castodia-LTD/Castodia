"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  CastodiaPageShell,
  CastodiaCard,
} from "@/components/castodia";

export default function ServiceUserHubPage() {
  const params = useParams<{ id: string }>();
  const serviceUserId = params.id;

  const sections = [
    { label: "Care Plans", href: `/care/manager/service-users/${serviceUserId}/care-plans` },
    { label: "Risk Assessments", href: `/care/manager/service-users/${serviceUserId}/risk-assessments` },
    { label: "MCA", href: "#" },
    { label: "DoLS", href: "#" },
    { label: "Documents", href: "#" },
    { label: "Medication", href: `/care/manager/service-users/${serviceUserId}/medication` },
    { label: "Reviews", href: `/care/manager/service-users/${serviceUserId}/reviews` },
    { label: "Behaviour Incidents", href: "#" },
    { label: "Timeline", href: "#" },
  ];

  return (
    <CastodiaPageShell
      title="Person Hub"
      description={`ID: ${serviceUserId}`}
      maxWidth="wide"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          section.href === "#" ? (
            <CastodiaCard
              key={section.label}
              className="cursor-default opacity-80"
            >
              <h3 className="text-lg font-semibold">{section.label}</h3>
            </CastodiaCard>
          ) : (
            <Link key={section.label} href={section.href} className="block">
              <CastodiaCard className="cursor-pointer transition hover:scale-[1.01]" interactive>
                <h3 className="text-lg font-semibold">{section.label}</h3>
              </CastodiaCard>
            </Link>
          )
        ))}
      </div>
    </CastodiaPageShell>
  );
}
