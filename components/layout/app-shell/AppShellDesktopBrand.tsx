"use client";

import Image from "next/image";

import { ProfileAvatar } from "./ProfileAvatar";

type Props = {
  name: string;
  photoUrl: string | null;
  initials: string;
  greeting: string;
  roleLabel: string;
  portalName: string;
  collapsed: boolean;
  onToggle: () => void;
};

export function AppShellDesktopBrand({
  name,
  photoUrl,
  initials,
  greeting,
  roleLabel,
  portalName,
  collapsed,
  onToggle,
}: Props) {
  return (
    <div className={["shrink-0 pb-3 pt-4", collapsed ? "px-2" : "px-4"].join(" ")}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand navigation menu" : "Collapse navigation menu"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand navigation" : "Collapse navigation"}
        className={[
          "flex rounded-xl outline-none transition-all duration-200",
          "hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-teal-500",
          collapsed
            ? "mx-auto h-12 w-12 items-center justify-center p-1"
            : "w-full items-center justify-start px-1 py-1",
        ].join(" ")}
      >
        <Image
          src={collapsed ? "/castodia-mark.png" : "/logo.png"}
          alt=""
          width={collapsed ? 44 : 185}
          height={collapsed ? 44 : 62}
          priority
          className={collapsed ? "h-11 w-11 object-contain" : "h-auto w-[185px] object-contain"}
        />
      </button>

      <div
        title={collapsed ? `${greeting}, ${name || "Welcome"} — ${roleLabel} — ${portalName}` : undefined}
        className={[
          "mt-4 border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]",
          collapsed
            ? "flex justify-center rounded-2xl px-2 py-3"
            : "rounded-[18px] px-3.5 py-3",
        ].join(" ")}
      >
        <div className={["flex items-center", collapsed ? "justify-center" : "gap-3"].join(" ")}>
          <ProfileAvatar
            photoUrl={photoUrl}
            name={name}
            initials={initials}
            size="large"
          />

          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{greeting}</p>
              <p className="mt-0.5 truncate text-base font-semibold leading-tight text-slate-950">
                {name || "Welcome"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-teal-700">{roleLabel}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">{portalName}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
