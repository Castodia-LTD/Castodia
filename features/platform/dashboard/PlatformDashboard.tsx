import { CastodiaPageShell } from "@/components/castodia";

export default function PlatformDashboard() {
  return (
    <CastodiaPageShell
      title="Platform Dashboard"
      description="Manage organisations, admin users, issues and platform settings."
      maxWidth="full"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Castodia Platform
        </h2>

        <p className="mt-2 text-slate-600">
          Platform admin portal is connected.
        </p>
      </div>
    </CastodiaPageShell>
  );
}