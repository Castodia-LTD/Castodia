"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  ContentWidth,
  PageHeader,
} from "@/components/layout";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  surname: string | null;
  house_name: string | null;
  photo_url: string | null;
};

export default function TimelinesPage() {
  const pathname = usePathname();

  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadServiceUsers() {
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
      .select("role, organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    if (profile.role === "manager") {
      const { data, error } = await supabase
        .from("service_users")
        .select(
          "id, full_name, first_name, surname, house_name, photo_url",
        )
        .eq("organisation_id", profile.organisation_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setServiceUsers((data as ServiceUser[]) ?? []);
      setLoading(false);
      return;
    }

    const { data: accessData, error: accessError } = await supabase
      .from("staff_service_user_access")
      .select(`
        service_users (
          id,
          full_name,
          first_name,
          surname,
          house_name,
          photo_url
        )
      `)
      .eq("staff_id", user.id);

    if (accessError) {
      alert(accessError.message);
      setLoading(false);
      return;
    }

    const assignedServiceUsers =
      accessData
        ?.map((row: any) => row.service_users)
        .filter(Boolean) ?? [];

    setServiceUsers(assignedServiceUsers as ServiceUser[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadServiceUsers();
  }, []);

  return (
    <ContentWidth>
      <div className="space-y-6">
       <div>
  <PageHeader title="Timelines" />

  <p className="mt-2 text-sm text-slate-600">
    Choose a service user to view or add to their daily timeline.
  </p>
</div>

        <section className="overflow-hidden rounded-[28px] border border-teal-100/80 bg-gradient-to-br from-white/80 via-cyan-50/70 to-teal-50/80 p-5 shadow-[0_14px_40px_rgba(13,148,136,0.08)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#079c9c] to-[#6ed6ce] text-white shadow-[0_8px_20px_rgba(13,148,136,0.18)]">
              <Users size={21} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Choose a service user
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Open a person&apos;s timeline to review their recent records or
                add a new entry.
              </p>
            </div>
          </div>
        </section>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[24px] border border-teal-100/70 bg-white/60 shadow-[0_10px_30px_rgba(13,148,136,0.06)] backdrop-blur-xl"
              />
            ))}
          </div>
        )}

        {!loading && serviceUsers.length === 0 && (
          <div className="rounded-[24px] border border-teal-100 bg-white/70 p-8 text-center shadow-[0_10px_30px_rgba(13,148,136,0.06)] backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Users size={22} aria-hidden="true" />
            </div>

            <h2 className="mt-4 font-semibold text-slate-950">
              No service users assigned
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              There are currently no service users available to this account.
            </p>
          </div>
        )}

        {!loading && serviceUsers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {serviceUsers.map((serviceUser) => (
              <TimelineServiceUserGlassCard
                key={serviceUser.id}
                serviceUser={serviceUser}
                href={`${pathname}/${serviceUser.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </ContentWidth>
  );
}

function TimelineServiceUserGlassCard({
  serviceUser,
  href,
}: {
  serviceUser: ServiceUser;
  href: string;
}) {
  const displayName = getDisplayName(serviceUser);
  const initials = getInitials(displayName);

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-[24px]",
        "border border-teal-100/80 bg-white/70 backdrop-blur-xl",
        "shadow-[0_10px_30px_rgba(13,148,136,0.08)]",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-teal-200",
        "hover:bg-white/90 hover:shadow-[0_16px_38px_rgba(13,148,136,0.14)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-teal-500 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#079c9c] via-cyan-400 to-[#6ed6ce]" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <ServiceUserAvatar
            photoUrl={serviceUser.photo_url}
            name={displayName}
            initials={initials}
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {displayName}
            </h2>

            {serviceUser.house_name ? (
              <p className="mt-1 truncate text-sm font-medium text-teal-700">
                {serviceUser.house_name}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">
                Timeline record
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-teal-100/80 pt-4">
          <span className="text-sm font-semibold text-teal-700">
            View timeline
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700 transition-all group-hover:border-teal-200 group-hover:bg-teal-100 group-hover:translate-x-0.5">
            <ArrowRight size={17} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ServiceUserAvatar({
  photoUrl,
  name,
  initials,
}: {
  photoUrl: string | null;
  name: string;
  initials: string;
}) {
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-br from-teal-500 to-cyan-400 shadow-md ring-2 ring-teal-100">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`${name}'s profile photo`}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <span className="text-lg font-bold text-white">
          {initials}
        </span>
      )}
    </div>
  );
}

function getDisplayName(serviceUser: ServiceUser) {
  if (serviceUser.full_name?.trim()) {
    return serviceUser.full_name.trim();
  }

  const composedName = [
    serviceUser.first_name,
    serviceUser.surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composedName || "Service user";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";
}