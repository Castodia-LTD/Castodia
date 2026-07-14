import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveNutritionHydration(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.nutritionHydrationData;

  if (!data?.type) {
    alert("Please choose Food or Drink.");
    return false;
  }

  const concerns = data.concerns?.length
    ? data.concerns
    : ["no_concerns"];

  const hasConcern = concerns.some(
    (concern: string) => concern !== "no_concerns"
  );

  if (hasConcern && !data.notes?.trim()) {
    alert("Please add notes when a concern is recorded.");
    return false;
  }

  if (data.type === "food") {
    if (!data.meal) {
      alert("Please select a meal.");
      return false;
    }

    if (!data.foodDescription?.trim()) {
      alert("Please enter what was eaten.");
      return false;
    }

    if (!data.preparedBy) {
      alert("Please select who prepared it.");
      return false;
    }

    if (!data.amountEaten) {
      alert("Please select how much was eaten.");
      return false;
    }

    const finalContent = `Nutrition & Hydration

Type:
Food

Meal:
${data.meal}

Food:
${data.foodDescription.trim()}

Prepared By:
${data.preparedBy}

Amount Eaten:
${data.amountEaten}

Dietary Requirements:
${
  data.dietaryRequirements?.length
    ? data.dietaryRequirements.join(", ")
    : "Not recorded"
}

Concerns:
${concerns.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

    return saveTimelineEntry(ctx, {
      entryType: "Nutrition & Hydration",
      content: finalContent,
      metadata: data,
    });
  }

  if (data.type === "drink") {
    if (!data.drinkType) {
      alert("Please select a drink.");
      return false;
    }

    if (!data.amountMl) {
      alert("Please enter the amount in ml.");
      return false;
    }

    if (!data.assistance) {
      alert("Please select assistance level.");
      return false;
    }

    const finalContent = `Nutrition & Hydration

Type:
Drink

Drink:
${data.drinkType}

Amount:
${data.amountMl}ml

Assistance:
${data.assistance}

Concerns:
${concerns.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

    return saveTimelineEntry(ctx, {
      entryType: "Nutrition & Hydration",
      content: finalContent,
      metadata: data,
    });
  }

  alert("The selected Nutrition & Hydration type is not recognised.");
  return false;
}