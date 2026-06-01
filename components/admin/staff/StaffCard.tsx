import type { Staff } from "@/lib/admin/staff/types";

type Props = {
  person: Staff;
};

export default function StaffCard({ person }: Props) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5">
      <h2 className="text-xl font-semibold">{person.full_name}</h2>

      <p className="text-slate-400">
        {person.role === "manager" ? "Manager" : "Support Worker"}
      </p>
    </div>
  );
}