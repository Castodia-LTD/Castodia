export type StaffMember = {
  id: string;
  full_name: string;
  role: string;
};

export type CompetencyAction = {
  action: string;
  responsible_person: string;
  due_date: string;
  completed: boolean;
};

export type StaffCompetency = {
  id: string;
  organisation_id: string;
  staff_id: string;
  assessor_id: string | null;

  competency_type: string;
  assessment_date: string;
  review_date: string | null;

  knowledge_checks: Record<string, boolean>;
  practical_checks: Record<string, boolean>;

  strengths: string | null;
  development_areas: string | null;
  actions: CompetencyAction[];

  outcome: string;
  assessor_signed: boolean;
  staff_signed: boolean;

  created_at: string;
};