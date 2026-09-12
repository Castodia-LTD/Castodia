"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

export function MentalCapacityLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/75 to-teal-50/75 text-slate-600 shadow-sm backdrop-blur-md">
      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-teal-700" />
      <span>{label}</span>
    </div>
  );
}

export function MentalCapacityError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center">
      <AlertTriangle aria-hidden="true" className="h-8 w-8 text-red-600" />
      <h1 className="mt-4 text-lg font-semibold text-red-950">
        Mental capacity records unavailable
      </h1>
      <p className="mt-2 max-w-lg text-sm text-red-800">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
