"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-2xl shadow-blue-900/40">
            <span className="text-4xl font-bold text-white">C</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Castodia</h1>
          <p className="mt-2 text-slate-300">Care records. Protected.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-300">
            Sign in to continue to your dashboard.
          </p>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-white outline-none placeholder:text-slate-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-white outline-none placeholder:text-slate-500"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-bold text-white shadow-lg shadow-blue-900/30"
            >
              Log in
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Powered by Castodia
        </p>
      </div>
    </main>
  );
}