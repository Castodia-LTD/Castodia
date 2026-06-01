type Props = {
  title: string;
  value: number;
  description?: string;
};

export default function ReportStatCard({
  title,
  value,
  description,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-2 text-3xl font-bold text-white">{value}</p>

      {description && (
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      )}
    </div>
  );
}