import { describe, expect, it } from "vitest";
import { assessTeam, assessWorker, type VisitRequirement, type WorkerCandidate } from "./activityEligibility";

const visit: VisitRequirement = {
  personId: "person-1",
  activities: ["personal_care", "medication"],
  requiredStaff: 2,
  allStaffCompetencies: ["moving_handling"],
  teamCompetencies: ["medication_administration"],
  verified: true,
};
const worker = (id: string, extras: string[] = []): WorkerCandidate => ({
  id, available: true, attributes: { gender: id === "a" ? "female" : "male" },
  evidence: ["moving_handling", ...extras].map(code => ({
    code, verified: true, validUntil: "2027-01-01",
  })),
});
describe("activity-based allocation eligibility", () => {
  it("requires exactly the assessed staffing ratio and team competence", () => {
    expect(assessTeam(visit, [], [worker("a", ["medication_administration"]), worker("b")], "2026-11-17").covered).toBe(true);
    expect(assessTeam(visit, [], [worker("a", ["medication_administration"])], "2026-11-17").covered).toBe(false);
    expect(assessTeam(visit, [], [worker("a"), worker("b")], "2026-11-17").covered).toBe(false);
    expect(assessTeam(visit, [], [worker("a"), worker("a")], "2026-11-17").covered).toBe(false);
  });
  it("does not clear missing, expired or unsigned competence", () => {
    const missing = worker("a");
    missing.evidence = [];
    expect(assessWorker(visit, [], missing, "2026-11-17").status).toBe("review");
    const expired = worker("a", ["medication_administration"]);
    expired.evidence[0].validUntil = "2026-11-16";
    expect(assessWorker(visit, [], expired, "2026-11-17").status).toBe("review");
    const unsigned = worker("a");
    unsigned.evidence[0].verified = false;
    expect(assessWorker(visit, [], unsigned, "2026-11-17").status).toBe("review");
  });
  it("limits expressed worker requirements to their activity", () => {
    const preference = [{
      activity: "personal_care" as const, strength: "mandatory" as const,
      workerAttribute: { key: "gender", permittedValues: ["female"] }, verified: true,
    }];
    expect(assessWorker(visit, preference, worker("b"), "2026-11-17").status).toBe("ineligible");
    expect(assessWorker({ ...visit, activities: ["community_access"] }, preference, worker("b"), "2026-11-17").status).toBe("eligible");
  });
  it("never approves an unverified requirement", () => {
    expect(assessTeam({ ...visit, verified: false }, [], [worker("a", ["medication_administration"]), worker("b")], "2026-11-17").covered).toBe(false);
  });
  it("rejects unavailable workers and does not treat a preference as training", () => {
    const unavailable = worker("a");
    unavailable.available = false;
    expect(assessWorker(visit, [], unavailable, "2026-11-17").status).toBe("ineligible");
  });
});
