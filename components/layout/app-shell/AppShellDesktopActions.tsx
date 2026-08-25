"use client";

import Link from "next/link";
import { ArrowLeftRight, Bug, LogOut } from "lucide-react";

type Props = {
  collapsed: boolean;
  canSwitchPortal: boolean;
  canReportIssue: boolean;
  switchPortalHref: string;
  switchPortalLabel: string;
  loggingOut: boolean;
  onOpenIssue: () => void;
  onLogout: () => void;
};

export function AppShellDesktopActions({
  collapsed,
  canSwitchPortal,
  canReportIssue,
  switchPortalHref,
  switchPortalLabel,
  loggingOut,
  onOpenIssue,
  onLogout,
}: Props) {
  return (
    <div
      className={[
        "shrink-0 border-t border-slate-200 bg-white/20 py-3",
        collapsed ? "px-2" : "px-4",
      ].join(" ")}
    >
      <div className="space-y-1.5">
        {canSwitchPortal ? (
          <Link
            href={switchPortalHref}
            aria-label={switchPortalLabel}
            title={collapsed ? switchPortalLabel : undefined}
            className={[
              "flex min-h-10 items-center rounded-xl border border-slate-200 bg-white",
              "text-xs font-semibold text-teal-700 shadow-sm transition-colors",
              "hover:border-teal-200 hover:bg-teal-50",
              collapsed ? "justify-center px-2" : "justify-center px-3 py-2 text-center",
            ].join(" ")}
          >
            {collapsed ? (
              <ArrowLeftRight size={18} strokeWidth={1.9} aria-hidden="true" />
            ) : (
              switchPortalLabel
            )}
          </Link>
        ) : null}

        {canReportIssue ? (
          <button
            type="button"
            onClick={onOpenIssue}
            className={[
              "flex min-h-10 w-full items-center rounded-xl border border-teal-200 bg-teal-50",
              "text-xs font-semibold text-teal-700",
              collapsed ? "justify-center px-2" : "justify-center gap-2 px-3 py-2",
            ].join(" ")}
          >
            <Bug size={16} aria-hidden="true" />
            {!collapsed ? <span>Report an issue</span> : null}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className={[
            "flex min-h-10 w-full items-center rounded-xl text-sm font-medium text-slate-600",
            "hover:bg-white hover:text-slate-950 disabled:opacity-60",
            collapsed ? "justify-center px-2" : "gap-3 px-4",
          ].join(" ")}
        >
          <LogOut size={19} strokeWidth={1.9} aria-hidden="true" />
          {!collapsed ? <span>{loggingOut ? "Logging out..." : "Log out"}</span> : null}
        </button>
      </div>
    </div>
  );
}
