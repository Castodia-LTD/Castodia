"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WellbeingIndicatorManager from "@/components/wellbeing/WellbeingIndicatorManager";
import { PageContainer, SectionCard } from "@/components/layouts";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  HeartPulse,
  MessageSquare,
  ShieldAlert,
  StickyNote,
  UserRound,
} from "lucide-react";
import ProfileCard from "./components/ProfileCard";

type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
  photo_url: string | null;
  house_name: string | null;
  gender: string | null;
  key_notes: string | null;
  allergies: string | null;
  communication_needs: string | null;
  risk_notes: string | null;
};

export default function ServiceUserProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadServiceUser() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.organisation_id) {
      alert("Organisation not found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        first_name,
        surname,
        photo_url,
        house_name,
        gender,
        key_notes,
        allergies,
        communication_needs,
        risk_notes
      `)
      .eq("id", id)
      .eq("organisation_id", profile.organisation_id)
      .single();

    if (error || !data) {
      alert("Service user not found.");
      setLoading(false);
      return;
    }

    setServiceUser(data);
    setLoading(false);
  }

  useEffect(() => {
    loadServiceUser();
  }, []);

  if (loading || !serviceUser) {
    return (
      <PageContainer>
        <SectionCard>
          <p className="text-sm text-slate-400">Loading service user...</p>
        </SectionCard>
      </PageContainer>
    );
  }

  const serviceUserName =
    `${serviceUser.first_name ?? ""} ${serviceUser.surname ?? ""}`.trim() ||
    "Service user";

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-screen-md">
        <SectionCard>
          <div className="flex items-center gap-4">
            {serviceUser.photo_url ? (
              <img
                src={serviceUser.photo_url}
                alt={serviceUserName}
                className="h-24 w-24 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 text-4xl font-bold text-cyan-300">
                {serviceUserName.charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold text-white">
                {serviceUserName}
              </h1>

              <p className="mt-2 text-slate-400">
                {serviceUser.house_name || "No house recorded"}
              </p>
            </div>
          </div>
        </SectionCard>

        <div className="mt-6 space-y-4">
          <ProfileCard
            icon={<UserRound size={22} />}
            title="Service User Details"
            subtitle="Basic profile information used across Castodia."
            content={`Gender: ${serviceUser.gender || "Not recorded"}`}
            emptyText="No details recorded."
            colour="cyan"
          />

          <ProfileCard
            icon={<StickyNote size={22} />}
            title="Key Notes"
            subtitle="Important daily information"
            content={serviceUser.key_notes}
            emptyText="No key notes recorded."
            colour="cyan"
          />

          <ProfileCard
            icon={<AlertTriangle size={22} />}
            title="Allergies"
            subtitle="Medication / food / environmental"
            content={serviceUser.allergies}
            emptyText="No allergies recorded."
            colour="red"
          />

          <ProfileCard
            icon={<MessageSquare size={22} />}
            title="Communication Needs"
            subtitle="Communication preferences and support"
            content={serviceUser.communication_needs}
            emptyText="No communication needs recorded."
            colour="blue"
          />

          <ProfileCard
            icon={<ShieldAlert size={22} />}
            title="Risk Notes"
            subtitle="Risks, triggers and safety information"
            content={serviceUser.risk_notes}
            emptyText="No risk notes recorded."
            colour="amber"
          />

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                <HeartPulse size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-emerald-300">
                  Wellbeing
                </h2>

                <p className="text-sm text-emerald-200/70">
                  Custom indicators used during wellbeing observations
                </p>
              </div>
            </div>

            <div className="mt-5">
              <WellbeingIndicatorManager serviceUserId={serviceUser.id} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}