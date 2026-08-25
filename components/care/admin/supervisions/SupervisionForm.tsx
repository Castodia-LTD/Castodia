import { useState } from "react";
import ActionRow from "./ActionRow";
import { supervisionTypes } from "@/lib/care/admin/supervisions/constants";
import type {
  StaffMember,
  SupervisionAction,
} from "@/lib/care/admin/supervisions/types";

type Props = {
  staff: StaffMember[];
  onCreate: (values: {
    staffId: string;
    supervisionDate: string;
    supervisionType: string;
    wellbeingNotes: string;
    performanceNotes: string;
    trainingDiscussed: string;
    concernsDiscussed: string;
    previousActionsReview: string;
    staffComments: string;
    managerSummary: string;
    nextSupervisionDate: string;
    actions: SupervisionAction[];
  }) => Promise<void>;
};

export default function SupervisionForm({ staff, onCreate }: Props) {
  const [staffId, setStaffId] = useState("");
  const [supervisionDate, setSupervisionDate] = useState("");
  const [supervisionType, setSupervisionType] = useState("Formal Supervision");

  const [wellbeingNotes, setWellbeingNotes] = useState("");
  const [performanceNotes, setPerformanceNotes] = useState("");
  const [trainingDiscussed, setTrainingDiscussed] = useState("");
  const [concernsDiscussed, setConcernsDiscussed] = useState("");
  const [previousActionsReview, setPreviousActionsReview] = useState("");
  const [staffComments, setStaffComments] = useState("");
  const [managerSummary, setManagerSummary] = useState("");
  const [nextSupervisionDate, setNextSupervisionDate] = useState("");

  const [actions, setActions] = useState<SupervisionAction[]>([]);

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

  function updateAction(index: number, updatedAction: SupervisionAction) {
    setActions(
      actions.map((action, actionIndex) =>
        actionIndex === index ? updatedAction : action
      )
    );
  }

  function removeAction(index: number) {
    setActions(actions.filter((_, actionIndex) => actionIndex !== index));
  }

  async function handleCreate() {
    await onCreate({
      staffId,
      supervisionDate,
      supervisionType,
      wellbeingNotes,
      performanceNotes,
      trainingDiscussed,
      concernsDiscussed,
      previousActionsReview,
      staffComments,
      managerSummary,
      nextSupervisionDate,
      actions,
    });

    setStaffId("");
    setSupervisionDate("");
    setSupervisionType("Formal Supervision");
    setWellbeingNotes("");
    setPerformanceNotes("");
    setTrainingDiscussed("");
    setConcernsDiscussed("");
    setPreviousActionsReview("");
    setStaffComments("");
    setManagerSummary("");
    setNextSupervisionDate("");
    setActions([]);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-bold">New Supervision</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="">Select staff member</option>

          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </select>

        <select
          value={supervisionType}
          onChange={(e) => setSupervisionType(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          {supervisionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={supervisionDate}
          onChange={(e) => setSupervisionDate(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <input
          type="date"
          value={nextSupervisionDate}
          onChange={(e) => setNextSupervisionDate(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />
      </div>

      <textarea
        value={wellbeingNotes}
        onChange={(e) => setWellbeingNotes(e.target.value)}
        placeholder="Wellbeing / welfare discussion"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <textarea
        value={performanceNotes}
        onChange={(e) => setPerformanceNotes(e.target.value)}
        placeholder="Role performance / what is going well / areas for development"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <textarea
        value={trainingDiscussed}
        onChange={(e) => setTrainingDiscussed(e.target.value)}
        placeholder="Training / competency discussion"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <textarea
        value={concernsDiscussed}
        onChange={(e) => setConcernsDiscussed(e.target.value)}
        placeholder="Practice discussion / incidents / complaints / safeguarding"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <textarea
        value={previousActionsReview}
        onChange={(e) => setPreviousActionsReview(e.target.value)}
        placeholder="Previous actions review"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">New actions agreed</h3>

          <button
            onClick={addAction}
            className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200"
          >
            Add Action
          </button>
        </div>

        {actions.length === 0 && (
          <p className="text-sm text-slate-400">No actions added.</p>
        )}

        {actions.map((action, index) => (
          <ActionRow
            key={index}
            action={action}
            onChange={(updatedAction) => updateAction(index, updatedAction)}
            onRemove={() => removeAction(index)}
          />
        ))}
      </div>

      <textarea
        value={staffComments}
        onChange={(e) => setStaffComments(e.target.value)}
        placeholder="Staff comments"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <textarea
        value={managerSummary}
        onChange={(e) => setManagerSummary(e.target.value)}
        placeholder="Manager comments / supervision summary"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      />

      <button
        onClick={handleCreate}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
      >
        Save Supervision
      </button>
    </div>
  );
}