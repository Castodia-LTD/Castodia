"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
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

export default function PlatformOrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrganisations() {
    setLoading(true);

    const { data, error } = await supabase
      .from("organisations")
      .select("id, name, uses_houses, created_at, is_active, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrganisations([]);
    } else {
      setOrganisations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOrganisations();
  }, []);

  return (
    <CastodiaPageShell
      title="Organisations"
      description="Create, configure and manage Castodia customer organisations."
      maxWidth="full"
    >
      <Link
  href="/platform/organisations/new"
  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm"
>
  <Plus size={18} />
  Create Organisation
</Link>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading organisations...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organisations.map((organisation) => (
            <Link
              key={organisation.id}
              href={`/platform/organisations/${organisation.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {organisation.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Created{" "}
                      {new Date(organisation.created_at).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {organisation.status}
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {organisation.uses_houses ? "Uses houses" : "No houses"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {organisation.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CastodiaPageShell>
  );
}