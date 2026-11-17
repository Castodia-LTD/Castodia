/** Pure scheduling helpers. Local service dates/times are strings; no UTC coercion. */
export type VisitTemplate = {
  id: string;
  personId: string;
  activityCodes: string[];
  weekdays: number[]; // ISO weekday: Monday 1 ... Sunday 7
  startDate: string;
  endDate?: string | null;
  startTime: string; // HH:mm
  durationMinutes: number;
  requiredStaff: number;
};
export type VisitOccurrence = {
  key: string;
  templateId: string;
  personId: string;
  date: string;
  startTime: string;
  endTime: string;
  activityCodes: string[];
  requiredStaff: number;
};
const dayMs = 86_400_000;
function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid ISO date");
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("Invalid calendar date");
  return date;
}
function hhmm(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
/** Generates deterministic occurrence keys; never inserts into a database. */
export function expandVisits(templates: VisitTemplate[], from: string, through: string): VisitOccurrence[] {
  const first = parseDate(from).getTime();
  const last = parseDate(through).getTime();
  if (last < first || last - first > 93 * dayMs) throw new Error("Visit expansion range must be 0–93 days");
  const result: VisitOccurrence[] = [];
  for (const template of templates) {
    if (!template.id || !template.personId || !template.activityCodes.length ||
      template.requiredStaff < 1 || !Number.isInteger(template.requiredStaff) ||
      template.durationMinutes < 5 || template.durationMinutes > 1440 ||
      !Number.isInteger(template.durationMinutes) ||
      !template.weekdays.length || template.weekdays.some(day => !Number.isInteger(day) || day < 1 || day > 7)) {
      throw new Error("Invalid visit template");
    }
    const match = /^(\d{2}):(\d{2})$/.exec(template.startTime);
    if (!match) throw new Error("Invalid visit time");
    const minute = Number(match[1]) * 60 + Number(match[2]);
    if (Number(match[1]) > 23 || Number(match[2]) > 59 || minute + template.durationMinutes > 1440) {
      throw new Error("Visit time crosses midnight; explicit overnight scheduling required");
    }
    const start = parseDate(template.startDate).getTime();
    const end = template.endDate ? parseDate(template.endDate).getTime() : Infinity;
    for (let time = Math.max(first, start); time <= Math.min(last, end); time += dayMs) {
      const date = new Date(time);
      const weekday = date.getUTCDay() || 7;
      if (!template.weekdays.includes(weekday)) continue;
      const dateKey = date.toISOString().slice(0, 10);
      result.push({
        key: `${template.id}:${dateKey}`,
        templateId: template.id, personId: template.personId, date: dateKey,
        startTime: template.startTime, endTime: hhmm(minute + template.durationMinutes),
        activityCodes: [...template.activityCodes], requiredStaff: template.requiredStaff,
      });
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.key.localeCompare(b.key));
}
