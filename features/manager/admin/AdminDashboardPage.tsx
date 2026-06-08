import AdminMenuCard from "@/components/admin/AdminMenuCard";
import { adminMenuItems } from "@/lib/admin/constants";
import { PageContainer, PageHeader } from "@/components/layouts";

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Admin"
        subtitle="Manage staff, service users, permissions and organisation setup."
      />

      <div className="grid gap-4">
        {adminMenuItems.map((item) => (
          <AdminMenuCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </PageContainer>
  );
}