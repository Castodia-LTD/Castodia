"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createSafeguardingCase,
  listSafeguardingServiceUsers,
} from "@/lib/care/safeguarding/api";
import { CASE_CATEGORIES, CASE_RISK_LEVELS } from "@/lib/care/safeguarding/constants";
import type {
  CaseCategory,
  CaseRiskLevel,
  ServiceUserOption,
} from "@/lib/care/safeguarding/types";

import {
  Button,
  ErrorBanner,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
  toDateTimeLocal,
  toIsoDateTime,
} from "./ui";

export default function NewSafeguardingCaseForm() {
  const router = useRouter();
  const [serviceUsers, setServiceUsers] = useState<ServiceUserOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUserId, setServiceUserId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CaseCategory>("neglect");
  const [riskLevel, setRiskLevel] = useState<CaseRiskLevel>("medium");
  const [dateConcernRaised, setDateConcernRaised] = useState(toDateTimeLocal());
  const [concernSource, setConcernSource] = useState("staff_observation");
  const [reportedByName, setReportedByName] = useState("");
  const [location, setLocation] = useState("");
  const [personAllegedResponsible, setPersonAllegedResponsible] = useState("");
  const [concernSummary, setConcernSummary] = useState("");
  const [immediateActions, setImmediateActions] = useState("");
  const [desiredOutcomes, setDesiredOutcomes] = useState("");

  useEffect(() => {
    let mounted = true;
    void listSafeguardingServiceUsers()
      .then((options) => {
        if (mounted) setServiceUsers(options);
      })
      .catch((loadError: unknown) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load service users.");
        }
      })
      .finally(() => {
        if (mounted) setLoadingOptions(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const caseId = await createSafeguardingCase({
        serviceUserId,
        title,
        category,
        riskLevel,
        concernSummary,
        dateConcernRaised: toIsoDateTime(dateConcernRaised),
        concernSource,
        immediateActions,
        desiredOutcomes,
        reportedByName,
        personAllegedResponsible,
        location,
      });
      router.push(`/care/manager/safeguarding/${caseId}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The safeguarding case could not be created.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <ShieldPlus size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">New safeguarding case</h1>
            <p className="mt-1 text-sm text-slate-500">Record the concern and immediate protective response.</p>
          </div>
        </div>
        <Link
          href="/care/manager/safeguarding"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to safeguarding
        </Link>
      </header>

      {error ? <ErrorBanner message={error} /> : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel>
          <h2 className="text-lg font-semibold text-slate-950">Case details</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Service user" required>
              <Select
                required
                value={serviceUserId}
                onChange={(event) => setServiceUserId(event.target.value)}
                disabled={loadingOptions}
              >
                <option value="">{loadingOptions ? "Loading service users…" : "Select a service user"}</option>
                {serviceUsers.map((serviceUser) => (
                  <option key={serviceUser.id} value={serviceUser.id}>
                    {serviceUser.full_name} · {serviceUser.house_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Concern date and time" required>
              <Input
                required
                type="datetime-local"
                value={dateConcernRaised}
                onChange={(event) => setDateConcernRaised(event.target.value)}
              />
            </Field>
            <Field label="Case title" required>
              <Input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short, factual title"
              />
            </Field>
            <Field label="Category" required>
              <Select value={category} onChange={(event) => setCategory(event.target.value as CaseCategory)}>
                {CASE_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Risk level" required>
              <Select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as CaseRiskLevel)}>
                {CASE_RISK_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Concern source" required>
              <Select value={concernSource} onChange={(event) => setConcernSource(event.target.value)}>
                <option value="staff_observation">Staff observation</option>
                <option value="service_user_disclosure">Service-user disclosure</option>
                <option value="family_or_representative">Family or representative</option>
                <option value="professional_referral">Professional referral</option>
                <option value="anonymous">Anonymous</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Reported by">
              <Input value={reportedByName} onChange={(event) => setReportedByName(event.target.value)} placeholder="Name or anonymous" />
            </Field>
            <Field label="Location">
              <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where the concern arose" />
            </Field>
            <Field label="Person alleged responsible">
              <Input value={personAllegedResponsible} onChange={(event) => setPersonAllegedResponsible(event.target.value)} placeholder="If known" />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-slate-950">Concern and response</h2>
          <div className="mt-5 space-y-5">
            <Field label="Concern summary" required hint="Use factual, person-centred language and distinguish observation from opinion.">
              <Textarea required value={concernSummary} onChange={(event) => setConcernSummary(event.target.value)} />
            </Field>
            <Field label="Immediate protective actions">
              <Textarea value={immediateActions} onChange={(event) => setImmediateActions(event.target.value)} />
            </Field>
            <Field label="Desired outcomes">
              <Textarea value={desiredOutcomes} onChange={(event) => setDesiredOutcomes(event.target.value)} />
            </Field>
          </div>
        </Panel>

        <div className="flex justify-end gap-3">
          <Link href="/care/manager/safeguarding" className="inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </Link>
          <Button type="submit" disabled={saving || loadingOptions || serviceUsers.length === 0}>
            {saving ? "Creating case…" : "Create safeguarding case"}
          </Button>
        </div>
      </form>
    </div>
  );
}
