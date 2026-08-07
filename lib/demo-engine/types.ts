export type DemoScenarioCategory =
  | "personal-care"
  | "nutrition"
  | "hydration"
  | "activity"
  | "community"
  | "family"
  | "wellbeing"
  | "sleep"
  | "medication"
  | "behaviour"
  | "fall"
  | "injury"
  | "health"
  | "appointment"
  | "general";

export type DemoScenarioTone =
  | "positive"
  | "neutral"
  | "concern";

export type DemoScenario = {
  id: string;

  category: DemoScenarioCategory;
  tone: DemoScenarioTone;

  entryType: string;

  title?: string;

  /**
   * Generates the actual timeline-entry content.
   * Service-user first name can be injected so
   * records feel natural rather than generic.
   */
  generateContent: (
    context: DemoScenarioContext,
  ) => string;

  /**
   * Relative likelihood of this scenario being
   * selected.
   *
   * Higher = appears more often.
   */
  weight: number;

  /**
   * Optional preferred time window.
   */
  timeWindow?: DemoTimeWindow;

  /**
   * Allows certain scenarios to be rarer
   * regardless of their weighting.
   */
  probability?: number;

  /**
   * Whether this event is useful enough to
   * appear in a handover.
   */
  includeInHandover?: boolean;
};

export type DemoTimeWindow =
  | "overnight"
  | "morning"
  | "afternoon"
  | "evening"
  | "any";

export type DemoScenarioContext = {
  serviceUserId: string;

  firstName: string;
  fullName: string;

  eventTime: Date;
};

export type DemoServiceUser = {
  id: string;

  first_name: string | null;
  surname: string | null;

  organisation_id: string;

  is_active?: boolean | null;
};

export type DemoTimelineEntryInsert = {
  service_user_id: string;
  created_by: string;

  entry_type: string;
  content: string;

  event_time: string;

  metadata: DemoGeneratedMetadata;
};

export type DemoGeneratedMetadata = {
  demo_generated: true;

  demo_engine_version: string;

  demo_scenario: string;

  demo_tone: DemoScenarioTone;

  demo_category: DemoScenarioCategory;

  demo_run_id: string;

  generated_at: string;
};

export type DemoGeneratedTimelineEntry = {
  id: string;

  service_user_id: string;

  entry_type: string;
  content: string;

  event_time: string;
  created_at: string;

  metadata: DemoGeneratedMetadata;
};

export type DemoEngineRunResult = {
  runId: string;

  startedAt: string;
  completedAt: string;

  serviceUsersProcessed: number;

  timelineEntriesCreated: number;

  timelineEntriesRemoved: number;

  handoversCreated: number;

  warnings: string[];
};