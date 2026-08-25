"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Bug,
  ChevronRight,
  LogOut,
  Menu,
  MoreHorizontal,
  X,
} from "lucide-react";

import {
  iconMap,
  MOBILE_NAV_LIMIT,
} from "./appShellConfig";

import {
  ProfileAvatar,
} from "./ProfileAvatar";

import type {
  AppShellLink,
} from "./appShellTypes";

type AppShellMobileProps = {
  links: AppShellLink[];

  portalHome: string;
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
  switchPortalShortLabel: string;

  loggingOut: boolean;
  mobileMenuOpen: boolean;

  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onOpenIssue: () => void;
  onLogout: () => void;

  isLinkActive: (
    link: AppShellLink,
  ) => boolean;
};

export function AppShellMobile({
  links,
  portalHome,
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
  switchPortalShortLabel,
  loggingOut,
  mobileMenuOpen,
  onOpenMenu,
  onCloseMenu,
  onOpenIssue,
  onLogout,
  isLinkActive,
}: AppShellMobileProps) {
  const mobileLinks =
    links.slice(
      0,
      MOBILE_NAV_LIMIT,
    );

  const hasAdditionalMobileLinks =
    links.length >
    MOBILE_NAV_LIMIT;

  const hiddenMobileLinksAreActive =
    links
      .slice(
        MOBILE_NAV_LIMIT,
      )
      .some(isLinkActive);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 border-b border-slate-200/80",
          "bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
          "backdrop-blur-xl lg:hidden",
        ].join(" ")}
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
        }}
      >
        <div className="px-4 pb-3 pt-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={
                portalHome
              }
              aria-label="Castodia home"
            >
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
                  href={
                    switchPortalHref
                  }
                  className={[
                    "hidden min-h-10 items-center rounded-xl",
                    "border border-teal-200 bg-teal-50 px-3",
                    "text-xs font-semibold text-teal-700",
                    "min-[390px]:inline-flex",
                  ].join(" ")}
                >
                  {
                    switchPortalShortLabel
                  }
                </Link>
              ) : null}

              <button
                type="button"
                onClick={
                  onOpenMenu
                }
                aria-label="Open navigation menu"
                className={[
                  "inline-flex h-11 w-11 items-center justify-center",
                  "rounded-2xl border border-slate-200 bg-white",
                  "text-slate-700 shadow-sm",
                ].join(" ")}
              >
                <Menu
                  size={22}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/80 bg-gradient-to-r from-white to-teal-50/60 px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <ProfileAvatar
                photoUrl={
                  photoUrl
                }
                name={name}
                initials={
                  initials
                }
                size="small"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {greeting}
                  {name
                    ? `, ${
                        name.split(
                          /\s+/,
                        )[0]
                      }`
                    : ""}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-teal-700">
                  {roleLabel}
                </p>

                <p className="text-[11px] text-slate-400">
                  {portalName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {canReportIssue ? (
        <button
          type="button"
          onClick={
            onOpenIssue
          }
          className={[
            "fixed right-4 z-30",
            "inline-flex h-11 items-center gap-2 rounded-full",
            "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce]",
            "px-4 text-sm font-semibold text-white",
            "shadow-[0_10px_25px_rgba(13,148,136,0.25)]",
            "lg:hidden",
          ].join(" ")}
          style={{
            bottom:
              "calc(76px + env(safe-area-inset-bottom))",
          }}
        >
          <Bug
            size={17}
            aria-hidden="true"
          />

          <span className="hidden min-[390px]:inline">
            Report issue
          </span>
        </button>
      ) : null}

      <nav
        aria-label="Mobile navigation"
        className={[
          "fixed inset-x-0 bottom-0 z-40",
          "border-t border-slate-200 bg-white/95",
          "shadow-[0_-8px_24px_rgba(15,23,42,0.06)]",
          "backdrop-blur-xl lg:hidden",
        ].join(" ")}
        style={{
          paddingBottom:
            "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="grid min-h-[66px]"
          style={{
            gridTemplateColumns: `repeat(${
              mobileLinks.length +
              (
                hasAdditionalMobileLinks
                  ? 1
                  : 0
              )
            }, minmax(0, 1fr))`,
          }}
        >
          {mobileLinks.map(
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
                  className={[
                    "relative flex min-w-0 flex-col items-center justify-center",
                    "gap-1 px-1 py-2 text-[10px] font-semibold",
                    active
                      ? "text-teal-600"
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {active ? (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-teal-500" />
                  ) : null}

                  <Icon
                    size={20}
                    strokeWidth={
                      active
                        ? 2.2
                        : 1.9
                    }
                    aria-hidden="true"
                  />

                  <span className="max-w-full truncate">
                    {
                      link.label
                    }
                  </span>
                </Link>
              );
            },
          )}

          {hasAdditionalMobileLinks ? (
            <button
              type="button"
              onClick={
                onOpenMenu
              }
              className={[
                "relative flex min-w-0 flex-col items-center justify-center",
                "gap-1 px-1 py-2 text-[10px] font-semibold",
                hiddenMobileLinksAreActive ||
                mobileMenuOpen
                  ? "text-teal-600"
                  : "text-slate-400",
              ].join(" ")}
            >
              <MoreHorizontal
                size={21}
                aria-hidden="true"
              />

              <span>
                More
              </span>
            </button>
          ) : null}
        </div>
      </nav>

      <div
        className={[
          "fixed inset-0 z-[70] lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto"
            : "pointer-events-none",
        ].join(" ")}
        aria-hidden={
          !mobileMenuOpen
        }
      >
        <button
          type="button"
          onClick={
            onCloseMenu
          }
          aria-label="Close navigation menu"
          className={[
            "absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]",
            mobileMenuOpen
              ? "opacity-100"
              : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute bottom-0 right-0 top-0",
            "flex w-[min(88vw,380px)] flex-col",
            "border-l border-slate-200",
            "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
            "transition-transform duration-300",
            mobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full",
          ].join(" ")}
          style={{
            paddingTop:
              "env(safe-area-inset-top)",
            paddingBottom:
              "env(safe-area-inset-bottom)",
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
                onClick={
                  onCloseMenu
                }
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
              >
                <X
                  size={21}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-3.5 py-3">
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

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {greeting}
                </p>

                <p className="truncate font-semibold text-slate-950">
                  {name ||
                    "Welcome"}
                </p>

                <p className="text-xs font-semibold text-teal-700">
                  {roleLabel}
                </p>

                <p className="text-[11px] text-slate-400">
                  {portalName}
                </p>
              </div>
            </div>

            {canSwitchPortal ? (
              <Link
                href={
                  switchPortalHref
                }
                className="mt-3 flex min-h-10 items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 text-xs font-semibold text-teal-700"
              >
                {
                  switchPortalLabel
                }

                <ChevronRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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
                      className={[
                        "flex min-h-11 items-center gap-3 rounded-[16px] px-4 py-2",
                        active
                          ? "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] text-white"
                          : "text-slate-600",
                      ].join(" ")}
                    >
                      <Icon
                        size={20}
                        aria-hidden="true"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {
                          link.label
                        }
                      </span>
                    </Link>
                  );
                },
              )}
            </div>
          </nav>

          <div className="border-t border-slate-200 px-4 py-3">
            {canReportIssue ? (
              <button
                type="button"
                onClick={
                  onOpenIssue
                }
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-700"
              >
                <Bug
                  size={17}
                  aria-hidden="true"
                />

                Report an issue
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
              className="mt-1.5 flex min-h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-600"
            >
              <LogOut
                size={19}
                aria-hidden="true"
              />

              {loggingOut
                ? "Logging out..."
                : "Log out"}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}