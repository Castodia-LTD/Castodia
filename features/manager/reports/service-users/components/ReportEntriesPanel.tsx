import { SectionCard } from "@/components/layouts";

type Props = {
  reportEntries: any[];
  onExport: () => void;
  onPrint: () => void;
};

export default function ReportEntriesPanel({
  reportEntries,
  onExport,
  onPrint,
}: Props) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">
          Report Results ({reportEntries.length})
        </h2>

        <div className="flex gap-3">
          <button
            onClick={onExport}
            disabled={reportEntries.length === 0}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export CSV
          </button>

          <button
            onClick={onPrint}
            disabled={reportEntries.length === 0}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Print
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {reportEntries.length === 0 && (
          <SectionCard>
            <p className="text-sm text-slate-400">
              Run a report to view filtered records.
            </p>
          </SectionCard>
        )}

        {reportEntries.map((entry) => (
          <SectionCard key={entry.id}>
            <p className="text-sm text-slate-400">
              {new Date(entry.event_time).toLocaleString("en-GB")}
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              {entry.entry_type}
            </h3>

            <p className="mt-3 whitespace-pre-line text-slate-200">
              {entry.content}
            </p>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}