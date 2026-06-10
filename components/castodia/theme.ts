export const castodiaTheme = {
  shell: {
    sidebar: "bg-slate-950 text-slate-300",
    sidebarBorder: "border-white/10",
    workspace: "bg-slate-100 text-slate-950",
  },

  page: {
    container: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
    header: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
    title: "text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl",
    description: "mt-2 max-w-2xl text-sm leading-6 text-slate-500",
  },

  card: {
    base: "rounded-2xl bg-white shadow-md",
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },

  button: {
    base: "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    sizes: {
      sm: "h-9 px-3",
      md: "h-10 px-4",
      lg: "h-11 px-5",
    },
    variants: {
      primary:
  "bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:opacity-90 shadow-lg shadow-blue-500/20",
      secondary:
  "bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:opacity-90 shadow-lg shadow-blue-500/20",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500",
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500",
      ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-300",
    },
  },

  table: {
    wrapper: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
    table: "min-w-full divide-y divide-slate-200",
    thead: "bg-slate-50",
    th: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
    td: "px-4 py-4 text-sm text-slate-700",
    row: "transition hover:bg-slate-50",
  },

  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
    variants: {
      neutral: "bg-slate-100 text-slate-700",
      success: "bg-emerald-50 text-emerald-700",
      warning: "bg-amber-50 text-amber-700",
      danger: "bg-rose-50 text-rose-700",
      info: "bg-blue-50 text-blue-700",
    },
    input: {
  base:
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
},

select: {
  base:
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
},

panel: {
  base:
    "rounded-2xl border border-slate-200 bg-white p-4",
},

info: {
  base:
    "rounded-2xl border border-blue-200 bg-blue-50 p-4",
},
},
};