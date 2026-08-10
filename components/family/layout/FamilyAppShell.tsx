"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Heart,
  Home,
  Images,
  Loader2,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type FamilyAppShellProps = {
  children: React.ReactNode;
};

type FamilyUser = {
  id: string;
  auth_user_id: string;
  service_user_id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  relationship: string | null;
  is_active: boolean;
};

type ServiceUser = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  surname: string | null;
};

const navigation = [
  {
    name: "Home",
    href: "/family",
    icon: Home,
  },
  {
    name: "Memories",
    href: "/family/memories",
    icon: Images,
  },
  {
    name: "Settings",
    href: "/family/settings",
    icon: Settings,
  },
];

export default function FamilyAppShell({
  children,
}: FamilyAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [familyUser, setFamilyUser] =
    useState<FamilyUser | null>(null);

  const [serviceUser, setServiceUser] =
    useState<ServiceUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  /*
   * Resolve authenticated Family access.
   */
  useEffect(() => {
    let mounted = true;

    async function loadFamilyAccess() {
      try {
        setLoading(true);

        // -------------------------------------
        // Authenticated user
        // -------------------------------------

        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/");
          return;
        }

        // -------------------------------------
        // Family access
        // -------------------------------------

        const {
          data: familyRows,
          error: familyError,
        } = await supabase
          .from("family_users")
          .select(`
            id,
            auth_user_id,
            service_user_id,
            organisation_id,
            full_name,
            email,
            relationship,
            is_active
          `)
          .eq(
            "auth_user_id",
            user.id,
          )
          .eq(
            "is_active",
            true,
          )
          .limit(2);

        if (familyError) {
          throw familyError;
        }

        if (
          !familyRows ||
          familyRows.length === 0
        ) {
          console.warn(
            "Authenticated user does not have active Family access.",
          );

          router.replace("/");
          return;
        }

        if (
          familyRows.length > 1
        ) {
          throw new Error(
            "More than one active Family account is linked to this login.",
          );
        }

        const familyRecord =
          familyRows[0];

        // -------------------------------------
        // Linked service user
        // -------------------------------------

        const {
          data: serviceUserRows,
          error: serviceUserError,
        } = await supabase
          .from("service_users")
          .select(`
            id,
            full_name,
            first_name,
            surname
          `)
          .eq(
            "id",
            familyRecord.service_user_id,
          )
          .limit(2);

        if (serviceUserError) {
          throw serviceUserError;
        }

        if (
          !serviceUserRows ||
          serviceUserRows.length ===
            0
        ) {
          throw new Error(
            "The linked service user could not be found.",
          );
        }

        if (
          serviceUserRows.length > 1
        ) {
          throw new Error(
            "More than one matching service user was found.",
          );
        }

        const serviceUserRecord =
          serviceUserRows[0];

        if (!mounted) {
          return;
        }

        setFamilyUser(
          familyRecord as FamilyUser,
        );

        setServiceUser(
          serviceUserRecord as ServiceUser,
        );
      } catch (error) {
        console.error(
          "Unable to load Castodia Family access:",
          error,
        );

        if (mounted) {
          router.replace("/");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadFamilyAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * Sign out.
   */
  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error,
      );

      setLoggingOut(false);
    }
  }

  /*
   * Resolve access before rendering
   * the Family application.
   */
  if (loading) {
    return (
      <FamilyLoadingScreen />
    );
  }

  if (
    !familyUser ||
    !serviceUser
  ) {
    return null;
  }

  const serviceUserName =
    serviceUser.first_name?.trim() ||
    serviceUser.full_name?.trim() ||
    "Your loved one";

  const familyMemberName =
    familyUser.full_name?.trim() ||
    "Family";

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#34423b]">
      {/* -------------------------------------
          Desktop sidebar
      ------------------------------------- */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] overflow-hidden border-r border-white/20 bg-[#5f735f] lg:flex lg:flex-col">
        <FamilySidebarContent
          pathname={pathname}
          serviceUserName={
            serviceUserName
          }
          relationship={
            familyUser.relationship
          }
          onLogout={
            handleLogout
          }
          loggingOut={
            loggingOut
          }
        />
      </aside>

      {/* -------------------------------------
          Mobile header
      ------------------------------------- */}

      <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#d9d1c2]/70 bg-[#f8f5ee]/90 px-4 backdrop-blur-xl lg:hidden">
        <FamilyBrand compact />

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(true)
          }
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8d0c2] bg-white/60 text-[#536454] shadow-sm transition hover:bg-white"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* -------------------------------------
          Mobile navigation
      ------------------------------------- */}

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-[#273229]/40 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[285px] overflow-hidden bg-[#5f735f] shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  false,
                )
              }
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <FamilySidebarContent
              pathname={pathname}
              serviceUserName={
                serviceUserName
              }
              relationship={
                familyUser.relationship
              }
              onNavigate={() =>
                setMobileMenuOpen(
                  false,
                )
              }
              onLogout={
                handleLogout
              }
              loggingOut={
                loggingOut
              }
            />
          </aside>
        </div>
      ) : null}

      {/* -------------------------------------
          Main Family application
      ------------------------------------- */}

      <div className="lg:pl-[270px]">
        {/* Desktop header */}

        <header className="hidden h-[76px] items-center justify-end border-b border-[#ded7ca]/70 bg-[#f8f5ee]/70 px-8 backdrop-blur-xl lg:flex xl:px-12">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#3f4e45]">
                {familyMemberName}
              </p>

              <p className="text-xs text-[#83796b]">
                {familyUser.relationship
                  ? `${familyUser.relationship} of ${serviceUserName}`
                  : `Family of ${serviceUserName}`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/55 text-sm font-semibold text-[#566856] shadow-sm backdrop-blur-md">
              {familyMemberName
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* -----------------------------------
            Page content
        ----------------------------------- */}

        <main className="relative min-h-[calc(100vh-70px)] overflow-hidden lg:min-h-[calc(100vh-76px)]">
          {/* Sage ambient glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#d9dfcd]/35 blur-3xl"
          />

          {/* Warm neutral glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-48 left-1/4 h-[420px] w-[420px] rounded-full bg-[#d6c1a6]/20 blur-3xl"
          />

          <div className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12 xl:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * Sidebar
 * ============================================================
 */

type FamilySidebarContentProps = {
  pathname: string;
  serviceUserName: string;
  relationship:
    | string
    | null;
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
};

function FamilySidebarContent({
  pathname,
  serviceUserName,
  relationship,
  onNavigate,
  onLogout,
  loggingOut,
}: FamilySidebarContentProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 py-6">
      <BotanicalVines />

      {/* -----------------------------------
          Branding
      ----------------------------------- */}

      <div className="relative z-10">
        <FamilyBrand />

        <div className="mt-8 rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#dce5d7]">
            Memories for
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {serviceUserName}
          </p>

          {relationship ? (
            <p className="mt-1 text-xs text-[#dce5d7]/70">
              Your relationship:{" "}
              {relationship}
            </p>
          ) : null}
        </div>
      </div>

      {/* -----------------------------------
          Navigation
      ----------------------------------- */}

      <nav
        className="relative z-10 mt-8 flex flex-1 flex-col gap-2"
        aria-label="Family navigation"
      >
        {navigation.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              item.href ===
              "/family"
                ? pathname ===
                  "/family"
                : pathname.startsWith(
                    item.href,
                  );

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={
                  onNavigate
                }
                className={[
                  "group flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition",

                  active
                    ? "border border-white/25 bg-white/20 text-white shadow-[0_8px_24px_rgba(39,50,41,0.12)] backdrop-blur-md"
                    : "text-[#e5ebe1] hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={19}
                  strokeWidth={
                    1.8
                  }
                  className={
                    active
                      ? "text-[#f1e6d2]"
                      : "text-[#d7e0d2] transition group-hover:text-white"
                  }
                />

                {item.name}
              </Link>
            );
          },
        )}
      </nav>

      {/* -----------------------------------
          Sign out
      ----------------------------------- */}

      <div className="relative z-10 border-t border-white/15 pt-4">
        <button
          type="button"
          onClick={
            onLogout
          }
          disabled={
            loggingOut
          }
          className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-medium text-[#e5ebe1] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2
              size={19}
              className="animate-spin"
            />
          ) : (
            <LogOut
              size={19}
              strokeWidth={
                1.8
              }
            />
          )}

          {loggingOut
            ? "Signing out..."
            : "Sign out"}
        </button>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs leading-5 text-[#dce4d8]/75">
            Shared with care.
            <br />
            Kept close to home.
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * Castodia Family branding
 * ============================================================
 */

function FamilyBrand({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Link
      href="/family"
      aria-label="Castodia Family home"
      className="inline-flex items-center"
    >
      <Image
        src="/castodia-family-logo.png"
        alt="Castodia Family"
        width={1254}
        height={387}
        priority
        className={[
          "h-auto object-contain object-left",

          compact
            ? "w-[155px]"
            : "w-[195px]",
        ].join(" ")}
      />
    </Link>
  );
}

/*
 * ============================================================
 * Loading
 * ============================================================
 */

function FamilyLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#6c806b]/15 bg-[#61745f] shadow-sm">
          <Heart
            size={21}
            fill="currentColor"
            className="text-[#ead8bc]"
          />
        </div>

        <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-[#5f735f]" />

        <p className="mt-4 text-sm font-medium text-[#566458]">
          Opening Castodia
          Family...
        </p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * Botanical sidebar decoration
 * ============================================================
 */

function BotanicalVines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 270 900"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
    >
      <path
        d="M8 850 C90 720 18 580 92 430 C142 330 85 190 185 38"
        fill="none"
        stroke="#F2E8D5"
        strokeWidth="2"
      />

      <path
        d="M79 460 C46 451 35 424 41 396 C73 402 90 426 79 460Z"
        fill="#F2E8D5"
      />

      <path
        d="M57 590 C27 578 17 550 27 524 C57 533 73 558 57 590Z"
        fill="#F2E8D5"
      />

      <path
        d="M112 340 C87 318 88 288 105 267 C130 287 137 316 112 340Z"
        fill="#F2E8D5"
      />

      <path
        d="M146 230 C124 206 130 175 151 157 C173 181 176 209 146 230Z"
        fill="#F2E8D5"
      />

      <path
        d="M39 706 C17 683 20 655 38 635 C62 654 66 682 39 706Z"
        fill="#F2E8D5"
      />
    </svg>
  );
}