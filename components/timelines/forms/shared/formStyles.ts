export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export const controlBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export const labelBase =
  "mb-2 block text-sm font-medium text-slate-700";

export const sectionBase =
  "space-y-4 rounded-2xl border border-slate-200 bg-white p-5";

export const optionBase =
  "rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50";

export const selectedOptionBase =
  "border-cyan-500 bg-cyan-50 text-cyan-700";

export const unselectedOptionBase =
  "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";