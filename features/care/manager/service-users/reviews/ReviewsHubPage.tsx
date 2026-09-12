"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, ClipboardCheck } from "lucide-react";

import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";

type Props = {
  portal?: "manager" | "support";
};

export default function ReviewsHubPage({ portal = "manager" }: Props) {
  const params = useParams<{ id: string }>();
  const personId = params.id;

  const reviewTypes = [
    {
      title: "Monthly Check-In",
      description: "Record the person's monthly views, choices, wellbeing, consent and agreed actions.",
      href: `/care/${portal}/service-users/${personId}/reviews/monthly-check-in`,
      icon: CalendarDays,
    },
    ...(portal === "manager"
      ? [
          {
            title: "Incident Reviews",
            description:
              "Review recorded behaviour incidents and document management oversight.",
            href: `/care/manager/service-users/${personId}/reviews/incidents`,
            icon: ClipboardCheck,
          },
        ]
      : []),
  ];

  return (
    <CastodiaPageShell
      title="Reviews"
      description="Choose the type of review you want to complete or revisit."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {reviewTypes.map((review) => {
          const Icon = review.icon;
          return (
            <Link key={review.title} href={review.href} className="block">
              <CastodiaCard interactive className="h-full">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{review.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{review.description}</p>
                  </div>
                </div>
              </CastodiaCard>
            </Link>
          );
        })}
      </div>
    </CastodiaPageShell>
  );
}
