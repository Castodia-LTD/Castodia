import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-teal-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
    ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

const controlClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} min-h-28 resize-y ${props.className ?? ""}`} />;
}

export function StatusPill({ value }: { value: string }) {
  const colours: Record<string, string> = {
    open: "bg-sky-100 text-sky-800",
    referred: "bg-violet-100 text-violet-800",
    investigating: "bg-amber-100 text-amber-800",
    monitoring: "bg-teal-100 text-teal-800",
    closed: "bg-slate-200 text-slate-700",
    low: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-rose-100 text-rose-800",
    urgent: "bg-rose-100 text-rose-800",
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-sky-100 text-sky-800",
    blocked: "bg-rose-100 text-rose-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-slate-200 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colours[value] ?? "bg-slate-100 text-slate-700"}`}>
      {humanise(value)}
    </span>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {message}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function humanise(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(`${value}T12:00:00`),
  );
}

export function toDateTimeLocal(value: string | Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function toIsoDateTime(localValue: string) {
  return new Date(localValue).toISOString();
}

export function staffName(
  staff: Array<{ id: string; full_name: string }>,
  id: string | null | undefined,
) {
  if (!id) return "Unassigned";
  return staff.find((person) => person.id === id)?.full_name ?? "Unknown staff member";
}
