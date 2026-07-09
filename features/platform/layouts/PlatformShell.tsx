"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Bug, Gauge, LogOut, Settings, Shield, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const platformMenuItems = [
  {
    label: "Dashboard",
    href: "/platform/dashboard",
    icon: Gauge,
  },
  {
    label: "Organisations",
    href: "/platform/organisations",
    icon: Building2,
  },
  {
    label: "Issues",
    href: "/platform/issues",
    icon: Bug,
  },
  {
    label: "Admin Users",
    href: "/platform/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/platform/settings",
    icon: Settings,
  },
];

export default function PlatformShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden h-screen w-80 shrink-0 border-r border-slate-800 bg-slate-950 p-6 md:sticky md:top-0 md:flex md:flex-col">
          <div>
            <Image
              src="/logo.png"
              alt="Castodia"
              width={190}
              height={60}
              priority
            />

            <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
                  <Shield size={22} />
                </div>

                <div>
                  <p className="text-sm font-medium text-cyan-200">
                    Castodia
                  </p>
                  <p className="text-xl font-bold text-white">
                    Platform Admin
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Manage organisations, platform users, issues and feature access.
              </p>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {platformMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-5">
  <button
    onClick={logout}
    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
  >
    <LogOut size={17} />
    Log Out
  </button>
</div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}