import { useState } from "react";
import CompetencyActionRow from "./CompetencyActionRow";

import {
  competencyOutcomes,
  knowledgeChecks,
  practicalChecks,
} from "@/lib/care/admin/competencies/constants";

import type {
  CompetencyAction,
  StaffMember,
} from "@/lib/care/admin/competencies/types";

import { CastodiaButton } from "@/components/castodia";

type Props = {
  staff: StaffMember[];
  onCreate: (values: {
    staffId: string;
    assessmentDate: string;
    reviewDate: string;
    outcome: string;
    strengths: string;
    developmentAreas: string;
    actions: CompetencyAction[];
    knowledgeResults: Record<string, boolean>;
    practicalResults: Record<string, boolean>;
  }) => Promise<void>;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function CompetencyForm({ staff, onCreate }: Props) {
  const [staffId, setStaffId] = useState("");
  const [saving, setSaving] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [outcome, setOutcome] = useState("Competent");
  const [strengths, setStrengths] = useState("");
  const [developmentAreas, setDevelopmentAreas] = useState("");
  const [actions, setActions] = useState<CompetencyAction[]>([]);
  const [knowledgeResults, setKnowledgeResults] = useState<
    Record<string, boolean>
  >({});
  const [practicalResults, setPracticalResults] = useState<
    Record<string, boolean>
  >({});

  function addAction() {
    setActions([
      ...actions,
      {
        action: "",
        responsible_person: "",
        due_date: "",
        completed: false,
      },
    ]);
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);

    try {
      await onCreate({
        staffId,
        assessmentDate,
        reviewDate,
        outcome,
        strengths,
        developmentAreas,
        actions,
        knowledgeResults,
        practicalResults,
      });

      setStaffId("");
      setAssessmentDate("");
      setReviewDate("");
      setOutcome("Competent");
      setStrengths("");
      setDevelopmentAreas("");
      setActions([]);
      setKnowledgeResults({});
      setPracticalResults({});

      alert("Medication competency logged successfully.");
    } finally {
      setSaving(false);
    }
  }

  function handleAssessmentDateChange(value: string) {
    setAssessmentDate(value);

    if (value) {
      const review = new Date(value);
      review.setFullYear(review.getFullYear() + 1);
      setReviewDate(review.toISOString().slice(0, 10));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Medication Competency Assessment
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record knowledge checks, practical observations and any follow-up
          actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Staff member
          </label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select staff member</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Outcome
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className={inputClass}
          >
            {competencyOutcomes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Assessment date
          </label>
          <input
            type="date"
            value={assessmentDate}
            onChange={(e) => handleAssessmentDateChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Review date
          </label>
          <input
            type="date"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            Knowledge Assessment
          </h3>

          <div className="mt-4 space-y-3">
            {knowledgeChecks.map((check) => (
              <label
                key={check}
                className="flex items-center gap-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={knowledgeResults[check] || false}
                  onChange={(e) =>
                    setKnowledgeResults({
                      ...knowledgeResults,
                      [check]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-950"
                />
                {check}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            Practical Observation
          </h3>

          <div className="mt-4 space-y-3">
            {practicalChecks.map((check) => (
              <label
                key={check}
                className="flex items-center gap-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={practicalResults[check] || false}
                  onChange={(e) =>
                    setPracticalResults({
                      ...practicalResults,
                      [check]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-950"
                />
                {check}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Strengths observed
          </label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Strengths observed"
            className={textareaClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Areas for development
          </label>
          <textarea
            value={developmentAreas}
            onChange={(e) => setDevelopmentAreas(e.target.value)}
            placeholder="Areas for development"
            className={textareaClass}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Action Plan
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add follow-up actions where further development is required.
            </p>
          </div>

          <CastodiaButton variant="secondary" size="sm" onClick={addAction}>
            Add Action
          </CastodiaButton>
        </div>

        {actions.length > 0 && (
          <div className="mt-4 space-y-3">
            {actions.map((action, index) => (
              <CompetencyActionRow
                key={index}
                action={action}
                onChange={(updatedAction) =>
                  setActions(
                    actions.map((existing, i) =>
                      i === index ? updatedAction : existing
                    )
                  )
                }
                onRemove={() =>
                  setActions(actions.filter((_, i) => i !== index))
                }
              />
            ))}
          </div>
        )}
      </div>

      <CastodiaButton disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save Competency"}
      </CastodiaButton>
    </div>
  );
}