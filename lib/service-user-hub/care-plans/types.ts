import type { CarePlanSectionKey } from "./sections";

export type CarePlanStatus = "draft" | "published" | "archived";

export type CarePlanRecord = {
  id: string;
  organisation_id: string;
  service_user_id: string;
  title: string;
  status: CarePlanStatus;
  plan_owner_id: string | null;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CarePlanSectionRecord = {
  id: string;
  care_plan_id: string;
  section_key: CarePlanSectionKey;
  content: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CarePlanWithSections = CarePlanRecord & {
  sections: CarePlanSectionRecord[];
};

export type CarePlanEditorSection = {
  key: CarePlanSectionKey;
  title: string;
  placeholder: string;
  displayOrder: number;
  content: string;
};

export type CarePlanEditorValues = {
  title: string;
  planOwnerId: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  sections: CarePlanEditorSection[];
};

export type SaveCarePlanSectionInput = {
  sectionKey: CarePlanSectionKey;
  content: string;
  displayOrder: number;
};

export type SaveCarePlanInput = {
  title: string;
  planOwnerId: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  sections: SaveCarePlanSectionInput[];
};

export type CarePlanPermissions = {
  canEdit: boolean;
  canPublish: boolean;
  canArchive: boolean;
};

export function isCarePlanStatus(value: string): value is CarePlanStatus {
  return value === "draft" || value === "published" || value === "archived";
}