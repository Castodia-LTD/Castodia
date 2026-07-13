export function getTimelineSummary(entryType: string, content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (entryType === "Nutrition & Hydration") {
    const type = getValue(lines, "Type:");
    const meal = getValue(lines, "Meal:");
    const food = getValue(lines, "Food:");
    const drink = getValue(lines, "Drink:");
    const amount = getValue(lines, "Amount:");
    const amountEaten = getValue(lines, "Amount Eaten:");
    const concerns = getValue(lines, "Concerns:");

    if (type === "Food") {
      return `🍽 ${meal || "Food"} • ${food || "Not recorded"} • ${
        amountEaten || "Amount not recorded"
      } • ${formatConcerns(concerns)}`;
    }

    if (type === "Drink") {
      return `🥤 ${drink || "Drink"} • ${amount || "Amount not recorded"} • ${formatConcerns(
        concerns
      )}`;
    }
  }

  if (entryType === "Body Map") {
    const markers = getValue(lines, "Markers Recorded:");
    return `🩹 Body Map • ${markers || "0"} marker${markers === "1" ? "" : "s"}`;
  }

  if (entryType === "Behaviour Incident") {
    const behaviour = getValue(lines, "Behaviour Type:");
    const outcome = getValue(lines, "Immediate Outcome:");
    return `⚠ Behaviour Incident • ${behaviour || "Behaviour recorded"} • ${
      outcome || "Outcome recorded"
    }`;
  }

  if (entryType === "Behaviour Observation") {
    const observed = getValue(lines, "Behaviour Observed:");
    const outcome = getValue(lines, "Outcome:");
    return `🧠 Behaviour • ${observed || "Observed"} • ${
      outcome || "Outcome not recorded"
    }`;
  }

  if (entryType === "Toileting") {
    return `🚽 Toileting • ${lines.slice(1, 4).join(" • ")}`;
  }

  if (entryType === "Personal Care") {
    return `🧼 Personal Care • ${lines.slice(1, 4).join(" • ")}`;
  }

  if (entryType === "Sleep") {
    return `🌙 Sleep • ${lines.slice(1, 4).join(" • ")}`;
  }

  return lines.slice(1, 4).join(" • ") || content.slice(0, 80);
}

function getValue(lines: string[], label: string) {
  const index = lines.findIndex((line) => line === label);
  if (index === -1) return "";
  return lines[index + 1] || "";
}

function formatConcerns(value: string) {
  if (!value) return "No concerns";
  if (value === "no_concerns") return "No concerns";

  return value
    .split(",")
    .map((item) =>
      item
        .trim()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(", ");
}