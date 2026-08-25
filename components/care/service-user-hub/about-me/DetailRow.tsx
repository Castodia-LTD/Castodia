type DetailRowProps = {
  label: string;
  value?: string | null;
};

export default function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <div className="grid min-w-0 gap-1 sm:grid-cols-[minmax(130px,0.8fr)_minmax(0,1.2fr)] sm:gap-6">
        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="min-w-0 whitespace-pre-wrap break-words text-sm text-slate-900 sm:text-right">
          {value?.trim() || "—"}
        </span>
      </div>
    </div>
  );
}