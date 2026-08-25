export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export const controlBase =
  "min-h-11 w-full rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:border-teal-100 disabled:bg-teal-50/60 disabled:text-slate-500";

export const labelBase =
  "mb-2 block text-sm font-medium text-slate-800";

export const sectionBase =
  "space-y-5 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6";

export const optionBase =
  "min-h-11 rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50";

export const selectedOptionBase =
  "border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 shadow-sm";

export const unselectedOptionBase =
  "border-teal-100 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50";