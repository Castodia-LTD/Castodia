import {
  CastodiaPageShell,
  CastodiaCard,
  CastodiaButton,
} from "@/components/castodia";

export default function ManagerDashboardPage() {
  return (
    <CastodiaPageShell
      title="Manager Dashboard"
      description="Oversight, reporting and management tools for your organisation."
      actions={
        <CastodiaButton variant="primary">
          View reports
        </CastodiaButton>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <CastodiaCard interactive>
          <p className="text-sm font-medium text-slate-500">Management</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Reports</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review service user, staff and organisational data.
          </p>
        </CastodiaCard>

        <CastodiaCard interactive>
          <p className="text-sm font-medium text-slate-500">Quality</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Audits</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Monitor quality, compliance and care recording standards.
          </p>
        </CastodiaCard>

        <CastodiaCard interactive>
          <p className="text-sm font-medium text-slate-500">Workforce</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Staff</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage staff access, roles, supervisions and competencies.
          </p>
        </CastodiaCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CastodiaCard>
          <h2 className="text-lg font-semibold text-slate-950">
            Service User Oversight
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review profiles, records, incidents and care documentation across
            your organisation.
          </p>
        </CastodiaCard>

        <CastodiaCard>
          <h2 className="text-lg font-semibold text-slate-950">
            Governance Roadmap
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Care Plans, Risk Assessments, MCA, DoLS and audit workflows will sit
            within the manager portal.
          </p>
        </CastodiaCard>
      </div>
    </CastodiaPageShell>
  );
}