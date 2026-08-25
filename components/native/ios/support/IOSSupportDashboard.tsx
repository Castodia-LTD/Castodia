"use client";

import Image from "next/image";
import Link from "next/link";

import { supportDashboardTiles } from "@/components/support/dashboard/supportDashboardTiles";

type IOSSupportDashboardProps = {
  name: string;
};

export function IOSSupportDashboard({
  name,
}: IOSSupportDashboardProps) {
  const firstName =
    name.trim().split(/\s+/)[0] || "";

  return (
    <main className="min-h-dvh bg-[#f5f8f9] pb-[calc(28px+env(safe-area-inset-bottom))]">
      <header className="bg-gradient-to-br from-[#07585d] via-[#087077] to-[#079c9c] px-5 pb-7 pt-[calc(20px+env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between gap-4">
          <Image
            src="/logo.png"
            alt="Castodia"
            width={145}
            height={48}
            priority
            className="h-auto w-[135px] brightness-0 invert"
          />

          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
            Support
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-cyan-50/75">
            Good to see you
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {firstName || "Welcome"}
          </h1>

          <p className="mt-2 text-sm text-cyan-50/75">
            What do you need to do?
          </p>
        </div>
      </header>

      <section className="-mt-3 px-4">
        <div className="grid grid-cols-2 gap-3">
          {supportDashboardTiles.map((tile) => {
            const Icon = tile.icon;

            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={[
                  "flex min-h-[142px] flex-col justify-between",
                  "rounded-[24px]",
                  "border border-slate-200/80",
                  "bg-white p-4",
                  "shadow-[0_10px_28px_rgba(15,23,42,0.07)]",
                  "transition active:scale-[0.985]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-teal-500",
                ].join(" ")}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#079c9c] to-[#65d0c7] text-white">
                  <Icon
                    size={21}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="text-[15px] font-bold text-slate-950">
                    {tile.label}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {tile.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}