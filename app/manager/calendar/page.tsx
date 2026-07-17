import { CastodiaCalendar } from "@/components/calendar/CastodiaCalendar";
import { CastodiaPageShell } from "@/components/castodia";

export default function ManagerCalendarPage() {
  return (
    <CastodiaPageShell
      title="Calendar"
      description="Manage appointments, meetings, supervisions, reviews and other operational events."
    >
      <CastodiaCalendar />
    </CastodiaPageShell>
  );
}export type CalendarEventCategory =
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