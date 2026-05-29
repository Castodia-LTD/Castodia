export function generateWellbeingNarrative(
  name: string,
  indicators: string[]
) {
  if (!indicators.length) {
    return `${name} had a wellbeing observation recorded.`;
  }

  const formatted = indicators.map((item) => item.toLowerCase());

  if (formatted.length === 1) {
    return `${name} appeared ${formatted[0]} during this observation.`;
  }

  const last = formatted[formatted.length - 1];
  const rest = formatted.slice(0, -1).join(", ");

  return `${name} appeared ${rest} and ${last} during this observation.`;
}