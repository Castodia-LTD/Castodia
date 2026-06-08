import { PageContainer, PageHeader, SectionCard } from "@/components/layouts";

export default function ManagerDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Manager Dashboard"
        subtitle="Oversight, reporting and management tools for your organisation."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard>
          <h2 className="text-xl font-bold text-white">Reports</h2>
          <p className="mt-2 text-sm text-slate-400">
            Review service user, staff and organisational data.
          </p>
        </SectionCard>

        <SectionCard>
          <h2 className="text-xl font-bold text-white">Audits</h2>
          <p className="mt-2 text-sm text-slate-400">
            Monitor quality, compliance and care recording standards.
          </p>
        </SectionCard>

        <SectionCard>
          <h2 className="text-xl font-bold text-white">Staff</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage staff access, roles, supervisions and competencies.
          </p>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SectionCard>
          <h2 className="text-lg font-semibold text-white">
            Service User Oversight
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Review profiles, records, incidents and care documentation across
            your organisation.
          </p>
        </SectionCard>

        <SectionCard>
          <h2 className="text-lg font-semibold text-white">
            Governance Roadmap
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Care Plans, Risk Assessments, MCA, DoLS and audit workflows will sit
            within the manager portal.
          </p>
        </SectionCard>
      </div>
    </PageContainer>
  );
}