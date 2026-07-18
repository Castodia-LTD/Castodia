import Link from "next/link";

const staffOptions = [
  {
    title: "Competencies",
    description: "Review and manage staff competency assessments.",
    href: "/manager/staff/competencies",
  },
  {
    title: "Supervisions",
    description: "Manage staff supervision records and upcoming reviews.",
    href: "/manager/staff/supervisions",
  },
];

export default function ManagerStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Staff
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Manage staff competencies and supervisions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {staffOptions.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {option.title}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {option.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}