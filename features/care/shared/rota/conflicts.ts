import type { RotaConflict, RotaShift, RotaStaff } from "./types";

function shiftWindow(shift: RotaShift) {
  const start = new Date(`${shift.shift_date}T${shift.start_time}`);
  const end = new Date(`${shift.shift_date}T${shift.end_time}`);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}

export function findRotaConflicts(
  shifts: RotaShift[],
  staff: RotaStaff[],
): RotaConflict[] {
  const staffNames = new Map(
    staff.map((member) => [member.id, member.full_name || "Unnamed staff"]),
  );
  const byStaff = new Map<string, RotaShift[]>();

  for (const shift of shifts.filter((item) => item.status !== "cancelled")) {
    for (const assignment of shift.rota_shift_assignments ?? []) {
      if (assignment.assignment_type === "annual_leave") continue;
      const current = byStaff.get(assignment.staff_user_id) ?? [];
      current.push(shift);
      byStaff.set(assignment.staff_user_id, current);
    }
  }

  const conflicts: RotaConflict[] = [];

  for (const [staffUserId, assignedShifts] of byStaff.entries()) {
    const ordered = [...assignedShifts].sort((a, b) =>
      shiftWindow(a).start.getTime() - shiftWindow(b).start.getTime(),
    );

    for (let index = 0; index < ordered.length; index += 1) {
      const first = ordered[index];
      const firstWindow = shiftWindow(first);

      for (let nextIndex = index + 1; nextIndex < ordered.length; nextIndex += 1) {
        const second = ordered[nextIndex];
        const secondWindow = shiftWindow(second);

        if (secondWindow.start >= firstWindow.end) break;
        if (firstWindow.start < secondWindow.end && secondWindow.start < firstWindow.end) {
          conflicts.push({
            staffUserId,
            staffName: staffNames.get(staffUserId) || "Unnamed staff",
            firstShiftId: first.id,
            secondShiftId: second.id,
          });
        }
      }
    }
  }

  return conflicts;
}
