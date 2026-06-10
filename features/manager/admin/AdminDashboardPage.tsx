import Link from "next/link";
import { adminMenuItems } from "@/lib/admin/constants";
import { CastodiaPageShell, CastodiaCard } from "@/components/castodia";

export default function AdminDashboardPage() {
  return (
    <CastodiaPageShell
      title="Admin"
      description="Manage staff, service users, permissions and organisation setup."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminMenuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <CastodiaCard interactive className="h-full">
              <h2 className="text-lg font-semibold text-slate-950">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </CastodiaCard>
          </Link>
        ))}
      </div>
    </CastodiaPageShell>
  );
}