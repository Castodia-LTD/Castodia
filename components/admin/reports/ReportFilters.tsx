type ServiceUserOption = {
  id: string;
  name: string;
};

type Props = {
  serviceUsers: ServiceUserOption[];
  selectedServiceUserId: string;
  setSelectedServiceUserId: (value: string) => void;
  selectedEntryType: string;
  setSelectedEntryType: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  onApply: () => void;
};

const entryTypes = [
  "Activity",
  "Medication",
  "Food / Fluid",
  "Toileting",
  "Personal Care",
  "Behaviour",
  "Incident",
  "Sleep",
  "Body Map",
  "Wellbeing",
];

export default function ReportFilters({
  serviceUsers,
  selectedServiceUserId,
  setSelectedServiceUserId,
  selectedEntryType,
  setSelectedEntryType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onApply,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-semibold">Export Filters</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <select
          value={selectedServiceUserId}
          onChange={(e) => setSelectedServiceUserId(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="all">All service users</option>

          {serviceUsers.map((serviceUser) => (
            <option key={serviceUser.id} value={serviceUser.id}>
              {serviceUser.name}
            </option>
          ))}
        </select>

        <select
          value={selectedEntryType}
          onChange={(e) => setSelectedEntryType(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="all">All entry types</option>

          {entryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />
      </div>

      <button
        onClick={onApply}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
      >
        Apply Filters
      </button>
    </div>
  );
}