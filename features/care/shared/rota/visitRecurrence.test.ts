import { describe, expect, it } from "vitest";
import { expandVisits, type VisitTemplate } from "./visitRecurrence";
const template: VisitTemplate = {
 id: "morning", personId: "person", activityCodes: ["personal_care"],
 weekdays: [1,3,5], startDate: "2026-11-16", startTime: "08:00",
 durationMinutes: 45, requiredStaff: 2,
};
describe("recurring domiciliary visits", () => {
 it("expands only selected weekdays with stable occurrence keys", () => {
   const occurrences = expandVisits([template], "2026-11-16", "2026-11-22");
   expect(occurrences.map(x => x.date)).toEqual(["2026-11-16","2026-11-18","2026-11-20"]);
   expect(occurrences[0]).toMatchObject({key:"morning:2026-11-16",startTime:"08:00",endTime:"08:45",requiredStaff:2});
 });
 it("honours end dates without creating extra occurrences", () => {
   expect(expandVisits([{...template,endDate:"2026-11-18"}], "2026-11-16", "2026-11-22")).toHaveLength(2);
 });
 it("rejects unsafe ranges and ambiguous overnight visits", () => {
   expect(() => expandVisits([template], "2026-01-01", "2026-12-31")).toThrow();
   expect(() => expandVisits([{...template,startTime:"23:45",durationMinutes:45}], "2026-11-16", "2026-11-16")).toThrow();
 });
});
