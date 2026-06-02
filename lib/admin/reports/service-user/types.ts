export type ServiceUser = {
  id: string;
  first_name?: string | null;
  surname?: string | null;
  full_name?: string | null;
};

export type CareAudit = {
  id: string;
  name: string;
  lastWashed: string;
  lastClothingChange: string;
};