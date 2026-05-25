"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "staff");
    }

    loadRole();
  }, []);

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/timelines",
      label: "Timelines",
      icon: Clock3,
    },
        {
      href: "/service-users",
      label: "Service Users",
      icon: Users,
    },
    {
      href: "/handovers",
      label: "Handovers",
      icon: ClipboardList,
    },
  ];

  if (role === "manager") {
    links.push({
      href: "/admin",
      label: "Admin",
      icon: ShieldCheck,
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur md:block">

          <Image
            src="/logo.png"
            alt="Castodia"
            width={190}
            height={60}
            priority
          />

          <nav className="mt-10 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 pb-24 md:pb-0">
          {children}
        </section>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur md:hidden">
        <div
          className={`grid ${
            role === "manager"
              ? "grid-cols-5"
              : "grid-cols-4"
          }`}
        >
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition ${
                  active
                    ? "text-cyan-300"
                    : "text-slate-400"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}