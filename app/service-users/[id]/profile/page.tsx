"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import WellbeingIndicatorManager from "@/components/wellbeing/WellbeingIndicatorManager";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  HeartPulse,
  MessageSquare,
  ShieldAlert,
  StickyNote,
} from "lucide-react";

type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
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
      <AppShell>
        <div className="p-6 text-slate-400">Loading...</div>
      </AppShell>
    );
  }

  const serviceUserName =
    `${serviceUser.first_name ?? ""} ${serviceUser.surname ?? ""}`.trim() ||
    "Service user";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-md px-4 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
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
              <h1 className="break-words text-3xl font-bold">
                {serviceUserName}
              </h1>

              <p className="mt-2 text-slate-400">
                {serviceUser.house_name || "No house recorded"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
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
    </AppShell>
  );
}

type ProfileCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string | null;
  emptyText: string;
  colour: "cyan" | "red" | "blue" | "amber";
};

function ProfileCard({
  icon,
  title,
  subtitle,
  content,
  emptyText,
  colour,
}: ProfileCardProps) {
  const styles = {
    cyan: {
      card: "border-white/10 bg-white/10",
      icon: "bg-cyan-500/20 text-cyan-300",
      title: "text-white",
      subtitle: "text-slate-400",
      text: "text-slate-200",
    },
    red: {
      card: "border-red-500/20 bg-red-500/10",
      icon: "bg-red-500/20 text-red-300",
      title: "text-red-300",
      subtitle: "text-red-200/70",
      text: "text-slate-100",
    },
    blue: {
      card: "border-blue-500/20 bg-blue-500/10",
      icon: "bg-blue-500/20 text-blue-300",
      title: "text-blue-300",
      subtitle: "text-blue-200/70",
      text: "text-slate-100",
    },
    amber: {
      card: "border-amber-500/20 bg-amber-500/10",
      icon: "bg-amber-500/20 text-amber-300",
      title: "text-amber-300",
      subtitle: "text-amber-200/70",
      text: "text-slate-100",
    },
  }[colour];

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl backdrop-blur ${styles.card}`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${styles.icon}`}>{icon}</div>

        <div>
          <h2 className={`text-xl font-bold ${styles.title}`}>{title}</h2>
          <p className={`text-sm ${styles.subtitle}`}>{subtitle}</p>
        </div>
      </div>

      <p className={`mt-5 whitespace-pre-line ${styles.text}`}>
        {content || emptyText}
      </p>
    </div>
  );
}