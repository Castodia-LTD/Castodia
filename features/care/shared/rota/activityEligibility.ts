/**
 * Domiciliary activity-based eligibility. Pure domain logic: no UI, Supabase or
 * external service dependencies. Input records must be fetched under authorised
 * organisation-scoped access and verified against their authoritative sources.
 */
export type ActivityCode =
  | "personal_care" | "medication" | "mobility_transfer"
  | "nutrition" | "community_access" | "companionship";

export type Evidence = {
  code: string;
  validUntil?: string | null; // YYYY-MM-DD
  verified: boolean;
  personId?: string | null; // person-specific sign-off, where required
};

export type VisitRequirement = {
  personId: string;
  activities: ActivityCode[];
  requiredStaff: number;
  /** Competencies required of every allocated worker. */
  allStaffCompetencies: string[];
  /** At least one allocated worker must hold each listed competency. */
  teamCompetencies: string[];
  /** Source record must explicitly confirm requirements have been reviewed. */
  verified: boolean;
};

export type PersonPreference = {
  activity: ActivityCode;
  strength: "mandatory" | "strong" | "general";
  /** A worker characteristic explicitly requested by the person; never inferred. */
  workerAttribute?: { key: string; permittedValues: string[] };
  preferredStaffIds?: string[];
  verified: boolean;
};

export type WorkerCandidate = {
  id: string;
  available: boolean;
  evidence: Evidence[];
  /** Only use explicitly maintained, appropriately permissioned attributes. */
  attributes: Record<string, string | undefined>;
};

export type Eligibility = {
  workerId: string;
  status: "eligible" | "review" | "ineligible";
  reasons: string[];
  preferenceScore: number;
};

function evidenceCurrent(e: Evidence, personId: string, date: string) {
  return e.verified &&
    (!e.validUntil || e.validUntil >= date) &&
    (!e.personId || e.personId === personId);
}

/** Check an individual worker; team-level coverage must be checked separately. */
export function assessWorker(
  visit: VisitRequirement,
  preferences: PersonPreference[],
  worker: WorkerCandidate,
  date: string,
): Eligibility {
  const reasons: string[] = [];
  let blocked = false;
  let review = !visit.verified || visit.activities.length === 0 || visit.requiredStaff < 1;
  let preferenceScore = 0;
  if (review) reasons.push("Visit requirements need verification");
  if (!worker.available) { blocked = true; reasons.push("Worker unavailable"); }

  for (const code of visit.allStaffCompetencies) {
    if (!worker.evidence.some(e => e.code === code && evidenceCurrent(e, visit.personId, date))) {
      review = true;
      reasons.push(`Current verified competency missing: ${code}`);
    }
  }
  for (const pref of preferences.filter(p => visit.activities.includes(p.activity))) {
    if (!pref.verified) {
      review = true;
      reasons.push(`Unverified preference for ${pref.activity}`);
      continue;
    }
    if (pref.workerAttribute) {
      const actual = worker.attributes[pref.workerAttribute.key];
      const matches = actual !== undefined && pref.workerAttribute.permittedValues.includes(actual);
      if (!matches && pref.strength === "mandatory") {
        if (actual === undefined) review = true;
        else blocked = true;
        reasons.push(`Mandatory person preference not met: ${pref.activity}`);
      } else if (matches) preferenceScore += pref.strength === "strong" ? 10 : 2;
    }
    if (pref.preferredStaffIds?.includes(worker.id)) {
      preferenceScore += pref.strength === "strong" ? 10 : 2;
    } else if (pref.strength === "mandatory" && pref.preferredStaffIds?.length) {
      blocked = true;
      reasons.push(`Mandatory named-worker requirement not met: ${pref.activity}`);
    }
  }
  return {
    workerId: worker.id,
    status: blocked ? "ineligible" : review ? "review" : "eligible",
    reasons,
    preferenceScore,
  };
}

/** A visit is fully covered only if enough distinct, eligible workers are assigned. */
export function assessTeam(
  visit: VisitRequirement,
  preferences: PersonPreference[],
  workers: WorkerCandidate[],
  date: string,
) {
  const assessments = workers.map(w => assessWorker(visit, preferences, w, date));
  const distinct = new Set(workers.map(w => w.id)).size === workers.length;
  const covered = distinct && workers.length >= visit.requiredStaff &&
    assessments.every(a => a.status === "eligible") &&
    visit.teamCompetencies.every(code => workers.some(w =>
      w.evidence.some(e => e.code === code && evidenceCurrent(e, visit.personId, date))
    ));
  const reasons: string[] = [];
  if (!distinct) reasons.push("Duplicate worker allocation");
  if (workers.length < visit.requiredStaff) reasons.push("Insufficient staffing positions filled");
  for (const code of visit.teamCompetencies) {
    if (!workers.some(w => w.evidence.some(e => e.code === code && evidenceCurrent(e, visit.personId, date))))
      reasons.push(`Team competency not covered: ${code}`);
  }
  return { covered, assessments, reasons };
}
