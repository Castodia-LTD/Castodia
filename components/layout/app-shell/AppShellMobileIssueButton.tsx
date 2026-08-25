"use client";

import { Bug } from "lucide-react";

type Props = {
  onOpenIssue: () => void;
};

export function AppShellMobileIssueButton({ onOpenIssue }: Props) {
  return (
    <button
      type="button"
      onClick={onOpenIssue}
      className="fixed right-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(13,148,136,0.25)] lg:hidden"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
    >
      <Bug size={17} aria-hidden="true" />
      <span className="hidden min-[390px]:inline">Report issue</span>
    </button>
  );
}
