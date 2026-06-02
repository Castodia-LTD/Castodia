export type StaffMember = {
  id: string;
  full_name: string;
  role: string;
};

export type SupervisionAction = {
  action: string;
  responsible_person: string;
  due_date: string;
  completed: boolean;
};

export type StaffSupervision = {
  id: string;

  organisation_id: string;

  staff_id: string;
  supervisor_id: string;

  supervision_date: string;
  supervision_type: string;

  wellbeing_notes: string | null;
  performance_notes: string | null;

  training_discussed: string | null;

  concerns_discussed: string | null;

  previous_actions_review: string | null;

  staff_comments: string | null;

  manager_summary: string | null;

  next_supervision_date: string | null;

  actions: SupervisionAction[];

  signed_by_supervisor: boolean;
  signed_by_staff: boolean;

  created_at: string;
};