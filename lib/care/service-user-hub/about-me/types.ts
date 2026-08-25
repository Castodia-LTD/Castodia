export type ServiceUserAboutMe = {
  id: string;
  service_user_id: string;

  about_me: string | null;

  preferred_name: string | null;
  gender_identity: string | null;
  nhs_number: string | null;
  religion: string | null;
  nationality: string | null;
  languages: string[];

  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;

  key_worker_name: string | null;
  gp_name: string | null;

  likes: string[];
  dislikes_triggers: string[];

  preferred_communication: string | null;
  hearing_notes: string | null;
  vision_notes: string | null;
  communication_notes: string | null;

  important_information: string[];

  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type AboutMeFormValues = {
  about_me: string;

  preferred_name: string;
  gender_identity: string;
  nhs_number: string;
  religion: string;
  nationality: string;
  languages: string[];

  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;

  key_worker_name: string;
  gp_name: string;

  likes: string[];
  dislikes_triggers: string[];

  preferred_communication: string;
  hearing_notes: string;
  vision_notes: string;
  communication_notes: string;

  important_information: string[];
};

export const emptyAboutMeFormValues: AboutMeFormValues = {
  about_me: "",

  preferred_name: "",
  gender_identity: "",
  nhs_number: "",
  religion: "",
  nationality: "",
  languages: [],

  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_phone: "",

  key_worker_name: "",
  gp_name: "",

  likes: [],
  dislikes_triggers: [],

  preferred_communication: "",
  hearing_notes: "",
  vision_notes: "",
  communication_notes: "",

  important_information: [],
};