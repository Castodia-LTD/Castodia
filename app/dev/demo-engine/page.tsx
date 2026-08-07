"use client";

import { useState } from "react";

export default function DemoEnginePage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runEngine() {
    setRunning(true);

    try {
      const response = await fetch("/api/demo-engine/run", {
        method: "POST",
      });

      const json = await response.json();

      setResult(json);
    } catch (error) {
      console.error(error);
      setResult(error);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="p-10 space-y-6">
      <button
        onClick={runEngine}
        disabled={running}
        className="rounded-xl bg-cyan-600 px-6 py-3 text-white"
      >
        {running ? "Running..." : "Run Demo Engine"}
      </button>

      <pre className="rounded-xl bg-slate-900 p-6 text-white overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}