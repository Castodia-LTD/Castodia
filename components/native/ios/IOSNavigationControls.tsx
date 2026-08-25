"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
} from "lucide-react";

type IOSNavigationControlsProps = {
  portalHome: string;
};

export function IOSNavigationControls({
  portalHome,
}: IOSNavigationControlsProps) {
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className={[
          "inline-flex h-10 w-10 items-center justify-center",
          "rounded-2xl",
          "border border-slate-200",
          "bg-white text-slate-600",
          "shadow-sm",
          "transition active:scale-[0.97]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-teal-500",
        ].join(" ")}
      >
        <ArrowLeft
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <Link
        href={portalHome}
        aria-label="Return to dashboard"
        className={[
          "inline-flex h-10 w-10 items-center justify-center",
          "rounded-2xl",
          "border border-slate-200",
          "bg-white text-teal-700",
          "shadow-sm",
          "transition active:scale-[0.97]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-teal-500",
        ].join(" ")}
      >
        <Home
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}