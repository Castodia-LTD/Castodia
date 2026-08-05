"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bug,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Pill,
  Settings,
  UserRound,
  Users,
  X,
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

/**
 * Keep the mobile footer deliberately small.
 * Any remaining links are still available in the mobile drawer.
 */
const MOBILE_NAV_LIMIT = 4;

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

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

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

  /**
   * Close the drawer whenever navigation completes.
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /**
   * Prevent the page behind the mobile drawer from scrolling.
   */
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

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

    setMobileMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  function handleOpenIssueModal() {
    setMobileMenuOpen(false);
    setReportIssueOpen(true);
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

  const switchPortalShortLabel =
    portal === "manager"
      ? "Switch to Support"
      : "Return to Manager";

  const mobileLinks = links.slice(
    0,
    MOBILE_NAV_LIMIT
  );

  const hasAdditionalMobileLinks =
    links.length > MOBILE_NAV_LIMIT;

  const hiddenMobileLinksAreActive =
    links
      .slice(MOBILE_NAV_LIMIT)
      .some(isLinkActive);

  return (
    <div className="flex min-h-dvh w-full bg-[#f7f9fb] text-slate-950">
      {/* Desktop sidebar */}
      {isAuthenticatedShell ? (
        <aside
          className={[
            "sticky top-0 hidden h-dvh w-[290px] shrink-0",
            "border-r border-slate-200",
            "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
            "lg:flex lg:flex-col",
          ].join(" ")}
        >
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

            <div
              className={[
                "mt-7 rounded-[20px] border border-slate-200",
                "bg-white px-4 py-4",
                "shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  photoUrl={photoUrl}
                  name={name}
                  initials={initials}
                  size="large"
                />

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
                const Icon = iconMap[link.icon];
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
        {/* Mobile header */}
        {isAuthenticatedShell ? (
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
                  href={portalHome}
                  className="min-w-0 shrink"
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

                <div className="flex shrink-0 items-center gap-2">
                  {canSwitchPortal ? (
                    <Link
                      href={switchPortalHref}
                      className={[
                        "hidden min-h-10 items-center rounded-xl",
                        "border border-teal-200 bg-teal-50 px-3",
                        "text-xs font-semibold text-teal-700",
                        "transition-colors hover:bg-teal-100",
                        "min-[390px]:inline-flex",
                      ].join(" ")}
                    >
                      {switchPortalShortLabel}
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      setMobileMenuOpen(true)
                    }
                    aria-label="Open navigation menu"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-app-menu"
                    className={[
                      "inline-flex h-11 w-11 items-center justify-center",
                      "rounded-2xl border border-slate-200 bg-white",
                      "text-slate-700 shadow-sm",
                      "transition-colors hover:bg-slate-50",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-teal-500",
                    ].join(" ")}
                  >
                    <Menu
                      size={22}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <div
                className={[
                  "mt-3 flex items-center justify-between gap-3",
                  "rounded-[18px] border border-slate-200/80",
                  "bg-gradient-to-r from-white to-teal-50/60",
                  "px-3 py-3",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar
                    photoUrl={photoUrl}
                    name={name}
                    initials={initials}
                    size="small"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {greeting}
                      {name
                        ? `, ${name.split(/\s+/)[0]}`
                        : ""}
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-teal-600">
                      {portalName} Portal
                    </p>
                  </div>
                </div>

                {canSwitchPortal ? (
                  <Link
                    href={switchPortalHref}
                    aria-label={switchPortalLabel}
                    className={[
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center",
                      "rounded-xl border border-teal-200 bg-white",
                      "text-teal-700 shadow-sm",
                      "min-[390px]:hidden",
                    ].join(" ")}
                  >
                    <ChevronRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>
                ) : null}
              </div>
            </div>
          </header>
        ) : null}

        <main
          className={[
            "min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[#fbfcfd]",
            isAuthenticatedShell
              ? "pb-[calc(82px+env(safe-area-inset-bottom))] lg:pb-0"
              : "",
          ].join(" ")}
        >
          {children}
        </main>
      </div>

      {/* Mobile report issue button */}
      {canReportIssue ? (
        <button
          type="button"
          onClick={() =>
            setReportIssueOpen(true)
          }
          className={[
            "fixed right-4 z-30",
            "inline-flex h-11 items-center gap-2 rounded-full",
            "bg-gradient-to-r from-[#079c9c] to-[#6ed6ce]",
            "px-4 text-sm font-semibold text-white",
            "shadow-[0_10px_25px_rgba(13,148,136,0.25)]",
            "transition-transform active:scale-[0.98]",
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

      {/* Mobile bottom navigation */}
      {isAuthenticatedShell ? (
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
                (hasAdditionalMobileLinks
                  ? 1
                  : 0)
              }, minmax(0, 1fr))`,
            }}
          >
            {mobileLinks.map((link) => {
              const Icon = iconMap[link.icon];
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
                    "relative flex min-w-0 flex-col items-center justify-center",
                    "gap-1 px-1 py-2 text-[10px] font-semibold",
                    "transition-colors",
                    active
                      ? "text-teal-600"
                      : "text-slate-400 hover:text-slate-700",
                  ].join(" ")}
                >
                  {active ? (
                    <span
                      className={[
                        "absolute inset-x-3 top-0 h-0.5",
                        "rounded-full bg-teal-500",
                      ].join(" ")}
                    />
                  ) : null}

                  <Icon
                    size={20}
                    strokeWidth={
                      active ? 2.2 : 1.9
                    }
                    className="shrink-0"
                    aria-hidden="true"
                  />

                  <span className="max-w-full truncate px-0.5">
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {hasAdditionalMobileLinks ? (
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                aria-label="Open more navigation options"
                className={[
                  "relative flex min-w-0 flex-col items-center justify-center",
                  "gap-1 px-1 py-2 text-[10px] font-semibold",
                  "transition-colors",
                  hiddenMobileLinksAreActive ||
                  mobileMenuOpen
                    ? "text-teal-600"
                    : "text-slate-400 hover:text-slate-700",
                ].join(" ")}
              >
                {hiddenMobileLinksAreActive ||
                mobileMenuOpen ? (
                  <span
                    className={[
                      "absolute inset-x-3 top-0 h-0.5",
                      "rounded-full bg-teal-500",
                    ].join(" ")}
                  />
                ) : null}

                <MoreHorizontal
                  size={21}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>More</span>
              </button>
            ) : null}
          </div>
        </nav>
      ) : null}

      {/* Mobile navigation drawer */}
      {isAuthenticatedShell ? (
        <div
          className={[
            "fixed inset-0 z-[70] lg:hidden",
            mobileMenuOpen
              ? "pointer-events-auto"
              : "pointer-events-none",
          ].join(" ")}
          aria-hidden={!mobileMenuOpen}
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className={[
              "absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]",
              "transition-opacity duration-200",
              mobileMenuOpen
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          />

          <aside
            id="mobile-app-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={[
              "absolute bottom-0 right-0 top-0",
              "flex w-[min(88vw,380px)] flex-col",
              "border-l border-slate-200",
              "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
              "shadow-[-20px_0_45px_rgba(15,23,42,0.16)]",
              "transition-transform duration-300 ease-out",
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
            <div className="shrink-0 border-b border-slate-200/80 px-5 pb-5 pt-5">
              <div className="flex items-center justify-between gap-4">
                <Image
                  src="/logo.png"
                  alt="Castodia"
                  width={155}
                  height={52}
                  className="h-auto w-[145px] object-contain"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  aria-label="Close navigation menu"
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center",
                    "rounded-2xl border border-slate-200 bg-white",
                    "text-slate-600 shadow-sm",
                  ].join(" ")}
                >
                  <X
                    size={22}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div
                className={[
                  "mt-5 flex items-center gap-3 rounded-[20px]",
                  "border border-slate-200 bg-white px-4 py-4",
                  "shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
                ].join(" ")}
              >
                <ProfileAvatar
                  photoUrl={photoUrl}
                  name={name}
                  initials={initials}
                  size="large"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {greeting}
                  </p>

                  <p className="truncate text-lg font-semibold text-slate-950">
                    {name || "Welcome"}
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-teal-600">
                    {portalName} Portal
                  </p>
                </div>
              </div>

              {canSwitchPortal ? (
                <Link
                  href={switchPortalHref}
                  className={[
                    "mt-3 flex min-h-12 items-center justify-between",
                    "rounded-2xl border border-teal-200 bg-teal-50",
                    "px-4 text-sm font-semibold text-teal-700",
                  ].join(" ")}
                >
                  <span>
                    {switchPortalLabel}
                  </span>

                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              ) : null}
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Navigation
              </p>

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
                        "group flex min-h-13 items-center gap-4",
                        "rounded-[18px] px-4 py-3",
                        "text-[15px] font-semibold",
                        "transition-all",
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
                        size={21}
                        strokeWidth={1.9}
                        className={[
                          "shrink-0",
                          active
                            ? "text-white"
                            : "text-slate-500",
                        ].join(" ")}
                        aria-hidden="true"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {link.label}
                      </span>

                      <ChevronRight
                        size={17}
                        className={[
                          "shrink-0",
                          active
                            ? "text-white/80"
                            : "text-slate-300",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="shrink-0 border-t border-slate-200/80 bg-white/35 px-4 py-4">
              <div className="space-y-2">
                {canReportIssue ? (
                  <button
                    type="button"
                    onClick={
                      handleOpenIssueModal
                    }
                    className={[
                      "flex min-h-12 w-full items-center justify-center gap-2",
                      "rounded-2xl border border-teal-200 bg-teal-50",
                      "px-4 text-sm font-semibold text-teal-700",
                    ].join(" ")}
                  >
                    <Bug
                      size={18}
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
                    "flex min-h-12 w-full items-center gap-3",
                    "rounded-2xl px-4",
                    "text-sm font-semibold text-slate-600",
                    "transition-colors hover:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  ].join(" ")}
                >
                  <LogOut
                    size={20}
                    aria-hidden="true"
                  />

                  {loggingOut
                    ? "Logging out..."
                    : "Log out"}
                </button>
              </div>
            </div>
          </aside>
        </div>
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

type ProfileAvatarProps = {
  photoUrl: string | null;
  name: string;
  initials: string;
  size: "small" | "large";
};

function ProfileAvatar({
  photoUrl,
  name,
  initials,
  size,
}: ProfileAvatarProps) {
  const isLarge = size === "large";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-full border-2 border-teal-500",
        "bg-gradient-to-br from-teal-500 to-cyan-400",
        isLarge
          ? "h-14 w-14"
          : "h-11 w-11",
      ].join(" ")}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={
            name
              ? `${name}'s profile photo`
              : "Profile photo"
          }
          fill
          sizes={isLarge ? "56px" : "44px"}
          className="object-cover"
        />
      ) : (
        <span
          className={[
            "font-bold text-white",
            isLarge
              ? "text-base"
              : "text-sm",
          ].join(" ")}
        >
          {initials}
        </span>
      )}
    </div>
  );
}