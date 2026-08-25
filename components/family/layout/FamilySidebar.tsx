import Link from "next/link";
import { Home, Loader2, LogOut } from "lucide-react";

import { BotanicalVines } from "./BotanicalVines";
import { FamilyBrand } from "./FamilyBrand";

const navigation = [{ name: "Home", href: "/family", icon: Home }];

type Props = {
  pathname: string;
  serviceUserName: string;
  relationship: string | null;
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
};

export function FamilySidebar({
  pathname,
  serviceUserName,
  relationship,
  onNavigate,
  onLogout,
  loggingOut,
}: Props) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 py-6">
      <BotanicalVines />

      <div className="relative z-10">
        <FamilyBrand />
        <div className="mt-8 rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#dce5d7]">Memories for</p>
          <p className="mt-1 text-lg font-semibold text-white">{serviceUserName}</p>
          {relationship ? <p className="mt-1 text-xs text-[#dce5d7]/70">Your relationship: {relationship}</p> : null}
        </div>
      </div>

      <nav className="relative z-10 mt-8 flex flex-1 flex-col gap-2" aria-label="Family navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={[
                "group flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition",
                active
                  ? "border border-white/25 bg-white/20 text-white shadow-[0_8px_24px_rgba(39,50,41,0.12)] backdrop-blur-md"
                  : "text-[#e5ebe1] hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon size={19} strokeWidth={1.8} className={active ? "text-[#f1e6d2]" : "text-[#d7e0d2] transition group-hover:text-white"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 border-t border-white/15 pt-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-medium text-[#e5ebe1] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? <Loader2 size={19} className="animate-spin" /> : <LogOut size={19} strokeWidth={1.8} />}
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs leading-5 text-[#dce4d8]/75">Shared with care.<br />Kept close to home.</p>
        </div>
      </div>
    </div>
  );
}
