import { useState } from "react";

import CompetencyActionRow from "./CompetencyActionRow";

import {
  competencyOutcomes,
  knowledgeChecks,
  practicalChecks,
} from "@/lib/admin/competencies/constants";

import type {
  CompetencyAction,
  StaffMember,
} from "@/lib/admin/competencies/types";

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

export default function CompetencyForm({
  staff,
  onCreate,
}: Props) {
  const [staffId, setStaffId] = useState("");

  const [assessmentDate, setAssessmentDate] =
    useState("");

  const [reviewDate, setReviewDate] =
    useState("");

  const [outcome, setOutcome] =
    useState("Competent");

  const [strengths, setStrengths] =
    useState("");

  const [developmentAreas, setDevelopmentAreas] =
    useState("");

  const [actions, setActions] = useState<
    CompetencyAction[]
  >([]);

  const [knowledgeResults, setKnowledgeResults] =
    useState<Record<string, boolean>>({});

  const [practicalResults, setPracticalResults] =
    useState<Record<string, boolean>>({});

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

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-bold">
        Medication Competency Assessment
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={staffId}
          onChange={(e) =>
            setStaffId(e.target.value)
          }
          className="rounded-2xl bg-slate-900 p-4"
        >
          <option value="">
            Select Staff Member
          </option>

          {staff.map((person) => (
            <option
              key={person.id}
              value={person.id}
            >
              {person.full_name}
            </option>
          ))}
        </select>

        <select
          value={outcome}
          onChange={(e) =>
            setOutcome(e.target.value)
          }
          className="rounded-2xl bg-slate-900 p-4"
        >
          {competencyOutcomes.map((value) => (
            <option
              key={value}
              value={value}
            >
              {value}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={assessmentDate}
          onChange={(e) =>
            setAssessmentDate(e.target.value)
          }
          className="rounded-2xl bg-slate-900 p-4"
        />

        <input
          type="date"
          value={reviewDate}
          onChange={(e) =>
            setReviewDate(e.target.value)
          }
          className="rounded-2xl bg-slate-900 p-4"
        />
      </div>

      <div>
        <h3 className="font-semibold">
          Knowledge Assessment
        </h3>

        <div className="mt-3 space-y-3">
          {knowledgeChecks.map((check) => (
            <label
              key={check}
              className="flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={
                  knowledgeResults[check] ||
                  false
                }
                onChange={(e) =>
                  setKnowledgeResults({
                    ...knowledgeResults,
                    [check]:
                      e.target.checked,
                  })
                }
              />

              {check}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">
          Practical Observation
        </h3>

        <div className="mt-3 space-y-3">
          {practicalChecks.map((check) => (
            <label
              key={check}
              className="flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={
                  practicalResults[check] ||
                  false
                }
                onChange={(e) =>
                  setPracticalResults({
                    ...practicalResults,
                    [check]:
                      e.target.checked,
                  })
                }
              />

              {check}
            </label>
          ))}
        </div>
      </div>

      <textarea
        value={strengths}
        onChange={(e) =>
          setStrengths(e.target.value)
        }
        placeholder="Strengths observed"
        className="min-h-24 w-full rounded-2xl bg-slate-900 p-4"
      />

      <textarea
        value={developmentAreas}
        onChange={(e) =>
          setDevelopmentAreas(e.target.value)
        }
        placeholder="Areas for development"
        className="min-h-24 w-full rounded-2xl bg-slate-900 p-4"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Action Plan
          </h3>

          <button
            onClick={addAction}
            className="rounded-xl bg-cyan-500/20 px-4 py-2 text-cyan-200"
          >
            Add Action
          </button>
        </div>

        {actions.map((action, index) => (
          <CompetencyActionRow
            key={index}
            action={action}
            onChange={(updatedAction) =>
              setActions(
                actions.map((existing, i) =>
                  i === index
                    ? updatedAction
                    : existing
                )
              )
            }
            onRemove={() =>
              setActions(
                actions.filter(
                  (_, i) => i !== index
                )
              )
            }
          />
        ))}
      </div>

      <button
        onClick={() =>
          onCreate({
            staffId,
            assessmentDate,
            reviewDate,
            outcome,
            strengths,
            developmentAreas,
            actions,
            knowledgeResults,
            practicalResults,
          })
        }
        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
      >
        Save Competency
      </button>
    </div>
  );
}