"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WellbeingIndicatorManager from "@/components/wellbeing/WellbeingIndicatorManager";
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

import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

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
      <CastodiaPageShell
        title="Service User Profile"
        description="Loading service user details."
        maxWidth="default"
      >
        <CastodiaCard>
          <p className="text-sm text-slate-500">Loading service user...</p>
        </CastodiaCard>
      </CastodiaPageShell>
    );
  }

  const serviceUserName =
    `${serviceUser.first_name ?? ""} ${serviceUser.surname ?? ""}`.trim() ||
    "Service user";

  return (
    <CastodiaPageShell
      title={serviceUserName}
      description={serviceUser.house_name || "No house recorded"}
      maxWidth="default"
    >
      <CastodiaCard>
        <div className="flex items-center gap-4">
          {serviceUser.photo_url ? (
            <img
              src={serviceUser.photo_url}
              alt={serviceUserName}
              className="h-24 w-24 rounded-3xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-4xl font-bold text-slate-700">
              {serviceUserName.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="break-words text-3xl font-bold text-slate-950">
              {serviceUserName}
            </h1>

            <p className="mt-2 text-slate-500">
              {serviceUser.house_name || "No house recorded"}
            </p>
          </div>
        </div>
      </CastodiaCard>

      <div className="space-y-4">
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

        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <HeartPulse size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-emerald-700">
                Wellbeing
              </h2>

              <p className="text-sm text-slate-500">
                Custom indicators used during wellbeing observations
              </p>
            </div>
          </div>

          <div className="mt-5">
            <WellbeingIndicatorManager serviceUserId={serviceUser.id} />
          </div>
        </CastodiaCard>
      </div>
    </CastodiaPageShell>
  );
}