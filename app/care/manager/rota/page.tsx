import Link from "next/link";
import { ArrowRight, Building2, Home, HousePlus } from "lucide-react";

import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";

const services = [
  {
    title: "Supported Living",
    description: "Manage the existing person-based rotas, including staff assignments and overnight support.",
    href: "/care/manager/rota/supported-living",
    icon: Home,
    available: true,
  },
  {
    title: "Domiciliary Care",
    description: "Visit-based scheduling and travel-aware staff allocation.",
    href: "/care/manager/rota/domiciliary",
    icon: HousePlus,
    available: false,
  },
  {
    title: "Residential Care",
    description: "Home and unit staffing coverage and shift planning.",
    href: "/care/manager/rota/residential",
    icon: Building2,
    available: false,
  },
] as const;

export default function Page() {
  return (
    <CastodiaPageShell
      title="Rotas"
      description="Choose the type of care service whose rotas you want to manage."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {services.map(({ title, description, href, icon: Icon, available }) => (
          <Link key={href} href={href} className="group block">
            <CastodiaCard className="h-full p-6 transition group-hover:border-cyan-300 group-hover:shadow-md">
              <Icon className="h-8 w-8 text-cyan-700" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                {available ? "Open rotas" : "View planned service"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </CastodiaCard>
          </Link>
        ))}
      </div>
    </CastodiaPageShell>
  );
}
