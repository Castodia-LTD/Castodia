import type {
  StaffMember,
  StaffSupervision,
} from "@/lib/admin/supervisions/types";

import {
  CastodiaBadge,
  CastodiaCard,
  CastodiaTable,
  CastodiaRow,
  CastodiaCell,
} from "@/components/castodia";

type SupervisionStatus = "current" | "due-soon" | "overdue" | "no-record";

type MatrixRow = {
  staff: StaffMember;
  lastSupervision: StaffSupervision | null;
  nextDueDate: string | null;
  status: SupervisionStatus;
};

function getStatus(nextDueDate: string | null): SupervisionStatus {
  if (!nextDueDate) return "no-record";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(nextDueDate);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 30) return "due-soon";
  return "current";
}

function getStatusLabel(status: SupervisionStatus) {
  if (status === "current") return "Current";
  if (status === "due-soon") return "Due soon";
  if (status === "overdue") return "Overdue";
  return "No record";
}

function getStatusVariant(status: SupervisionStatus) {
  if (status === "current") return "success";
  if (status === "due-soon") return "warning";
  if (status === "overdue") return "danger";
  return "neutral";
}

type Props = {
  staff: StaffMember[];
  supervisions: StaffSupervision[];
};

export default function SupervisionMatrix({ staff, supervisions }: Props) {
  const rows: MatrixRow[] = staff.map((person) => {
    const staffSupervisions = supervisions
      .filter((supervision) => supervision.staff_id === person.id)
      .sort(
        (a, b) =>
          new Date(b.supervision_date).getTime() -
          new Date(a.supervision_date).getTime()
      );

    const lastSupervision = staffSupervisions[0] || null;
    const nextDueDate = lastSupervision?.next_supervision_date || null;

    return {
      staff: person,
      lastSupervision,
      nextDueDate,
      status: getStatus(nextDueDate),
    };
  });

  return (
    <CastodiaCard padding="none">
      <CastodiaTable
        headers={[
          "Staff member",
          "Last supervision",
          "Next due",
          "Status",
        ]}
      >
        {rows.map((row) => (
          <CastodiaRow key={row.staff.id}>
            <CastodiaCell>
              <p className="font-semibold text-slate-950">
                {row.staff.full_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {row.staff.role}
              </p>
            </CastodiaCell>

            <CastodiaCell>
              {row.lastSupervision
                ? new Date(
                    row.lastSupervision.supervision_date
                  ).toLocaleDateString("en-GB")
                : "No supervision recorded"}
            </CastodiaCell>

            <CastodiaCell>
              {row.nextDueDate
                ? new Date(row.nextDueDate).toLocaleDateString("en-GB")
                : "Not set"}
            </CastodiaCell>

            <CastodiaCell>
              <CastodiaBadge variant={getStatusVariant(row.status)}>
                {getStatusLabel(row.status)}
              </CastodiaBadge>
            </CastodiaCell>
          </CastodiaRow>
        ))}
      </CastodiaTable>
    </CastodiaCard>
  );
}