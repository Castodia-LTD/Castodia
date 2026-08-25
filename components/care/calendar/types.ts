export type CalendarEventCategory =
  | "appointment"
  | "supervision"
  | "review"
  | "meeting"
  | "training"
  | "audit"
  | "general";

export type CalendarEventStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

export type CalendarEvent = {
  id: string;
  title: string;
  category: CalendarEventCategory;
  status: CalendarEventStatus;

  startAt: string;
  endAt: string | null;
  allDay: boolean;

  description?: string | null;
  location?: string | null;

  serviceUserId?: string | null;
  serviceUserName?: string | null;

  staffId?: string | null;
  staffName?: string | null;
};