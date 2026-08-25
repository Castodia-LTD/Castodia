import { filters } from "@/lib/care/timelines/constants";

type Props = {
  open: boolean;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  onClose: () => void;
};

export default function TimelineFilters({
  open,
  activeFilter,
  setActiveFilter,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-3xl bg-slate-950 p-6 md:ml-72">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filter entries</h2>

          <button onClick={onClose} className="text-sm text-slate-400">
            Close
          </button>
        </div>

        <div className="space-y-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                onClose();
              }}
              className={`w-full rounded-xl p-3 text-left ${
                activeFilter === filter
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}