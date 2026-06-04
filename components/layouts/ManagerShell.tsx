"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { managerMenuItems } from "@/lib/navigation/managerMenu";
import { supabase } from "@/lib/supabase";

export default function ManagerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [fullName, setFullName] = useState("Manager");
  const [time, setTime] = useState("");

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

          <nav className="mt-8 flex-1 space-y-2">
            {managerMenuItems.map((item) => {
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

          <Link
            href="/support"
            className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:bg-white/20"
          >
            Switch to Support Portal
          </Link>
          <button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }}
  className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300 hover:bg-red-500/20"
>
  Log Out
</button>
        </aside>

        <section className="flex-1 pb-24 md:pb-0">{children}</section>
      </div>
    </main>
  );
}