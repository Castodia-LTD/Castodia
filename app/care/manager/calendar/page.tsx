import { CastodiaCalendar } from "@/components/care/calendar/CastodiaCalendar";
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
}
