"use client";

import { useState } from "react";
import {
  Database,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";

type DemoEngineResult = {
  runId: string;
  startedAt: string;
  completedAt: string;
  serviceUsersProcessed: number;
  timelineEntriesCreated: number;
  timelineEntriesRemoved: number;
  handoversCreated: number;
  warnings: string[];
};

export default function DemoEngineRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] =
    useState<DemoEngineResult | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "/api/platform/demo-engine",
        {
          method: "POST",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "The Demo Engine could not be run.",
        );
      }

      setResult(payload.result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The Demo Engine could not be run.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <Database size={22} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Demo Data Engine
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Generate a fresh set of demonstration
              timeline entries and handover data for the
              configured Castodia demo organisation.
            </p>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                Existing generated demo data will be
                replaced.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                The engine removes previously generated
                timeline entries before creating a fresh
                dataset.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Running Demo Engine...
                </>
              ) : result ? (
                <>
                  <RefreshCw size={18} />
                  Run Again
                </>
              ) : (
                <>
                  <Play size={18} />
                  Run Demo Engine
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="font-medium text-rose-900">
            Demo Engine failed
          </p>

          <p className="mt-1 text-sm text-rose-800">
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="font-semibold text-emerald-900">
            Demo Engine complete
          </h3>

          <p className="mt-1 text-sm text-emerald-800">
            The demonstration dataset was regenerated
            successfully.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard
              label="Entries created"
              value={result.timelineEntriesCreated}
            />

            <ResultCard
              label="Entries removed"
              value={result.timelineEntriesRemoved}
            />

            <ResultCard
              label="Service users"
              value={result.serviceUsersProcessed}
            />

            <ResultCard
              label="Handovers"
              value={result.handoversCreated}
            />
          </div>

          {result.warnings.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-white/70 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Warnings
              </p>

              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                {result.warnings.map(
                  (warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}