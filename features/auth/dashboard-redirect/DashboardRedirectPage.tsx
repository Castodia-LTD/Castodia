"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CASTODIA_PRODUCTS } from "@/config/products";
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

      switch (profile?.role) {
        case "castodia_owner":
        case "castodia_admin":
          router.replace(CASTODIA_PRODUCTS.core.home);
          return;
        case "manager":
          router.replace(CASTODIA_PRODUCTS.care.managerHome);
          return;
        case "support":
          router.replace(CASTODIA_PRODUCTS.care.supportHome);
          return;
        default:
          router.replace("/");
      }
    }

    void redirectByRole();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      Redirecting...
    </main>
  );
}
