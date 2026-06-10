import {
  CastodiaButton,
  CastodiaCard,
  CastodiaSection,
} from "@/components/castodia";

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
    <CastodiaSection
      title={`Report Results (${reportEntries.length})`}
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <CastodiaButton
          variant="secondary"
          onClick={onExport}
          disabled={reportEntries.length === 0}
        >
          Export CSV
        </CastodiaButton>

        <CastodiaButton
          onClick={onPrint}
          disabled={reportEntries.length === 0}
        >
          Print
        </CastodiaButton>
      </div>

      <div className="space-y-4">
        {reportEntries.length === 0 && (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              Run a report to view filtered records.
            </p>
          </CastodiaCard>
        )}

        {reportEntries.map((entry) => (
          <CastodiaCard key={entry.id}>
            <p className="text-sm text-slate-500">
              {new Date(entry.event_time).toLocaleString("en-GB")}
            </p>

            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              {entry.entry_type}
            </h3>

            <p className="mt-3 whitespace-pre-line text-slate-700">
              {entry.content}
            </p>
          </CastodiaCard>
        ))}
      </div>
    </CastodiaSection>
  );
}