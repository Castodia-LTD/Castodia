"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectByRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "manager") {
        router.replace("/manager/dashboard");
      } else {
        router.replace("/support/dashboard");
      }
    }

    redirectByRole();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      Redirecting...
    </main>
  );
}