export function daysSince(dateValue: string | null) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  const today = new Date();

  const difference = today.getTime() - date.getTime();

  return Math.floor(difference / (1000 * 60 * 60 * 24));
}