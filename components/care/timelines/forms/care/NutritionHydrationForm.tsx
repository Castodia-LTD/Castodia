"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormOptionCard,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type EntryType = "food" | "drink";

export type NutritionHydrationData = {
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
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Evening Meal", label: "Evening Meal" },
  { value: "Snack", label: "Snack" },
  { value: "Dessert", label: "Dessert" },
  { value: "Other", label: "Other" },
];

const preparedByOptions = [
  { value: "Independent", label: "Independent" },
  { value: "Prompted", label: "Prompted" },
  { value: "Supported", label: "Supported" },
  { value: "Staff Prepared", label: "Staff Prepared" },
];

const amountEatenOptions = [
  { value: "🍽🍽🍽🍽 All", label: "🍽🍽🍽🍽 All" },
  { value: "🍽🍽🍽◻ Most", label: "🍽🍽🍽◻ Most" },
  { value: "🍽🍽◻◻ About Half", label: "🍽🍽◻◻ About Half" },
  { value: "🍽◻◻◻ Small Amount", label: "🍽◻◻◻ Small Amount" },
  { value: "◻◻◻◻ Refused", label: "◻◻◻◻ Refused" },
];

const dietaryRequirementOptions = [
  { value: "Care plan followed", label: "Care plan followed" },
  { value: "Texture modified", label: "Texture modified" },
  { value: "Thickened diet", label: "Thickened diet" },
  { value: "Allergies considered", label: "Allergies considered" },
];

const drinkOptions = [
  { value: "Water", label: "Water" },
  { value: "Tea", label: "Tea" },
  { value: "Coffee", label: "Coffee" },
  { value: "Juice", label: "Juice" },
  { value: "Milk", label: "Milk" },
  { value: "Other", label: "Other" },
];

const assistanceOptions = [
  { value: "Independent", label: "Independent" },
  { value: "Prompted", label: "Prompted" },
  { value: "Supported", label: "Supported" },
  { value: "Full Assistance", label: "Full Assistance" },
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
    [selectedConcerns],
  );

  function update(overrides: Partial<NutritionHydrationData> = {}) {
    onChange({
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
    });
  }

  function selectType(value: EntryType) {
    setType(value);

    if (value === "food") {
      setDrinkType("");
      setAmountMl("");
      setAssistance("");

      update({
        type: value,
        drinkType: "",
        amountMl: null,
        assistance: "",
      });

      return;
    }

    setMeal("");
    setFoodDescription("");
    setPreparedBy("");
    setAmountEaten("");
    setDietaryRequirements([]);

    update({
      type: value,
      meal: "",
      foodDescription: "",
      preparedBy: "",
      amountEaten: "",
      dietaryRequirements: [],
    });
  }

  function setConcerns(next: string[]) {
    let normalized = next;

    if (normalized.includes("no_concerns") && normalized.length > 1) {
      normalized = normalized.filter((item) => item !== "no_concerns");
    }

    if (normalized.length === 0) {
      normalized = ["no_concerns"];
    }

    setSelectedConcerns(normalized);
    update({ concerns: normalized });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">
          Nutrition &amp; Hydration
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record food or fluid intake.
        </p>
      </div>

      <FormSection
        title="Entry type"
        description="Choose whether you are recording food or drink."
      >
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
      </FormSection>

      {type === "food" && (
        <FormSection
          title="Food"
          description="Record what was offered and how much was eaten."
        >
          <FormChoiceGroup
            label="Meal"
            value={meal}
            options={mealOptions}
            onChange={(value) => {
              setMeal(value);
              update({ meal: value });
            }}
          />

          <FormField
            label="Food description"
            htmlFor="food-description"
          >
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
          </FormField>

          <FormChoiceGroup
            label="Prepared by"
            value={preparedBy}
            options={preparedByOptions}
            onChange={(value) => {
              setPreparedBy(value);
              update({ preparedBy: value });
            }}
          />

          <FormChoiceGroup
            label="Amount eaten"
            value={amountEaten}
            options={amountEatenOptions}
            onChange={(value) => {
              setAmountEaten(value);
              update({ amountEaten: value });
            }}
          />

          <FormMultiSelect
            label="Dietary requirements"
            description="Select all that apply."
            value={dietaryRequirements}
            options={dietaryRequirementOptions}
            onChange={(next) => {
              setDietaryRequirements(next);
              update({ dietaryRequirements: next });
            }}
          />
        </FormSection>
      )}

      {type === "drink" && (
        <FormSection
          title="Drink"
          description="Record the drink, amount and support provided."
        >
          <FormChoiceGroup
            label="Drink"
            value={drinkType}
            options={drinkOptions}
            onChange={(value) => {
              setDrinkType(value);
              update({ drinkType: value });
            }}
          />

          <FormField
            label="Amount"
            description="Choose a common amount or enter a custom amount in millilitres."
            htmlFor="custom-drink-amount"
          >
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
                      ? "rounded-full border border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 text-sm font-medium text-teal-800 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      : "rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
          </FormField>

          <FormChoiceGroup
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
          <FormMultiSelect
            label="Concerns"
            description="Select all that apply."
            value={selectedConcerns}
            options={concernOptions}
            onChange={setConcerns}
          />

          {notesRequired && (
            <FormAlert
              variant="warning"
              title="Additional detail required"
            >
              Please add notes when a concern is recorded.
            </FormAlert>
          )}

          <FormField
            label={notesRequired ? "Tell us more" : "Notes"}
            htmlFor="nutrition-hydration-notes"
            required={notesRequired}
          >
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
          </FormField>
        </FormSection>
      )}
    </div>
  );
}