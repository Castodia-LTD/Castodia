import { CastodiaButton, CastodiaCard } from "@/components/castodia";

type Props = {
  selectedType: string;
  setSelectedType: (value: string) => void;
  onClear: () => void;
};

const timelineTypes = [
  "All",
  "Activity",
  "Community Access",
  "Social Interaction",
  "Contact/Visit",
  "Shopping",
  "Household Tasks",
  "Health Observation",
  "Symptoms",
  "Health Professional",
  "Clinical Care",
  "eMAR",
  "Wellbeing Observation",
  "Behaviour Observation",
  "Sleep Check",
  "Personal Care",
  "Toileting",
  "Continence Care",
  "Nutrition & Hydration",
  "Environment Check",
  "Accident/Injury",
  "Fall",
  "Behaviour Incident",
  "Safeguarding Concern",
  "Medication Error",
  "Near Miss",
];

export default function TimelineFilters({
  selectedType,
  setSelectedType,
  onClear,
}: Props) {
  return (
    <CastodiaCard>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-sm">
          <label className="text-sm font-medium text-slate-700">
            Entry type
          </label>

          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {timelineTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <CastodiaButton variant="secondary" onClick={onClear}>
          Clear Filters
        </CastodiaButton>
      </div>
    </CastodiaCard>
  );
}