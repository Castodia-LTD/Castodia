type Props = {
  filters: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
};

export default function TimelineFilters({
  filters,
  activeFilter,
  setActiveFilter,
  filterOpen,
  setFilterOpen,
}: Props) {
  return (
    <>
      <button
        onClick={() => setFilterOpen(true)}
        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white"
      >
        Filter: {activeFilter}
      </button>

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-3xl bg-slate-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Filter Entries
              </h2>

              <button
                onClick={() => setFilterOpen(false)}
                className="text-slate-400"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setFilterOpen(false);
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
      )}
    </>
  );
}