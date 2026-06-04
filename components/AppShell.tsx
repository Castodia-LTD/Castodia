"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const logoutTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "staff");
      setLoadingRole(false);
    }

    loadRole();
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }

      logoutTimer.current = setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }, 1000 * 60 * 3);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  if (loadingRole) {
    return null;
  }

  const links = [
    {
      href: "/support",
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur md:flex md:flex-col">
          <Image
            src="/logo.png"
            alt="Castodia"
            width={190}
            height={60}
            priority
          />

          <nav className="mt-10 flex-1 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");

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

          {role === "manager" && (
            <Link
              href="/manager"
              className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-white/20"
            >
              Return to Manager Portal
            </Link>
          )}
        </aside>

        <section className="flex-1 pb-24 md:pb-0">{children}</section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition ${
                  active ? "text-cyan-300" : "text-slate-400"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {role === "manager" && (
          <Link
            href="/manager"
            className="block border-t border-white/10 py-2 text-center text-xs font-semibold text-cyan-300"
          >
            Return to Manager Portal
          </Link>
        )}
      </nav>
    </main>
  );
}