"use client";

import Link from "next/link";
import { AlertTriangle, Plus, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { useSafeguardingDashboard } from "@/hooks/safeguarding/useSafeguardingDashboard";
import type { CaseRiskLevel, CaseStatus } from "@/lib/safeguarding/types";

import {
  Button,
  EmptyState,
  ErrorBanner,
  Input,
  Panel,
  Select,
  StatusPill,
  formatDateTime,
} from "./ui";

export default function SafeguardingDashboard() {
  const { cases, loading, error, reload } = useSafeguardingDashboard();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const [risk, setRisk] = useState<CaseRiskLevel | "all">("all");

  const filteredCases = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return cases.filter((safeguardingCase) => {
      const matchesSearch = !searchValue || [
        safeguardingCase.case_reference,
        safeguardingCase.title,
        safeguardingCase.service_user?.full_name,
        safeguardingCase.service_user?.house_name,
      ].some((value) => value?.toLowerCase().includes(searchValue));

      return matchesSearch
        && (status === "all" || safeguardingCase.status === status)
        && (risk === "all" || safeguardingCase.risk_level === risk);
    });
  }, [cases, risk, search, status]);

  const summary = useMemo(() => ({
    active: cases.filter((item) => item.status !== "closed").length,
    highRisk: cases.filter((item) => item.status !== "closed" && ["high", "critical"].includes(item.risk_level)).length,
    referred: cases.filter((item) => item.status === "referred").length,
    closed: cases.filter((item) => item.status === "closed").length,
  }), [cases]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <ShieldCheck size={23} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Safeguarding</h1>
              <p className="mt-1 text-sm text-slate-500">Private case oversight, actions and evidence.</p>
            </div>
          </div>
        </div>

        <Link
          href="/manager/safeguarding/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <Plus size={17} aria-hidden="true" />
          New safeguarding case
        </Link>
      </header>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active cases" value={summary.active} tone="teal" />
        <SummaryCard label="High or critical risk" value={summary.highRisk} tone="rose" />
        <SummaryCard label="Referred" value={summary.referred} tone="violet" />
        <SummaryCard label="Closed" value={summary.closed} tone="slate" />
      </div>

      <Panel>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Case register</h2>
            <p className="mt-1 text-sm text-slate-500">All safeguarding cases in your organisation.</p>
          </div>
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </Button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative block">
            <span className="sr-only">Search safeguarding cases</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference, person or case"
              className="pl-10"
            />
          </label>
          <Select value={status} onChange={(event) => setStatus(event.target.value as CaseStatus | "all")}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="referred">Referred</option>
            <option value="investigating">Investigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="closed">Closed</option>
          </Select>
          <Select value={risk} onChange={(event) => setRisk(event.target.value as CaseRiskLevel | "all")}>
            <option value="all">All risk levels</option>
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
            <option value="critical">Critical risk</option>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading safeguarding cases">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {!loading && filteredCases.length === 0 ? (
          <EmptyState>
            {cases.length === 0
              ? "No safeguarding cases have been opened yet."
              : "No cases match the current filters."}
          </EmptyState>
        ) : null}

        {!loading && filteredCases.length > 0 ? (
          <div className="space-y-3">
            {filteredCases.map((safeguardingCase) => (
              <Link
                key={safeguardingCase.id}
                href={`/manager/safeguarding/${safeguardingCase.id}`}
                className="group block rounded-2xl border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-teal-700">{safeguardingCase.case_reference}</span>
                      <StatusPill value={safeguardingCase.status} />
                      <StatusPill value={safeguardingCase.risk_level} />
                    </div>
                    <h3 className="mt-2 truncate text-base font-semibold text-slate-950 group-hover:text-teal-800">
                      {safeguardingCase.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {safeguardingCase.service_user?.full_name ?? "Unknown service user"}
                      {safeguardingCase.service_user?.house_name ? ` · ${safeguardingCase.service_user.house_name}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-left text-xs text-slate-500 md:text-right">
                    <p>Concern raised {formatDateTime(safeguardingCase.date_concern_raised)}</p>
                    <p className="mt-1">Updated {formatDateTime(safeguardingCase.updated_at)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "rose" | "violet" | "slate";
}) {
  const colours = {
    teal: "bg-teal-50 text-teal-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <Panel className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colours[tone]}`}>
        <AlertTriangle size={19} aria-hidden="true" />
      </span>
    </Panel>
  );
}
