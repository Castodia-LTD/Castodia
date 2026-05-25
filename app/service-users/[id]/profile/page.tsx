"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  StickyNote,
} from "lucide-react";

type ServiceUser = {
  id: string;
  full_name: string;
  photo_url: string | null;
  house_name: string | null;
  key_notes: string | null;
  allergies: string | null;
  communication_needs: string | null;
  risk_notes: string | null;
};

export default function ServiceUserProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [serviceUser, setServiceUser] =
    useState<ServiceUser | null>(null);

  async function loadServiceUser() {
    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        full_name,
        photo_url,
        house_name,
        key_notes,
        allergies,
        communication_needs,
        risk_notes
      `)
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUser(data);
  }

  useEffect(() => {
    loadServiceUser();
  }, []);

  if (!serviceUser) {
    return (
      <AppShell>
        <div className="p-6 text-slate-400">
          Loading...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-md px-4 py-6">

        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">

          <div className="flex items-center gap-4">

            {serviceUser.photo_url ? (
              <img
                src={serviceUser.photo_url}
                alt={serviceUser.full_name}
                className="h-24 w-24 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 text-4xl font-bold text-cyan-300">
                {serviceUser.full_name.charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold">
                {serviceUser.full_name}
              </h1>

              <p className="mt-2 text-slate-400">
                {serviceUser.house_name}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="mt-6 space-y-4">

          {/* Key Notes */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                <StickyNote size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Key Notes
                </h2>

                <p className="text-sm text-slate-400">
                  Important daily information
                </p>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line text-slate-200">
              {serviceUser.key_notes ||
                "No key notes recorded."}
            </p>
          </div>

          {/* Allergies */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 shadow-xl backdrop-blur">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-500/20 p-3 text-red-300">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-red-300">
                  Allergies
                </h2>

                <p className="text-sm text-red-200/70">
                  Medication / food / environmental
                </p>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line text-slate-100">
              {serviceUser.allergies ||
                "No allergies recorded."}
            </p>
          </div>

          {/* Communication */}
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 shadow-xl backdrop-blur">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-300">
                <MessageSquare size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-blue-300">
                  Communication Needs
                </h2>

                <p className="text-sm text-blue-200/70">
                  Communication preferences and support
                </p>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line text-slate-100">
              {serviceUser.communication_needs ||
                "No communication needs recorded."}
            </p>
          </div>

          {/* Risk Notes */}
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 shadow-xl backdrop-blur">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-300">
                <ShieldAlert size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-amber-300">
                  Risk Notes
                </h2>

                <p className="text-sm text-amber-200/70">
                  Risks, triggers and safety information
                </p>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line text-slate-100">
              {serviceUser.risk_notes ||
                "No risk notes recorded."}
            </p>
          </div>

        </div>
      </div>
    </AppShell>
  );
}