"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormCheckbox,
  FormCheckboxGroup,
  FormInput,
  FormLabel,
  FormOptionCard,
  FormSection,
  FormTextarea,
} from "@/components/timelines/forms/shared";

type EntryType = "food" | "drink";

type NutritionHydrationData = {
  type: EntryType | "";
  meal: string;
  foodDescription: string;
  preparedBy: string;
  amountEaten: string;
  dietaryRequirements: string[];
  drinkType: string;
  amountMl: number | null;
  assistance: string;
  concerns: string[];
  notes: string;
};

type Props = {
  onChange: (data: NutritionHydrationData) => void;
};

const mealOptions = [
  "Breakfast",
  "Lunch",
  "Evening Meal",
  "Snack",
  "Dessert",
  "Other",
];

const preparedByOptions = [
  "Independent",
  "Prompted",
  "Supported",
  "Staff Prepared",
];

const amountEatenOptions = [
  "🍽🍽🍽🍽 All",
  "🍽🍽🍽◻ Most",
  "🍽🍽◻◻ About Half",
  "🍽◻◻◻ Small Amount",
  "◻◻◻◻ Refused",
];

const dietaryRequirementOptions = [
  "Care plan followed",
  "Texture modified",
  "Thickened diet",
  "Allergies considered",
];

const drinkOptions = [
  "Water",
  "Tea",
  "Coffee",
  "Juice",
  "Milk",
  "Other",
];

const assistanceOptions = [
  "Independent",
  "Prompted",
  "Supported",
  "Full Assistance",
];

const drinkAmountOptions = ["50", "100", "200", "250", "300", "500"];

const concernOptions = [
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

  const notesRequired = useMemo(
    () => selectedConcerns.some((concern) => concern !== "no_concerns"),
    [selectedConcerns]
  );

  function update(overrides: Partial<NutritionHydrationData> = {}) {
    const data: NutritionHydrationData = {
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
      ...overrides,
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
      const concernsWithoutDefault = selectedConcerns.filter(
        (item) => item !== "no_concerns"
      );

      next = concernsWithoutDefault.includes(value)
        ? concernsWithoutDefault.filter((item) => item !== value)
        : [...concernsWithoutDefault, value];
    }

    if (next.length === 0) {
      next = ["no_concerns"];
    }

    setSelectedConcerns(next);
    update({ concerns: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Nutrition &amp; Hydration
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Record food or fluid intake.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormOptionCard
          selected={type === "food"}
          title={
            <span className="flex flex-col gap-2">
              <span className="text-3xl" aria-hidden="true">
                🍽
              </span>
              <span>Food</span>
            </span>
          }
          description="Record a meal, snack or food intake."
          onClick={() => selectType("food")}
        />

        <FormOptionCard
          selected={type === "drink"}
          title={
            <span className="flex flex-col gap-2">
              <span className="text-3xl" aria-hidden="true">
                🥤
              </span>
              <span>Drink</span>
            </span>
          }
          description="Record fluid intake."
          onClick={() => selectType("drink")}
        />
      </div>

      {type === "food" && (
        <FormSection
          title="Food"
          description="Record what was offered and how much was eaten."
        >
          <OptionGrid
            label="Meal"
            value={meal}
            options={mealOptions}
            onChange={(value) => {
              setMeal(value);
              update({ meal: value });
            }}
          />

          <div>
            <FormLabel htmlFor="food-description">
              Food description
            </FormLabel>

            <FormInput
              id="food-description"
              value={foodDescription}
              placeholder="Chicken curry, beans on toast, soup..."
              onChange={(event) => {
                const value = event.target.value;
                setFoodDescription(value);
                update({ foodDescription: value });
              }}
            />
          </div>

          <OptionGrid
            label="Prepared by"
            value={preparedBy}
            options={preparedByOptions}
            onChange={(value) => {
              setPreparedBy(value);
              update({ preparedBy: value });
            }}
          />

          <OptionGrid
            label="Amount eaten"
            value={amountEaten}
            options={amountEatenOptions}
            onChange={(value) => {
              setAmountEaten(value);
              update({ amountEaten: value });
            }}
          />

          <FormCheckboxGroup
            title="Dietary requirements"
            description="Select all that apply."
          >
            {dietaryRequirementOptions.map((option) => (
              <FormCheckbox
                key={option}
                label={option}
                checked={dietaryRequirements.includes(option)}
                onChange={() => toggleDietaryRequirement(option)}
              />
            ))}
          </FormCheckboxGroup>
        </FormSection>
      )}

      {type === "drink" && (
        <FormSection
          title="Drink"
          description="Record the drink, amount and support provided."
        >
          <OptionGrid
            label="Drink"
            value={drinkType}
            options={drinkOptions}
            onChange={(value) => {
              setDrinkType(value);
              update({ drinkType: value });
            }}
          />

          <div>
            <FormLabel htmlFor="custom-drink-amount">Amount</FormLabel>

            <div className="flex flex-wrap gap-2">
              {drinkAmountOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={amountMl === amount}
                  onClick={() => {
                    setAmountMl(amount);
                    update({ amountMl: Number(amount) });
                  }}
                  className={
                    amountMl === amount
                      ? "rounded-full border border-cyan-500 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  }
                >
                  {amount} ml
                </button>
              ))}
            </div>

            <FormInput
              id="custom-drink-amount"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Custom amount in ml"
              value={amountMl}
              className="mt-3"
              onChange={(event) => {
                const value = event.target.value;

                setAmountMl(value);

                update({
                  amountMl: value ? Number(value) : null,
                });
              }}
            />
          </div>

          <OptionGrid
            label="Assistance"
            value={assistance}
            options={assistanceOptions}
            onChange={(value) => {
              setAssistance(value);
              update({ assistance: value });
            }}
          />
        </FormSection>
      )}

      {type && (
        <FormSection
          title="Concerns and notes"
          description="Record any concerns associated with this entry."
        >
          <FormCheckboxGroup
            title="Concerns"
            description="Select all that apply."
          >
            {concernOptions.map((concern) => (
              <FormCheckbox
                key={concern.value}
                label={concern.label}
                checked={selectedConcerns.includes(concern.value)}
                onChange={() => toggleConcern(concern.value)}
              />
            ))}
          </FormCheckboxGroup>

          {notesRequired && (
            <FormAlert variant="warning">
              Please add notes when a concern is recorded.
            </FormAlert>
          )}

          <div>
            <FormLabel
              htmlFor="nutrition-hydration-notes"
              required={notesRequired}
            >
              {notesRequired ? "Tell us more" : "Notes"}
            </FormLabel>

            <FormTextarea
              id="nutrition-hydration-notes"
              value={notes}
              rows={3}
              required={notesRequired}
              placeholder={
                notesRequired
                  ? "Describe the concern..."
                  : "Optional notes..."
              }
              onChange={(event) => {
                const value = event.target.value;
                setNotes(value);
                update({ notes: value });
              }}
            />
          </div>
        </FormSection>
      )}
    </div>
  );
}

type OptionGridProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function OptionGrid({
  label,
  value,
  options,
  onChange,
}: OptionGridProps) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <FormOptionCard
            key={option}
            selected={value === option}
            title={option}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}