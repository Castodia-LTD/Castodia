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
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

  /**
   * Navigation links are optional so the shell can also be used
   * for login, password reset and onboarding pages.
   */
  links?: AppShellLink[];

  /**
   * Portal is required only for authenticated portal layouts.
   */
  portal?: AppShellPortal;
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
  manager: "Manager",
  support: "Support Worker",
  platform: "Platform Admin",
};

const portalHomes: Record<AppShellPortal, string> = {
  manager: "/manager/dashboard",
  support: "/support/dashboard",
  platform: "/platform/dashboard",
};

export function AppShell({
  children,
  links = [],
  portal,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] =
    useState<string | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [reportIssueOpen, setReportIssueOpen] =
    useState(false);

  /**
   * The authenticated shell is used only when both a portal and
   * navigation links have been provided.
   */
  const isAuthenticatedShell =
    Boolean(portal) && links.length > 0;

  useEffect(() => {
    if (!isAuthenticatedShell) {
      setName("");
      setRole(null);
      setPhotoUrl(null);
      return;
    }

    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        console.error(
          "Unable to load authenticated user:",
          userError.message
        );
        return;
      }

      if (!user) {
        return;
      }

      const { data: profile, error } =
        await supabase
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

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [isAuthenticatedShell]);

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

    const { error } =
      await supabase.auth.signOut();

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

  const portalHome = portal
    ? portalHomes[portal]
    : "/";

  const portalName = portal
    ? portalNames[portal]
    : "";

  const canSwitchPortal =
    isAuthenticatedShell &&
    portal !== "platform" &&
    role === "manager";

  const canReportIssue =
    isAuthenticatedShell &&
    (portal === "manager" ||
      portal === "support");

  const switchPortalHref =
    portal === "manager"
      ? "/support/dashboard"
      : "/manager/dashboard";

  const switchPortalLabel =
    portal === "manager"
      ? "Switch to Support Portal"
      : "Return to Manager Portal";

  return (
    <div className="flex min-h-dvh w-full bg-[#f7f9fb] text-slate-950">
      {isAuthenticatedShell ? (
        <aside className="sticky top-0 hidden h-dvh w-[290px] shrink-0 border-r border-slate-200 bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7] lg:flex lg:flex-col">
          <div className="shrink-0 px-5 pb-5 pt-7">
            <Link
              href={portalHome}
              className="inline-flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Castodia"
                width={210}
                height={70}
                priority
                className="h-auto w-[210px] object-contain"
              />
            </Link>

            <div className="mt-7 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-teal-500 bg-gradient-to-br from-teal-500 to-cyan-400">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={
                        name
                          ? `${name}'s profile photo`
                          : "Profile photo"
                      }
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-white">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {greeting}
                  </p>

                  <p className="mt-0.5 truncate text-[18px] font-semibold leading-tight text-slate-950">
                    {name || "Welcome"}
                  </p>

                  <p className="mt-1 text-sm font-medium text-teal-600">
                    {portalName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
            <div className="space-y-2">
              {links.map((link) => {
                const Icon =
                  iconMap[link.icon];

                const active =
                  isLinkActive(link);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={[
                      "group flex min-h-14 items-center gap-4 rounded-[18px] px-5",
                      "text-[16px] font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                      active
                        ? [
                            "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce]",
                            "text-white",
                            "shadow-[0_10px_25px_rgba(13,148,136,0.2)]",
                          ].join(" ")
                        : [
                            "text-slate-600",
                            "hover:bg-white/80",
                            "hover:text-slate-950",
                          ].join(" "),
                    ].join(" ")}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.9}
                      className={[
                        "shrink-0",
                        active
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-700",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <span className="min-w-0 truncate">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-slate-200 bg-white/20 px-5 py-5">
            <div className="space-y-2">
              {canSwitchPortal ? (
                <Link
                  href={switchPortalHref}
                  className={[
                    "flex min-h-11 items-center justify-center rounded-2xl",
                    "border border-slate-200 bg-white px-4 py-2.5",
                    "text-center text-sm font-semibold text-teal-700",
                    "shadow-sm transition-colors",
                    "hover:border-teal-200 hover:bg-teal-50",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-teal-500",
                  ].join(" ")}
                >
                  {switchPortalLabel}
                </Link>
              ) : null}

              {canReportIssue ? (
                <button
                  type="button"
                  onClick={() =>
                    setReportIssueOpen(true)
                  }
                  className={[
                    "flex min-h-11 w-full items-center justify-center gap-2",
                    "rounded-2xl border border-teal-200 bg-teal-50",
                    "px-4 py-2.5 text-sm font-semibold text-teal-700",
                    "transition-colors",
                    "hover:border-teal-300 hover:bg-teal-100",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-teal-500",
                  ].join(" ")}
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
                onClick={() =>
                  void handleLogout()
                }
                disabled={loggingOut}
                className={[
                  "flex min-h-12 w-full items-center gap-3 rounded-2xl px-5",
                  "text-[15px] font-medium text-slate-600",
                  "transition-colors",
                  "hover:bg-white hover:text-slate-950",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-teal-500",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                ].join(" ")}
              >
                <LogOut
                  size={21}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />

                {loggingOut
                  ? "Logging out..."
                  : "Log out"}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main
          className={[
            "min-h-0 min-w-0 flex-1 bg-[#fbfcfd]",
            isAuthenticatedShell
              ? "pb-24 lg:pb-0"
              : "",
          ].join(" ")}
        >
          {children}
        </main>
      </div>

      {canReportIssue ? (
        <button
          type="button"
          onClick={() =>
            setReportIssueOpen(true)
          }
          className={[
            "fixed bottom-20 right-4 z-40",
            "inline-flex h-12 items-center gap-2 rounded-full",
            "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce]",
            "px-4 text-sm font-semibold text-white",
            "shadow-[0_10px_25px_rgba(13,148,136,0.25)]",
            "lg:hidden",
          ].join(" ")}
        >
          <Bug
            size={18}
            aria-hidden="true"
          />
          Report issue
        </button>
      ) : null}

      {isAuthenticatedShell ? (
        <nav
          aria-label="Mobile navigation"
          className={[
            "fixed inset-x-0 bottom-0 z-50",
            "border-t border-slate-200 bg-white/95",
            "shadow-[0_-8px_24px_rgba(15,23,42,0.05)]",
            "backdrop-blur lg:hidden",
          ].join(" ")}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))`,
            }}
          >
            {links.map((link) => {
              const Icon =
                iconMap[link.icon];

              const active =
                isLinkActive(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "flex min-w-0 flex-col items-center justify-center",
                    "gap-1 px-1 py-2.5 text-[10px] font-medium",
                    "transition-colors",
                    active
                      ? "text-teal-600"
                      : "text-slate-400 hover:text-slate-700",
                  ].join(" ")}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.9}
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
      ) : null}

      {canReportIssue ? (
        <ReportIssueModal
          open={reportIssueOpen}
          onClose={() =>
            setReportIssueOpen(false)
          }
        />
      ) : null}
    </div>
  );
}