"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Bug,
  CalendarDays,
  ClipboardList,
  Clock3,
  Gauge,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  UserRound,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ReportIssueModal } from "@/components/issues/ReportIssueModal";
import { supabase } from "@/lib/supabase";

export type AppShellIcon =
  | "dashboard"
  | "home"
  | "calendar"
  | "service-users"
  | "staff"
  | "emar"
  | "safeguarding"
  | "compliance"
  | "settings"
  | "timelines"
  | "handovers"
  | "organisations"
  | "issues"
  | "admin-users";

export type AppShellLink = {
  href: string;
  label: string;
  icon: AppShellIcon;
  exact?: boolean;
};

export type AppShellPortal =
  | "manager"
  | "support"
  | "platform";

type AppShellProps = {
  children: ReactNode;
  links: AppShellLink[];
  portal: AppShellPortal;
};

const iconMap: Record<AppShellIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  home: Home,
  calendar: CalendarDays,
  "service-users": UserRound,
  staff: Users,
  emar: Pill,
  safeguarding: HeartPulse,
  compliance: BarChart3,
  settings: Settings,
  timelines: Clock3,
  handovers: ClipboardList,
  organisations: Building2,
  issues: Bug,
  "admin-users": Users,
};

const portalNames: Record<AppShellPortal, string> = {
  manager: "Manager Portal",
  support: "Support Portal",
  platform: "Platform Admin",
};

const portalHomes: Record<AppShellPortal, string> = {
  manager: "/manager/dashboard",
  support: "/support/dashboard",
  platform: "/platform/dashboard",
};

export function AppShell({
  children,
  links,
  portal,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] =
    useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role, photo_url")
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Unable to load profile:",
          error.message
        );
        return;
      }

      setName(profile?.full_name ?? "");
      setRole(profile?.role ?? null);
      setPhotoUrl(profile?.photo_url ?? null);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  const initials = useMemo(() => {
    if (!name.trim()) {
      return "?";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }, [name]);

  function isLinkActive(link: AppShellLink) {
    if (link.exact) {
      return pathname === link.href;
    }

    return (
      pathname === link.href ||
      pathname.startsWith(`${link.href}/`)
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Unable to log out:",
        error.message
      );
      setLoggingOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  const portalHome = portalHomes[portal];
  const portalName = portalNames[portal];

  const canSwitchPortal =
    portal !== "platform" && role === "manager";

  const canReportIssue =
    portal === "manager" || portal === "support";

  const switchPortalHref =
    portal === "manager"
      ? "/support/dashboard"
      : "/manager/dashboard";

  const switchPortalLabel =
    portal === "manager"
      ? "Switch to Support Portal"
      : "Return to Manager Portal";

  return (
    <div className="flex min-h-dvh w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-white/10 bg-slate-950/75 backdrop-blur lg:flex lg:flex-col">
        <div className="shrink-0 px-5 pb-4 pt-6">
          <Link
            href={portalHome}
            className="inline-flex"
          >
            <Image
              src="/logo.png"
              alt="Castodia"
              width={190}
              height={60}
              priority
            />
          </Link>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-blue-500 to-teal-400">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={
                      name
                        ? `${name}'s profile photo`
                        : "Profile photo"
                    }
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">
                  {greeting}
                </p>

                <p className="mt-0.5 truncate text-base font-semibold text-white">
                  {name || "Welcome"}
                </p>

                <p className="mt-0.5 text-xs text-cyan-300">
                  {portalName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {links.map((link) => {
            const Icon = iconMap[link.icon];
            const active = isLinkActive(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={[
                  "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3",
                  "text-sm font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-cyan-400",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span className="min-w-0 truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-white/10 p-5">
          {canSwitchPortal ? (
            <Link
              href={switchPortalHref}
              className={[
                "flex min-h-11 items-center justify-center rounded-2xl",
                "border border-white/10 bg-white/[0.06] px-4 py-3",
                "text-center text-sm font-semibold text-cyan-200",
                "transition-colors hover:bg-white/10 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-cyan-400",
              ].join(" ")}
            >
              {switchPortalLabel}
            </Link>
          ) : null}

          {canReportIssue ? (
            <button
              type="button"
              onClick={() => setReportIssueOpen(true)}
              className={[
                "flex min-h-11 w-full items-center justify-center gap-2",
                "rounded-2xl border border-cyan-400/20",
                "bg-cyan-400/10 px-4 py-3 text-sm font-semibold",
                "text-cyan-200 transition-colors",
                "hover:bg-cyan-400/20 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-cyan-400",
              ].join(" ")}
            >
              <Bug size={17} aria-hidden="true" />
              Report an issue
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={[
              "flex min-h-11 w-full items-center justify-center gap-2",
              "rounded-2xl px-4 py-3 text-sm font-semibold",
              "text-slate-300 transition-colors",
              "hover:bg-red-500/10 hover:text-red-200",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-red-400",
              "disabled:cursor-not-allowed disabled:opacity-60",
            ].join(" ")}
          >
            <LogOut
              size={17}
              aria-hidden="true"
            />

            {loggingOut
              ? "Logging out..."
              : "Log out"}
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main className="min-h-0 min-w-0 flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {canReportIssue ? (
        <button
          type="button"
          onClick={() => setReportIssueOpen(true)}
          className="fixed bottom-20 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 px-4 text-sm font-semibold text-white shadow-lg lg:hidden"
        >
          <Bug size={18} aria-hidden="true" />
          Report issue
        </button>
      ) : null}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur lg:hidden"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))`,
          }}
        >
          {links.map((link) => {
            const Icon = iconMap[link.icon];
            const active = isLinkActive(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={[
                  "flex min-w-0 flex-col items-center justify-center",
                  "gap-1 px-1 py-2 text-[10px] font-medium",
                  "transition-colors",
                  active
                    ? "text-cyan-300"
                    : "text-slate-400 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span className="max-w-full truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ReportIssueModal
        open={reportIssueOpen}
        onClose={() => setReportIssueOpen(false)}
      />
    </div>
  );
}