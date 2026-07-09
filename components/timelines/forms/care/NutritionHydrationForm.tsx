"use client";

import { useMemo, useState } from "react";

type EntryType = "food" | "drink";

type Props = {
  onChange: (data: any) => void;
};

const concerns = [
  { value: "no_concerns", label: "No concerns" },
  { value: "poor_appetite", label: "Poor appetite" },
  { value: "refused", label: "Refused" },
  { value: "choking", label: "Choking" },
  { value: "nausea", label: "Nausea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "other", label: "Other" },
];

export default function NutritionHydrationForm({ onChange }: Props) {
  const [type, setType] = useState<EntryType | "">("");

  const [meal, setMeal] = useState("");
  const [foodDescription, setFoodDescription] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [amountEaten, setAmountEaten] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);

  const [drinkType, setDrinkType] = useState("");
  const [amountMl, setAmountMl] = useState("");
  const [assistance, setAssistance] = useState("");

  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    "no_concerns",
  ]);
  const [notes, setNotes] = useState("");

  const notesRequired = useMemo(() => {
    return selectedConcerns.some((c) => c !== "no_concerns");
  }, [selectedConcerns]);

  function update(payload?: any) {
    const data = {
      type,
      meal,
      foodDescription,
      preparedBy,
      amountEaten,
      dietaryRequirements,
      drinkType,
      amountMl: amountMl ? Number(amountMl) : null,
      assistance,
      concerns: selectedConcerns,
      notes,
      ...payload,
    };

    onChange(data);
  }

  function selectType(value: EntryType) {
    setType(value);
    update({ type: value });
  }

  function toggleDietaryRequirement(value: string) {
    const next = dietaryRequirements.includes(value)
      ? dietaryRequirements.filter((item) => item !== value)
      : [...dietaryRequirements, value];

    setDietaryRequirements(next);
    update({ dietaryRequirements: next });
  }

  function toggleConcern(value: string) {
    let next: string[];

    if (value === "no_concerns") {
      next = ["no_concerns"];
    } else {
      next = selectedConcerns
        .filter((item) => item !== "no_concerns")
        .includes(value)
        ? selectedConcerns.filter((item) => item !== value)
        : [
            ...selectedConcerns.filter((item) => item !== "no_concerns"),
            value,
          ];
    }

    if (next.length === 0) next = ["no_concerns"];

    setSelectedConcerns(next);
    update({ concerns: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Nutrition & Hydration
        </h3>
        <p className="text-sm text-slate-500">
          Record food or fluid intake.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => selectType("food")}
          className={`rounded-2xl border p-5 text-left transition ${
            type === "food"
              ? "border-cyan-500 bg-cyan-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="text-3xl">🍽</div>
          <div className="mt-2 font-semibold text-slate-900">Food</div>
        </button>

        <button
          type="button"
          onClick={() => selectType("drink")}
          className={`rounded-2xl border p-5 text-left transition ${
            type === "drink"
              ? "border-cyan-500 bg-cyan-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="text-3xl">🥤</div>
          <div className="mt-2 font-semibold text-slate-900">Drink</div>
        </button>
      </div>

      {type === "food" && (
        <div className="space-y-5">
          <SelectBlock
            label="Meal"
            value={meal}
            onChange={(value) => {
              setMeal(value);
              update({ meal: value });
            }}
            options={[
              "Breakfast",
              "Lunch",
              "Evening Meal",
              "Snack",
              "Dessert",
              "Other",
            ]}
          />

          <TextInput
            label="Food description"
            placeholder="Chicken curry, beans on toast, soup..."
            value={foodDescription}
            onChange={(value) => {
              setFoodDescription(value);
              update({ foodDescription: value });
            }}
          />

          <SelectBlock
            label="Prepared by"
            value={preparedBy}
            onChange={(value) => {
              setPreparedBy(value);
              update({ preparedBy: value });
            }}
            options={[
              "Independent",
              "Prompted",
              "Supported",
              "Staff Prepared",
            ]}
          />

          <SelectBlock
            label="Amount eaten"
            value={amountEaten}
            onChange={(value) => {
              setAmountEaten(value);
              update({ amountEaten: value });
            }}
            options={[
              "🍽🍽🍽🍽 All",
              "🍽🍽🍽◻ Most",
              "🍽🍽◻◻ About Half",
              "🍽◻◻◻ Small Amount",
              "◻◻◻◻ Refused",
            ]}
          />

          <CheckboxGroup
            label="Dietary requirements"
            values={dietaryRequirements}
            options={[
              "Care plan followed",
              "Texture modified",
              "Thickened diet",
              "Allergies considered",
            ]}
            onToggle={toggleDietaryRequirement}
          />
        </div>
      )}

      {type === "drink" && (
        <div className="space-y-5">
          <SelectBlock
            label="Drink"
            value={drinkType}
            onChange={(value) => {
              setDrinkType(value);
              update({ drinkType: value });
            }}
            options={["Water", "Tea", "Coffee", "Juice", "Milk", "Other"]}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount
            </label>
            <div className="flex flex-wrap gap-2">
              {["50", "100", "200", "250", "300", "500"].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setAmountMl(amount);
                    update({ amountMl: Number(amount) });
                  }}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    amountMl === amount
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {amount}ml
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Custom ml"
              value={amountMl}
              onChange={(e) => {
                setAmountMl(e.target.value);
                update({
                  amountMl: e.target.value ? Number(e.target.value) : null,
                });
              }}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <SelectBlock
            label="Assistance"
            value={assistance}
            onChange={(value) => {
              setAssistance(value);
              update({ assistance: value });
            }}
            options={[
              "Independent",
              "Prompted",
              "Supported",
              "Full Assistance",
            ]}
          />
        </div>
      )}

      {type && (
        <div className="space-y-5">
          <CheckboxGroup
            label="Concerns"
            values={selectedConcerns}
            options={concerns.map((c) => c.label)}
            onToggle={(label) => {
              const found = concerns.find((c) => c.label === label);
              if (found) toggleConcern(found.value);
            }}
          />

          {notesRequired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Please add notes when a concern is recorded.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {notesRequired ? "Tell us more" : "Notes"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                update({ notes: e.target.value });
              }}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              placeholder={
                notesRequired
                  ? "Describe the concern..."
                  : "Optional notes..."
              }
              required={notesRequired}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SelectBlock({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3 py-3 text-left text-sm ${
              value === option
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
      />
    </div>
  );
}

function CheckboxGroup({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              values.includes(option) ||
              values.includes(option.toLowerCase().replaceAll(" ", "_"))
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <span>{option}</span>
            <span>
              {values.includes(option) ||
              values.includes(option.toLowerCase().replaceAll(" ", "_"))
                ? "✓"
                : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}