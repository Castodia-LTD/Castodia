"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  Puzzle,
  ClipboardList,
  Home,
  Palette,
  CreditCard,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CastodiaPageShell } from "@/components/castodia";

type Organisation = {
  id: string;
  name: string;
  uses_houses: boolean | null;
  created_at: string;
  is_active: boolean;
  status: string;
};

type Props = {
  organisationId: string;
  children?: React.ReactNode;
};

const tabs = [
  { label: "Overview", path: "", icon: Building2 },
  { label: "Users", path: "users", icon: Users },
  { label: "Modules", path: "modules", icon: Puzzle },
  { label: "Timeline", path: "timeline", icon: ClipboardList },
  { label: "Houses", path: "houses", icon: Home },
  { label: "Branding", path: "branding", icon: Palette },
  { label: "Subscription", path: "subscription", icon: CreditCard },
  { label: "Audit", path: "audit", icon: FileText },
];

export default function PlatformOrganisationHubPage({
  organisationId,
  children,
}: Props) {
  const pathname = usePathname();

  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrganisation() {
      setLoading(true);

      const { data, error } = await supabase
        .from("organisations")
        .select("id, name, uses_houses, created_at, is_active, status")
        .eq("id", organisationId)
        .maybeSingle();

      if (error) {
        console.error("Organisation load error:", error);
        setOrganisation(null);
      } else {
        setOrganisation(data);
      }

      setLoading(false);
    }

    loadOrganisation();
  }, [organisationId]);

  if (loading) {
    return (
      <CastodiaPageShell
        title="Organisation"
        description="Loading organisation..."
        maxWidth="full"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading...
        </div>
      </CastodiaPageShell>
    );
  }

  if (!organisation) {
    return (
      <CastodiaPageShell
        title="Organisation not found"
        description="This organisation could not be loaded."
        maxWidth="full"
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Organisation not found.
        </div>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell
      title={organisation.name}
      description="Manage this organisation's users, modules, timeline setup and platform configuration."
      maxWidth="full"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-sm">
              <Building2 size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                {organisation.name}
              </h1>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {organisation.status}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {organisation.is_active ? "Active" : "Inactive"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Created{" "}
                  {new Date(organisation.created_at).toLocaleDateString(
                    "en-GB"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const href = tab.path
              ? `/platform/organisations/${organisation.id}/${tab.path}`
              : `/platform/organisations/${organisation.id}`;

            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={tab.label}
                href={href}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm"
                    : "inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
                }
              >
                <Icon size={17} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children ?? (
  <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold text-slate-950">Overview</h2>
    <p className="mt-2 text-slate-600">
      Organisation hub connected. Next we’ll add users, modules and timeline
      configuration here.
    </p>
  </div>
)}
    </CastodiaPageShell>
  );
}