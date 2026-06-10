import { CastodiaButton } from "@/components/castodia";

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

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function SupervisionSearchPanel({
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
        <div>
          <label className="text-sm font-medium text-slate-700">
            Staff member
          </label>

          <select
            value={selectedStaffId}
            onChange={(event) => setSelectedStaffId(event.target.value)}
            className={inputClass}
          >
            <option value="">All staff</option>

            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Date from
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Date to
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <CastodiaButton onClick={onSearch}>
          Search
        </CastodiaButton>

        <CastodiaButton variant="secondary" onClick={onClear}>
          Clear
        </CastodiaButton>
      </div>
    </div>
  );
}