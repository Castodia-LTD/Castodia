"use client";

import Link from "next/link";

import { iconMap } from "./appShellConfig";
import type { AppShellLink } from "./appShellTypes";

type Props = {
  links: AppShellLink[];
  collapsed: boolean;
  isLinkActive: (link: AppShellLink) => boolean;
};

export function AppShellDesktopNav({ links, collapsed, isLinkActive }: Props) {
  return (
    <nav
      aria-label="Main navigation"
      className={[
        "min-h-0 flex-1 overflow-y-auto pb-3 pt-1",
        collapsed ? "px-2" : "px-4",
      ].join(" ")}
    >
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          const active = isLinkActive(link);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? link.label : undefined}
              title={collapsed ? link.label : undefined}
              className={[
                "group flex min-h-11 rounded-[16px] text-[15px] font-medium",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                collapsed ? "items-center justify-center px-2" : "items-center gap-3 px-4",
                active
                  ? "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] text-white shadow-[0_7px_18px_rgba(13,148,136,0.18)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
              ].join(" ")}
            >
              <Icon
                size={20}
                strokeWidth={1.9}
                className={active ? "shrink-0 text-white" : "shrink-0 text-slate-500 group-hover:text-slate-700"}
                aria-hidden="true"
              />
              {!collapsed ? <span className="min-w-0 truncate">{link.label}</span> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
