export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export const controlBase =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const labelBase =
  "mb-2 block text-sm font-semibold text-slate-800";

export const helpTextBase =
  "mt-1.5 text-xs leading-5 text-slate-500";

export const sectionBase =
  "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)] sm:p-5";

export const optionBase =
  "min-h-11 rounded-xl border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50";

export const selectedOptionBase =
  "border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 shadow-sm";

export const unselectedOptionBase =
  "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50";

export const formStackBase = "space-y-4";

export const formGridBase = "grid gap-4 sm:grid-cols-2";

export const secondaryActionBase =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const primaryActionBase =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(13,148,136,0.18)] transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
