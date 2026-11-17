import Link from "next/link";
import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";

export default function Page() {
  return (
    <CastodiaPageShell title="Residential Care Rotas" description="Home and unit staffing coverage is being developed." maxWidth="wide">
      <CastodiaCard className="p-6">
        <p className="text-sm text-slate-600">Residential care rota management is not yet connected. No shifts can be scheduled here yet.</p>
        <Link href="/care/manager/rota" className="mt-4 inline-block text-sm font-semibold text-cyan-700">Back to rota service selection</Link>
      </CastodiaCard>
    </CastodiaPageShell>
  );
}
