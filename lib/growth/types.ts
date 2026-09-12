export const GROWTH_DOMAINS = [
  "social_engagement_and_relationships",
  "independent_living",
  "education_and_employment",
  "health_and_wellbeing",
  "community_participation",
  "personal_choice_and_confidence",
] as const;

export type GrowthDomain = (typeof GROWTH_DOMAINS)[number];

export const GROWTH_GOAL_STATUSES = [
  "draft",
  "active",
  "paused",
  "achieved",
  "closed",
] as const;

export type GrowthGoalStatus = (typeof GROWTH_GOAL_STATUSES)[number];

export const GROWTH_PROGRESS_TYPES = [
  "progress",
  "maintained",
  "barrier",
  "milestone",
] as const;

export type GrowthProgressType = (typeof GROWTH_PROGRESS_TYPES)[number];

export type GrowthMetadata = {
  growth?: {
    domain: GrowthDomain;
    progressType: GrowthProgressType;
    relatedGoalIds?: string[];
    summary?: string;
  };
};

export type GrowthGoal = {
  id: string;
  organisationId: string;
  serviceUserId: string;
  title: string;
  desiredOutcome: string | null;
  supportApproach: string | null;
  domain: GrowthDomain;
  status: GrowthGoalStatus;
  startDate: string;
  targetDate: string | null;
  achievedAt: string | null;
  familyVisible: boolean;
  sourceType: "monthly_check_in" | "manager_created";
  sourceReviewId: string | null;
  sourceExternalId: string | null;
};

export type GrowthObservation = {
  id: string;
  timelineEntryId: string;
  domain: GrowthDomain;
  progressType: GrowthProgressType;
  summary: string | null;
  occurredAt: string;
  goalIds: string[];
  familyVisible: boolean;
  evidenceLinks: { id: string; goalId: string; familyVisible: boolean }[];
};

export type GrowthPerson = {
  id: string;
  fullName: string;
  houseName: string | null;
  dateOfBirth: string | null;
  photoPath: string | null;
};

export type GrowthOverview = {
  person: GrowthPerson;
  goals: GrowthGoal[];
  observations: GrowthObservation[];
};

export const GROWTH_DOMAIN_LABELS: Record<GrowthDomain, string> = {
  social_engagement_and_relationships: "Social engagement and relationships",
  independent_living: "Independent living",
  education_and_employment: "Education and employment",
  health_and_wellbeing: "Health and wellbeing",
  community_participation: "Community participation",
  personal_choice_and_confidence: "Personal choice and confidence",
};

export type MonthlyReviewGrowthGoal = {
  id: string;
  title: string;
  desiredOutcome: string | null;
  targetDate: string | null;
  status: "active";
  source: "monthly_check_in";
  agreedAt: string;
  domain?: GrowthDomain;
};
