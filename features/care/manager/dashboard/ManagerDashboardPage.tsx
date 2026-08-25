"use client";

import { ContentWidth } from "@/components/layout";
import { IOSManagerDashboard } from "@/components/native/ios/care/manager/IOSManagerDashboard";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { useCurrentProfile } from "@/hooks/shared/useCurrentProfile";

export default function ManagerDashboardPage() {
  const { isIOS, nativePlatformLoaded } = useNativePlatform();
  const { name } = useCurrentProfile();

  if (!nativePlatformLoaded) return null;
  if (isIOS) return <IOSManagerDashboard name={name} />;

  return (
    <ContentWidth>
      <div className="py-6">
        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-7 py-9 shadow-sm sm:px-9">
          <p className="text-sm font-semibold text-cyan-700">Manager Portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {name ? `Welcome, ${name}` : "Welcome"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Use the navigation menu to access Insights and your management tools.
          </p>
        </section>
      </div>
    </ContentWidth>
  );
}
