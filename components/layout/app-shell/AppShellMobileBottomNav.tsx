"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { iconMap, MOBILE_NAV_LIMIT } from "./appShellConfig";
import type { AppShellLink } from "./appShellTypes";

type Props = {
  links: AppShellLink[];
  mobileMenuOpen: boolean;
  onOpenMenu: () => void;
  isLinkActive: (link: AppShellLink) => boolean;
};

export function AppShellMobileBottomNav({
  links,
  mobileMenuOpen,
  onOpenMenu,
  isLinkActive,
}: Props) {
  const mobileLinks = links.slice(0, MOBILE_NAV_LIMIT);
  const hasMore = links.length > MOBILE_NAV_LIMIT;
  const hiddenActive = links.slice(MOBILE_NAV_LIMIT).some(isLinkActive);
  const columns = mobileLinks.length + (hasMore ? 1 : 0);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="grid min-h-[66px]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {mobileLinks.map((link) => {
          const Icon = iconMap[link.icon];
          const active = isLinkActive(link);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "relative flex min-w-0 flex-col items-center justify-center",
                "gap-1 px-1 py-2 text-[10px] font-semibold",
                active ? "text-teal-600" : "text-slate-400",
              ].join(" ")}
            >
              {active ? (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-teal-500" />
              ) : null}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.9} aria-hidden="true" />
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}

        {hasMore ? (
          <button
            type="button"
            onClick={onOpenMenu}
            className={[
              "relative flex min-w-0 flex-col items-center justify-center",
              "gap-1 px-1 py-2 text-[10px] font-semibold",
              hiddenActive || mobileMenuOpen ? "text-teal-600" : "text-slate-400",
            ].join(" ")}
          >
            <MoreHorizontal size={21} aria-hidden="true" />
            <span>More</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
