import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";

import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";
import StaffHero, {
  type StaffHeroStaff,
} from "@/components/manager/staff-hub/StaffHero";
import StaffHubHeader from "@/components/manager/staff-hub/StaffHubHeader";
import { createClient } from "@/lib/supabase/server";

type StaffHubPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const overviewCards = [
  {
    title: "Training",
    value: "97%",
    description: "Mandatory training complete",
    icon: GraduationCap,
  },
  {
    title: "Competencies",
    value: "12 / 13",
    description: "One competency outstanding",
    icon: ClipboardCheck,
  },
  {
    title: "Supervisions",
    value: "Up to date",
    description: "Next supervision not yet due",
    icon: MessageSquareText,
  },
  {
    title: "Documents",
    value: "Complete",
    description: "All required records present",
    icon: FileCheck2,
  },
  {
    title: "Certificates",
    value: "2 expiring",
    description: "Within the next 60 days",
    icon: Award,
  },
  {
    title: "Employment",
    value: "Permanent",
    description: "Active employment record",
    icon: BriefcaseBusiness,
  },
];

export default async function StaffHubPage({
  params,
}: StaffHubPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        photo_url,
        role
      `,
    )
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const staff: StaffHeroStaff = {
    id: profile.id,
    full_name: profile.full_name || "Unnamed staff member",
    photo_url: profile.photo_url,
    job_title:
      profile.role === "manager"
        ? "Manager"
        : "Support Worker",
    house_name: null,
    email: null,
    employment_status: "Permanent",
    active: true,
  };

  return (
    <CastodiaPageShell>
      <div className="space-y-6">
        <StaffHubHeader staffId={staff.id} />

        <StaffHero staff={staff} />

        <section>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Staff overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Employment, training and workforce information at a glance.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <CastodiaCard
                  key={card.title}
                  className="relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>

                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {card.value}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {card.description}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CastodiaCard>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <CastodiaCard>
            <h2 className="text-lg font-semibold text-slate-950">
              Recent activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Important changes to this staff member’s record will appear
              here.
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No recent activity
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Training, supervision and document events will populate
                this area.
              </p>
            </div>
          </CastodiaCard>

          <CastodiaCard>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Outstanding actions
                </h2>

                <p className="text-sm text-slate-500">
                  Items requiring manager attention.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No outstanding actions
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Expiring records and overdue requirements will appear
                here.
              </p>
            </div>
          </CastodiaCard>
        </div>
      </div>
    </CastodiaPageShell>
  );
}