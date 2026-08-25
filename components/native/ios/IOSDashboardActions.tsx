"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  Bug,
  LogOut,
} from "lucide-react";

type IOSDashboardActionsProps = {
  canSwitchPortal: boolean;
  canReportIssue: boolean;

  switchPortalHref: string;
  switchPortalLabel: string;

  loggingOut: boolean;

  onOpenIssue: () => void;
  onLogout: () => void;
};

export function IOSDashboardActions({
  canSwitchPortal,
  canReportIssue,
  switchPortalHref,
  switchPortalLabel,
  loggingOut,
  onOpenIssue,
  onLogout,
}: IOSDashboardActionsProps) {
  return (
    <div className="grid gap-3 px-4 pb-5 sm:grid-cols-2">
      {canSwitchPortal ? (
        <Link
          href={switchPortalHref}
          className={[
            "flex min-h-12 items-center justify-center gap-2",
            "rounded-2xl",
            "border border-teal-200",
            "bg-teal-50",
            "px-4",
            "text-sm font-semibold text-teal-700",
            "shadow-sm",
            "transition active:scale-[0.985]",
          ].join(" ")}
        >
          <ArrowLeftRight
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          {switchPortalLabel}
        </Link>
      ) : null}

      {canReportIssue ? (
        <button
          type="button"
          onClick={onOpenIssue}
          className={[
            "flex min-h-12 items-center justify-center gap-2",
            "rounded-2xl",
            "border border-slate-200",
            "bg-white",
            "px-4",
            "text-sm font-semibold text-slate-700",
            "shadow-sm",
            "transition active:scale-[0.985]",
          ].join(" ")}
        >
          <Bug
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          Report an issue
        </button>
      ) : null}

      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className={[
          "flex min-h-12 items-center justify-center gap-2",
          "rounded-2xl",
          "border border-slate-200",
          "bg-white",
          "px-4",
          "text-sm font-semibold text-slate-600",
          "shadow-sm",
          "transition active:scale-[0.985]",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",
          canSwitchPortal || canReportIssue
            ? "sm:col-span-2"
            : "",
        ].join(" ")}
      >
        <LogOut
          size={18}
          strokeWidth={1.9}
          aria-hidden="true"
        />

        {loggingOut
          ? "Logging out..."
          : "Log out"}
      </button>
    </div>
  );
}