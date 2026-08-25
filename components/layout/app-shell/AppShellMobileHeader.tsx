"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { ProfileAvatar } from "./ProfileAvatar";

type Props = {
  portalHome: string;
  portalName: string;
  name: string;
  photoUrl: string | null;
  initials: string;
  greeting: string;
  roleLabel: string;
  canSwitchPortal: boolean;
  switchPortalHref: string;
  switchPortalShortLabel: string;
  onOpenMenu: () => void;
};

export function AppShellMobileHeader({
  portalHome,
  portalName,
  name,
  photoUrl,
  initials,
  greeting,
  roleLabel,
  canSwitchPortal,
  switchPortalHref,
  switchPortalShortLabel,
  onOpenMenu,
}: Props) {
  const firstName = name.split(/\s+/)[0] ?? "";

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-4 pb-3 pt-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <Link href={portalHome} aria-label="Castodia home">
            <Image
              src="/logo.png"
              alt="Castodia"
              width={150}
              height={50}
              priority
              className="h-auto w-[136px] object-contain sm:w-[150px]"
            />
          </Link>

          <div className="flex items-center gap-2">
            {canSwitchPortal ? (
              <Link
                href={switchPortalHref}
                className="hidden min-h-10 items-center rounded-xl border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-700 min-[390px]:inline-flex"
              >
                {switchPortalShortLabel}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/80 bg-gradient-to-r from-white to-teal-50/60 px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar
              photoUrl={photoUrl}
              name={name}
              initials={initials}
              size="small"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {greeting}{firstName ? `, ${firstName}` : ""}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-teal-700">
                {roleLabel}
              </p>
              <p className="text-[11px] text-slate-400">{portalName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
