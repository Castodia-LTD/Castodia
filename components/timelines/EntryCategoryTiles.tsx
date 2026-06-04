import { entryCategories } from "@/lib/timelines/entryCategories";

type Props = {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (value: string | null) => void;
  setEntryType: (value: string) => void;
};

export default function EntryCategoryTiles({
  selectedCategoryId,
  setSelectedCategoryId,
  setEntryType,
}: Props) {
  const selectedCategory = entryCategories.find(
    (category) => category.id === selectedCategoryId
  );

  if (selectedCategory) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className="text-sm text-slate-400"
        >
          ← Back to categories
        </button>

        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedCategory.title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose what you would like to record.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {selectedCategory.options.map((option) => (
            <button
              key={option}
              onClick={() => setEntryType(option)}
              className={`min-h-28 rounded-3xl p-5 text-left shadow-xl transition hover:scale-[1.02] ${selectedCategory.colour}`}
            >
              <p className="text-lg font-bold">{option}</p>
              <p className="mt-2 text-xs opacity-75">Tap to continue</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">
          What would you like to record?
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Choose a category to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {entryCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`min-h-32 rounded-3xl p-5 text-left shadow-xl transition hover:scale-[1.02] ${category.colour}`}
          >
            <p className="text-lg font-bold">{category.title}</p>
            <p className="mt-2 text-sm opacity-80">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}