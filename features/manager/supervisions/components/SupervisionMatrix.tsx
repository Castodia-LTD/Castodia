import type { StaffMember, StaffSupervision } from "@/lib/admin/supervisions/types";

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

function getStatusClass(status: SupervisionStatus) {
  if (status === "current") return "bg-emerald-500/20 text-emerald-300";
  if (status === "due-soon") return "bg-amber-500/20 text-amber-300";
  if (status === "overdue") return "bg-red-500/20 text-red-300";
  return "bg-slate-500/20 text-slate-300";
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-white/10 bg-slate-950/60 text-sm text-slate-400">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Last Supervision</th>
              <th className="p-4">Next Due</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.staff.id}
                className="border-b border-white/10 last:border-b-0"
              >
                <td className="p-4">
                  <p className="font-semibold text-white">
                    {row.staff.full_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {row.staff.role}
                  </p>
                </td>

                <td className="p-4 text-slate-300">
                  {row.lastSupervision
                    ? new Date(
                        row.lastSupervision.supervision_date
                      ).toLocaleDateString("en-GB")
                    : "No supervision recorded"}
                </td>

                <td className="p-4 text-slate-300">
                  {row.nextDueDate
                    ? new Date(row.nextDueDate).toLocaleDateString("en-GB")
                    : "Not set"}
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      row.status
                    )}`}
                  >
                    {getStatusLabel(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}