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
        <main className="min-h-screen bg-slate-100 text-slate-950">
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
        <Image
          src="/logo.png"
          alt="Castodia"
          width={150}
          height={48}
          priority
        />

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <div className="ml-auto h-full w-80 max-w-[85vw] overflow-y-auto bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Support Portal</p>
                <p className="mt-1 text-xl font-bold">Hello {fullName}!</p>
                <p className="mt-2 text-sm text-cyan-300">{time}</p>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-white/10 p-2 text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {supportMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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

            <Link
              href="/manager/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 block rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-white/20"
            >
              Switch to Manager Portal
            </Link>

            <button
              onClick={logOut}
              className="mt-3 w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
          <aside className="hidden w-72 border-r border-slate-600 bg-slate-700 p-5 md:flex md:flex-col">          
            <Image
            src="/logo.png"
            alt="Castodia"
            width={190}
            height={60}
            priority
          />

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
  <p className="text-sm text-slate-300">Hello</p>
  <p className="text-xl font-bold text-white">{fullName}!</p>
  <p className="mt-2 text-sm font-medium text-cyan-300">{time}</p>
</div>

          <nav className="mt-8 flex-1 space-y-2">
            {supportMenuItems.map((item) => {
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

          <Link
            href="/manager/dashboard"
className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"          >
            Switch to Manager Portal
          </Link>

          <button
            onClick={logOut}
            className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300 hover:bg-red-500/20"
          >
            Log Out
          </button>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}