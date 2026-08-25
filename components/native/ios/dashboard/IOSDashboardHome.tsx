"use client";

import { IOSDashboardTiles, type IOSDashboardTile } from "./IOSDashboardTiles";

type Props = {
  name: string;
  portalLabel: string;
  prompt: string;
  tiles: readonly IOSDashboardTile[];
};

export function IOSDashboardHome({ name, portalLabel, prompt, tiles }: Props) {
  const firstName = name.trim().split(/\s+/)[0] || "";

  return (
    <main className="min-h-full bg-[#f5f8f9] px-4 pb-8 pt-5">
      <section className="mb-5">
        <p className="text-sm font-semibold text-teal-700">{portalLabel}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {firstName ? `Welcome, ${firstName}` : "Welcome"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{prompt}</p>
      </section>

      <IOSDashboardTiles tiles={tiles} />
    </main>
  );
}
