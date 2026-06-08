"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Users, X } from "lucide-react";
import { supportMenuItems } from "@/lib/navigation/supportMenu";
import { supabase } from "@/lib/supabase";

export default function SupportShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [fullName, setFullName] = useState("Support");
  const [time, setTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data?.full_name) {
        setFullName(data.full_name.split(" ")[0]);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function updateTime() {
      setTime(
        new Date().toLocaleString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    updateTime();

    const interval = setInterval(updateTime, 1000 * 30);

    return () => clearInterval(interval);
  }, []);

  async function logOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const MenuLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="mt-8 flex-1 space-y-2">
        {supportMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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

      <Link
        href="/manager/dashboard"
        onClick={onNavigate}
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-white/20"
      >
        <Users size={18} />
        Manager Portal
      </Link>

      <button
        onClick={logOut}
        className="mt-3 w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300 hover:bg-red-500/20"
      >
        Log Out
      </button>
    </>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-950/80 p-5 backdrop-blur md:flex md:flex-col">
          <Image
            src="/logo.png"
            alt="Castodia"
            width={190}
            height={60}
            priority
          />

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-slate-400">Hello</p>
            <p className="text-xl font-bold">{fullName}!</p>
            <p className="mt-2 text-sm text-cyan-300">{time}</p>
          </div>

          <MenuLinks />
        </aside>

        <section className="flex-1">
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
            <Image
              src="/logo.png"
              alt="Castodia"
              width={140}
              height={44}
              priority
            />

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {children}
        </section>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />

          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Image
                src="/logo.png"
                alt="Castodia"
                width={160}
                height={52}
                priority
              />

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-slate-400">Hello</p>
              <p className="text-xl font-bold">{fullName}!</p>
              <p className="mt-2 text-sm text-cyan-300">{time}</p>
            </div>

            <MenuLinks onNavigate={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}
    </main>
  );
}