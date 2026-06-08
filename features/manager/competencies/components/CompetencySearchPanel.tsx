type Props = {
  staff: {
    id: string;
    full_name: string;
  }[];
  selectedStaffId: string;
  dateFrom: string;
  dateTo: string;
  setSelectedStaffId: (value: string) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function CompetencySearchPanel({
  staff,
  selectedStaffId,
  dateFrom,
  dateTo,
  setSelectedStaffId,
  setDateFrom,
  setDateTo,
  onSearch,
  onClear,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <select
          value={selectedStaffId}
          onChange={(event) => setSelectedStaffId(event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="">All staff</option>

          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSearch}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 font-semibold text-white"
        >
          Search
        </button>

        <button
          onClick={onClear}
          className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20"
        >
          Clear
        </button>
      </div>
    </div>
  );
}