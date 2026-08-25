"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { IOSDashboardActions } from "./IOSDashboardActions";
import { IOSNavigationControls } from "./IOSNavigationControls";

type IOSAppShellProps = {
  children: ReactNode;

  portalHome: string;
  portalName: string;

  isDashboard: boolean;

  canSwitchPortal: boolean;
  canReportIssue: boolean;

  switchPortalHref: string;
  switchPortalLabel: string;

  loggingOut: boolean;

  onOpenIssue: () => void;
  onLogout: () => void;
};

export function IOSAppShell({
  children,
  portalHome,
  portalName,
  isDashboard,
  canSwitchPortal,
  canReportIssue,
  switchPortalHref,
  switchPortalLabel,
  loggingOut,
  onOpenIssue,
  onLogout,
}: IOSAppShellProps) {
  const isSupportPortal =
    portalName === "Support Portal";

  const isManagerPortal =
    portalName === "Manager Portal";

  const logoSrc =
    isSupportPortal
      ? "/CastodiaSupport.png"
      : isManagerPortal
        ? "/CastodiaManager.png"
        : "/logo.png";

  const logoAlt =
    isSupportPortal
      ? "Castodia Support"
      : isManagerPortal
        ? "Castodia Manager"
        : "Castodia";

  const logoWidth =
    isSupportPortal ||
    isManagerPortal
      ? "w-[165px]"
      : "w-[118px]";

  return (
    <div className="min-h-dvh bg-[#f5f8f9] text-slate-950">
      <header
        className={[
          "sticky top-0 z-50",
          "border-b border-slate-200/80",
          "bg-white/95 backdrop-blur-xl",
          "px-4 pb-3",
          "pt-[calc(12px+env(safe-area-inset-top))]",
        ].join(" ")}
      >
        <div className="flex min-h-11 items-center gap-3">
          {!isDashboard ? (
            <IOSNavigationControls
              portalHome={portalHome}
            />
          ) : null}

          <Image
            src={logoSrc}
            alt={logoAlt}
            width={220}
            height={80}
            priority
            className={[
              "h-auto object-contain",
              logoWidth,
            ].join(" ")}
          />
        </div>
      </header>

      <main className="min-h-0">
        {children}

        {isDashboard ? (
          <IOSDashboardActions
            canSwitchPortal={canSwitchPortal}
            canReportIssue={canReportIssue}
            switchPortalHref={switchPortalHref}
            switchPortalLabel={switchPortalLabel}
            loggingOut={loggingOut}
            onOpenIssue={onOpenIssue}
            onLogout={onLogout}
          />
        ) : null}
      </main>
    </div>
  );
}