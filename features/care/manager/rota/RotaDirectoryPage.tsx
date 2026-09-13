"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Home, UserRound } from "lucide-react";

import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import type { RotaPerson } from "@/features/care/shared/rota/types";

export default function RotaDirectoryPage() {
  const [people, setPeople] = useState<RotaPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      setLoading(true);
      setError(null);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) throw new Error("You are not signed in.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("organisation_id")
          .eq("id", user.id)
          .single();
        if (profileError || !profile?.organisation_id) throw new Error("Organisation not found.");

        const { data, error: peopleError } = await supabase
          .from("service_users")
          .select("id, full_name, house_name")
          .eq("organisation_id", profile.organisation_id)
          .eq("is_active", true)
          .order("full_name");
        if (peopleError) throw peopleError;
        if (!cancelled) setPeople((data ?? []) as RotaPerson[]);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Unable to load rotas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPeople();
    return () => { cancelled = true; };
  }, []);

  return (
    <CastodiaPageShell
      title="Rotas"
      description="Choose a person to build and manage their rota. Staff My rota views are populated automatically from these assignments."
      maxWidth="wide"
    >
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

      {loading ? (
        <CastodiaCard className="p-8 text-center text-sm text-slate-500">Loading service users…</CastodiaCard>
      ) : people.length === 0 ? (
        <CastodiaCard className="p-10 text-center">
          <UserRound className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">No active service users found</p>
          <p className="mt-1 text-sm text-slate-500">Active people will appear here when they are available to this organisation.</p>
        </CastodiaCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <Link key={person.id} href={`/care/manager/rota/${person.id}`} className="group block">
              <CastodiaCard className="h-full p-5 transition group-hover:border-cyan-300 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <CalendarDays className="h-5 w-5 text-cyan-700" />
                      <span className="truncate">{person.full_name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Home className="h-4 w-4" />
                      <span>{person.house_name || "No house assigned"}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-cyan-700">Open rota</p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-700" />
                </div>
              </CastodiaCard>
            </Link>
          ))}
        </div>
      )}
    </CastodiaPageShell>
  );
}
