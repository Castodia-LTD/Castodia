/**
 * Shared, service-neutral rota coverage rules.
 *
 * A requirement describes the care a person needs; an assignment describes
 * which staff member is scheduled to deliver it. Staff personal rotas must
 * always be derived from assignments, never independently edited.
 */
export type CareModel = "domiciliary" | "supported_living" | "residential";
export type CoverageKind = "active" | "sleep_in" | "waking_night";
export type CoverageRequirement = {
  id: string;
  organisationId: string;
  serviceId: string;
  personId: string;
  careModel: CareModel;
  startsAt: string; // ISO timestamp with offset
  endsAt: string;
  kind: CoverageKind;
  requiredStaff: number;
};
export type CoverageAssignment = {
  id: string;
  requirementId: string;
  staffUserId: string;
  startsAt: string;
  endsAt: string;
};
export type CoverageGap = {
  requirementId: string;
  startsAt: string;
  endsAt: string;
  requiredStaff: number;
  assignedStaff: number;
};
export type AssignmentConflict = {
  staffUserId: string;
  firstAssignmentId: string;
  secondAssignmentId: string;
  startsAt: string;
  endsAt: string;
};

function millis(value: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid rota timestamp: ${value}`);
  return timestamp;
}

function validateWindow(start: string, end: string) {
  if (millis(end) <= millis(start)) throw new Error("Rota end must follow start.");
}

/** Detects gaps across the entire requirement, including partial coverage. */
export function findCoverageGaps(
  requirements: CoverageRequirement[],
  assignments: CoverageAssignment[],
): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const requirement of requirements) {
    validateWindow(requirement.startsAt, requirement.endsAt);
    if (!Number.isInteger(requirement.requiredStaff) || requirement.requiredStaff < 1) {
      throw new Error("Required staffing must be a positive whole number.");
    }
    const start = millis(requirement.startsAt);
    const end = millis(requirement.endsAt);
    const related = assignments.filter((item) => item.requirementId === requirement.id);
    const boundaries = new Set([start, end]);
    for (const assignment of related) {
      validateWindow(assignment.startsAt, assignment.endsAt);
      const a = Math.max(start, millis(assignment.startsAt));
      const b = Math.min(end, millis(assignment.endsAt));
      if (a < b) { boundaries.add(a); boundaries.add(b); }
    }
    const sorted = [...boundaries].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i], to = sorted[i + 1];
      const present = new Set(related.filter((item) =>
        millis(item.startsAt) <= from && millis(item.endsAt) >= to,
      ).map((item) => item.staffUserId)).size;
      if (present < requirement.requiredStaff) {
        gaps.push({
          requirementId: requirement.id,
          startsAt: new Date(from).toISOString(),
          endsAt: new Date(to).toISOString(),
          requiredStaff: requirement.requiredStaff,
          assignedStaff: present,
        });
      }
    }
  }
  return gaps;
}

/** Detects double booking even when the assignments belong to different services. */
export function findAssignmentConflicts(assignments: CoverageAssignment[]): AssignmentConflict[] {
  const byStaff = new Map<string, CoverageAssignment[]>();
  for (const item of assignments) {
    validateWindow(item.startsAt, item.endsAt);
    const existing = byStaff.get(item.staffUserId) ?? [];
    existing.push(item);
    byStaff.set(item.staffUserId, existing);
  }
  const conflicts: AssignmentConflict[] = [];
  for (const [staffUserId, items] of byStaff) {
    const sorted = [...items].sort((a, b) => millis(a.startsAt) - millis(b.startsAt));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (millis(sorted[j].startsAt) >= millis(sorted[i].endsAt)) break;
        if (sorted[i].id === sorted[j].id) continue;
        conflicts.push({
          staffUserId,
          firstAssignmentId: sorted[i].id,
          secondAssignmentId: sorted[j].id,
          startsAt: new Date(Math.max(millis(sorted[i].startsAt), millis(sorted[j].startsAt))).toISOString(),
          endsAt: new Date(Math.min(millis(sorted[i].endsAt), millis(sorted[j].endsAt))).toISOString(),
        });
      }
    }
  }
  return conflicts;
}

/** One personal rota is a projection of all person/service assignments. */
export function personalRota(assignments: CoverageAssignment[], staffUserId: string) {
  return assignments
    .filter((item) => item.staffUserId === staffUserId)
    .sort((a, b) => millis(a.startsAt) - millis(b.startsAt));
}
