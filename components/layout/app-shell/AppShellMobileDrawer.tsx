"use client";

import Image from "next/image";
import Link from "next/link";
import { Bug, ChevronRight, LogOut, X } from "lucide-react";

import { iconMap } from "./appShellConfig";
import { ProfileAvatar } from "./ProfileAvatar";
import type { AppShellLink } from "./appShellTypes";

type Props = {
  links: AppShellLink[];
  open: boolean;
  portalName: string;
  name: string;
  photoUrl: string | null;
  initials: string;
  greeting: string;
  roleLabel: string;
  canSwitchPortal: boolean;
  canReportIssue: boolean;
  switchPortalHref: string;
  switchPortalLabel: string;
  loggingOut: boolean;
  onClose: () => void;
  onOpenIssue: () => void;
  onLogout: () => void;
  isLinkActive: (link: AppShellLink) => boolean;
};

export function AppShellMobileDrawer({
  links,
  open,
  portalName,
  name,
  photoUrl,
  initials,
  greeting,
  roleLabel,
  canSwitchPortal,
  canReportIssue,
  switchPortalHref,
  switchPortalLabel,
  loggingOut,
  onClose,
  onOpenIssue,
  onLogout,
  isLinkActive,
}: Props) {
  return (
    <div
      className={[
        "fixed inset-0 z-[70] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className={[
          "absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "absolute bottom-0 right-0 top-0 flex w-[min(88vw,380px)] flex-col",
          "border-l border-slate-200",
          "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="border-b border-slate-200/80 px-5 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <Image
              src="/logo.png"
              alt="Castodia"
              width={145}
              height={48}
              className="h-auto w-[140px]"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
            >
              <X size={21} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-3.5 py-3">
            <ProfileAvatar
              photoUrl={photoUrl}
              name={name}
              initials={initials}
              size="large"
            />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{greeting}</p>
              <p className="truncate font-semibold text-slate-950">
                {name || "Welcome"}
              </p>
              <p className="text-xs font-semibold text-teal-700">{roleLabel}</p>
              <p className="text-[11px] text-slate-400">{portalName}</p>
            </div>
          </div>

          {canSwitchPortal ? (
            <Link
              href={switchPortalHref}
              className="mt-3 flex min-h-10 items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 text-xs font-semibold text-teal-700"
            >
              {switchPortalLabel}
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = iconMap[link.icon];
              const active = isLinkActive(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "flex min-h-11 items-center gap-3 rounded-[16px] px-4 py-2",
                    active
                      ? "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] text-white"
                      : "text-slate-600",
                  ].join(" ")}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 px-4 py-3">
          {canReportIssue ? (
            <button
              type="button"
              onClick={onOpenIssue}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-700"
            >
              <Bug size={17} aria-hidden="true" />
              Report an issue
            </button>
          ) : null}

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="mt-1.5 flex min-h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-600"
          >
            <LogOut size={19} aria-hidden="true" />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>
    </div>
  );
}
