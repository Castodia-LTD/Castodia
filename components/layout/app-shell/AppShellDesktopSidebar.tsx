"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeftRight,
  Bug,
  LogOut,
} from "lucide-react";

import {
  iconMap,
} from "./appShellConfig";

import {
  ProfileAvatar,
} from "./ProfileAvatar";

import type {
  AppShellLink,
} from "./appShellTypes";

type AppShellDesktopSidebarProps = {
  links: AppShellLink[];

  name: string;
  photoUrl: string | null;
  initials: string;

  greeting: string;
  roleLabel: string;
  portalName: string;

  sidebarCollapsed: boolean;
  sidebarPreferenceLoaded: boolean;

  canSwitchPortal: boolean;
  canReportIssue: boolean;

  switchPortalHref: string;
  switchPortalLabel: string;

  loggingOut: boolean;

  onToggleSidebar: () => void;
  onOpenIssue: () => void;
  onLogout: () => void;

  isLinkActive: (
    link: AppShellLink,
  ) => boolean;
};

export function AppShellDesktopSidebar({
  links,
  name,
  photoUrl,
  initials,
  greeting,
  roleLabel,
  portalName,
  sidebarCollapsed,
  sidebarPreferenceLoaded,
  canSwitchPortal,
  canReportIssue,
  switchPortalHref,
  switchPortalLabel,
  loggingOut,
  onToggleSidebar,
  onOpenIssue,
  onLogout,
  isLinkActive,
}: AppShellDesktopSidebarProps) {
  return (
    <aside
      className={[
        "sticky top-0 hidden h-dvh shrink-0 overflow-hidden",
        "border-r border-slate-200",
        "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
        "transition-[width] duration-300 ease-out",
        "lg:flex lg:flex-col",
        sidebarPreferenceLoaded &&
        sidebarCollapsed
          ? "w-[76px]"
          : "w-[270px]",
      ].join(" ")}
    >
      <div
        className={[
          "shrink-0 pb-3 pt-4",
          sidebarCollapsed
            ? "px-2"
            : "px-4",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={
            onToggleSidebar
          }
          aria-label={
            sidebarCollapsed
              ? "Expand navigation menu"
              : "Collapse navigation menu"
          }
          aria-expanded={
            !sidebarCollapsed
          }
          title={
            sidebarCollapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
          className={[
            "flex rounded-xl outline-none transition-all duration-200",
            "hover:bg-white/60",
            "focus-visible:ring-2 focus-visible:ring-teal-500",
            sidebarCollapsed
              ? "mx-auto h-12 w-12 items-center justify-center p-1"
              : "w-full items-center justify-start px-1 py-1",
          ].join(" ")}
        >
          <Image
            src={
              sidebarCollapsed
                ? "/castodia-mark.png"
                : "/logo.png"
            }
            alt=""
            width={
              sidebarCollapsed
                ? 44
                : 185
            }
            height={
              sidebarCollapsed
                ? 44
                : 62
            }
            priority
            className={
              sidebarCollapsed
                ? "h-11 w-11 object-contain"
                : "h-auto w-[185px] object-contain"
            }
          />
        </button>

        <div
          title={
            sidebarCollapsed
              ? `${greeting}, ${
                  name ||
                  "Welcome"
                } — ${roleLabel} — ${portalName}`
              : undefined
          }
          className={[
            "mt-4 border border-slate-200 bg-white",
            "shadow-[0_6px_18px_rgba(15,23,42,0.04)]",
            sidebarCollapsed
              ? "flex justify-center rounded-2xl px-2 py-3"
              : "rounded-[18px] px-3.5 py-3",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              sidebarCollapsed
                ? "justify-center"
                : "gap-3",
            ].join(" ")}
          >
            <ProfileAvatar
              photoUrl={
                photoUrl
              }
              name={name}
              initials={
                initials
              }
              size="large"
            />

            {!sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  {greeting}
                </p>

                <p className="mt-0.5 truncate text-base font-semibold leading-tight text-slate-950">
                  {name ||
                    "Welcome"}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-teal-700">
                  {roleLabel}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {portalName}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className={[
          "min-h-0 flex-1 overflow-y-auto pb-3 pt-1",
          sidebarCollapsed
            ? "px-2"
            : "px-4",
        ].join(" ")}
      >
        <div className="space-y-1">
          {links.map(
            (link) => {
              const Icon =
                iconMap[
                  link.icon
                ];

              const active =
                isLinkActive(
                  link,
                );

              return (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  aria-label={
                    sidebarCollapsed
                      ? link.label
                      : undefined
                  }
                  title={
                    sidebarCollapsed
                      ? link.label
                      : undefined
                  }
                  className={[
                    "group flex min-h-11 rounded-[16px]",
                    "text-[15px] font-medium",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                    sidebarCollapsed
                      ? "items-center justify-center px-2"
                      : "items-center gap-3 px-4",
                    active
                      ? [
                          "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce]",
                          "text-white",
                          "shadow-[0_7px_18px_rgba(13,148,136,0.18)]",
                        ].join(
                          " ",
                        )
                      : [
                          "text-slate-600",
                          "hover:bg-white/80",
                          "hover:text-slate-950",
                        ].join(
                          " ",
                        ),
                  ].join(" ")}
                >
                  <Icon
                    size={20}
                    strokeWidth={
                      1.9
                    }
                    className={[
                      "shrink-0",
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-700",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {!sidebarCollapsed ? (
                    <span className="min-w-0 truncate">
                      {link.label}
                    </span>
                  ) : null}
                </Link>
              );
            },
          )}
        </div>
      </nav>

      <div
        className={[
          "shrink-0 border-t border-slate-200 bg-white/20 py-3",
          sidebarCollapsed
            ? "px-2"
            : "px-4",
        ].join(" ")}
      >
        <div className="space-y-1.5">
          {canSwitchPortal ? (
            <Link
              href={
                switchPortalHref
              }
              aria-label={
                switchPortalLabel
              }
              title={
                sidebarCollapsed
                  ? switchPortalLabel
                  : undefined
              }
              className={[
                "flex min-h-10 items-center rounded-xl",
                "border border-slate-200 bg-white",
                "text-xs font-semibold text-teal-700",
                "shadow-sm transition-colors",
                "hover:border-teal-200 hover:bg-teal-50",
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-center px-3 py-2 text-center",
              ].join(" ")}
            >
              {sidebarCollapsed ? (
                <ArrowLeftRight
                  size={18}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              ) : (
                switchPortalLabel
              )}
            </Link>
          ) : null}

          {canReportIssue ? (
            <button
              type="button"
              onClick={
                onOpenIssue
              }
              className={[
                "flex min-h-10 w-full items-center",
                "rounded-xl border border-teal-200 bg-teal-50",
                "text-xs font-semibold text-teal-700",
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-center gap-2 px-3 py-2",
              ].join(" ")}
            >
              <Bug
                size={16}
                aria-hidden="true"
              />

              {!sidebarCollapsed ? (
                <span>
                  Report an issue
                </span>
              ) : null}
            </button>
          ) : null}

          <button
            type="button"
            onClick={
              onLogout
            }
            disabled={
              loggingOut
            }
            className={[
              "flex min-h-10 w-full items-center rounded-xl",
              "text-sm font-medium text-slate-600",
              "hover:bg-white hover:text-slate-950",
              "disabled:opacity-60",
              sidebarCollapsed
                ? "justify-center px-2"
                : "gap-3 px-4",
            ].join(" ")}
          >
            <LogOut
              size={19}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            {!sidebarCollapsed ? (
              <span>
                {loggingOut
                  ? "Logging out..."
                  : "Log out"}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </aside>
  );
}