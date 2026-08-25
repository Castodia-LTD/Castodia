"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type IOSDashboardTile = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type Props = {
  tiles: readonly IOSDashboardTile[];
};

export function IOSDashboardTiles({ tiles }: Props) {
  return (
    <section aria-label="Portal tools" className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;

        return (
          <Link
            key={tile.href}
            href={tile.href}
            className={[
              "flex min-h-[142px] flex-col justify-between rounded-[24px]",
              "border border-slate-200/80 bg-white p-4",
              "shadow-[0_10px_28px_rgba(15,23,42,0.07)]",
              "transition active:scale-[0.985]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            ].join(" ")}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#079c9c] to-[#65d0c7] text-white shadow-sm">
              <Icon size={21} strokeWidth={2} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-slate-950">{tile.label}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {tile.description}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
