"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CastodiaCard } from "@/components/castodia";
import { createClient } from "@/lib/supabase/client";
import { ExpandableProfilePhoto } from "@/components/shared/ExpandableProfilePhoto";

const PHOTO_BUCKET = "service-user-photos";

type ServiceUserOption = {
  id: string;
  full_name: string;
};

type Portal = "manager" | "support";

type HubTab = {
  label: string;
  path: string;
  managerOnly?: boolean;
};

type Props = {
  id: string;
  fullName: string;
  houseName: string | null;
  dob: string | null;
  photoPath: string | null;
  portal?: Portal;
  serviceUsers?: ServiceUserOption[];
  onServiceUserChange?: (id: string) => void;
};

const tabs: HubTab[] = [
  { label: "Medication", path: "medication" },
  { label: "Care Plans", path: "care-plans" },
  { label: "Risk Register", path: "risk-assessments" },
  { label: "Body Maps", path: "body-maps" },
  { label: "Memories", path: "memories" },
  { label: "Incident Review", path: "reviews", managerOnly: true },
  { label: "Wellbeing Indicators", path: "wellbeing-indicators", managerOnly: true },
];

export default function ServiceUserHubHeader({
  id,
  fullName,
  houseName,
  dob,
  photoPath,
  portal = "manager",
  serviceUsers = [],
  onServiceUserChange,
}: Props) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(Boolean(photoPath));

  const basePath = `/${portal}/service-users/${id}`;
  const aboutMeHref = `${basePath}/about-me`;
  const editHref = `${basePath}/edit`;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAboutMeActive =
    pathname === aboutMeHref ||
    pathname.startsWith(`${aboutMeHref}/`);

  const isEditActive =
    pathname === editHref ||
    pathname.startsWith(`${editHref}/`);

  const visibleTabs = tabs.filter(
    (tab) => !tab.managerOnly || portal === "manager",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProfilePhoto() {
      if (!photoPath) {
        setPhotoUrl(null);
        setPhotoLoading(false);
        return;
      }

      setPhotoLoading(true);

      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photoPath, 60 * 60);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Unable to load service user profile photo:", {
          message: error.message,
          name: error.name,
          photoPath,
          serviceUserId: id,
        });

        setPhotoUrl(null);
        setPhotoLoading(false);
        return;
      }

      setPhotoUrl(data.signedUrl);
      setPhotoLoading(false);
    }

    void loadProfilePhoto();

    return () => {
      cancelled = true;
    };
  }, [id, photoPath, supabase]);

  return (
    <div className="w-full">
      <CastodiaCard>
        <div className="space-y-4">
          {serviceUsers.length > 0 ? (
            <div className="max-w-sm">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Service user
              </label>

              <select
                value={id}
                onChange={(event) =>
                  onServiceUserChange?.(event.target.value)
                }
                className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                {serviceUsers.map((serviceUser) => (
                  <option
                    key={serviceUser.id}
                    value={serviceUser.id}
                  >
                    {serviceUser.full_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="rounded-2xl bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col items-center text-center gap-4">              <div className="flex min-w-0 items-center gap-4">
                <ExpandableProfilePhoto
  src={photoUrl ?? ""}
  alt={fullName}
  initials={initials}
  isLoading={photoLoading}
  sizeClassName="h-20 w-20"
/>

                <div className="min-w-0">
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {fullName}
                  </h1>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                      {houseName || "No house assigned"}
                    </span>

                    {dob ? (
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                        DOB:{" "}
                        {new Date(dob).toLocaleDateString("en-GB")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href={aboutMeHref}
                  className={
                    isAboutMeActive
                      ? "rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sm"
                      : "rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm transition hover:bg-cyan-50"
                  }
                >
                  About Me
                </Link>

                {portal === "manager" ? (
                  <Link
                    href={editHref}
                    className={
                      isEditActive
                        ? "rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sm"
                        : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                    }
                  >
                    Edit Service User
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

         <nav
  aria-label="Service user sections"
  className="flex flex-wrap justify-center gap-2"
>
            {visibleTabs.map((tab) => {
              const href = `${basePath}/${tab.path}`;

              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={tab.path}
                  href={href}
                  className={
                    isActive
                      ? "rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sm"
                      : "rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </CastodiaCard>
    </div>
  );
}