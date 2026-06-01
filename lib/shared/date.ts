export function isSameDay(dateA: Date, dateB: Date) {
  return dateA.toDateString() === dateB.toDateString();
}

export function getTimeNow() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const combined = new Date(date);

  combined.setHours(hours, minutes, 0, 0);

  return combined.toISOString();
}

export function formatAuditDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}