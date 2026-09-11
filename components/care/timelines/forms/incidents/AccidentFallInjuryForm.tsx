"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormCheckbox,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
  FormYesNo,
} from "@/components/care/timelines/forms/shared";

type Props = {
  onChange: (data: AccidentFallInjuryData) => void;
};

export type AccidentFallInjuryData = {
  incidentType: string;
  otherIncidentType: string;
  location: string;
  witnessedStatus: "yes" | "partially" | "no" | "";
  discoveryDetails: string;
  description: string;
  injurySustained: boolean | null;
  injuryTypes: string[];
  otherInjuryType: string;
  injurySeverity: string;
  createLinkedBodyMap: boolean;
  involvedAnotherPerson: boolean;
  otherPersonDetails: string;
  immediateActions: string[];
  otherImmediateAction: string;
  outcome: string;
  otherOutcome: string;
  followUpActions: string[];
  notes: string;
};

const incidentTypeOptions = [
  { value: "Fall", label: "Fall" },
  { value: "Accident", label: "Accident" },
  { value: "Injury Without Known Cause", label: "Injury without known cause" },
  { value: "Choking", label: "Choking" },
  { value: "Burn / Scald", label: "Burn / scald" },
  { value: "Cut / Laceration", label: "Cut / laceration" },
  { value: "Head Injury", label: "Head injury" },
  { value: "Collision", label: "Collision" },
  { value: "Other", label: "Other" },
];

const witnessedOptions = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];

const injuryTypeOptions = [
  "Bruising",
  "Grazing",
  "Cut / Laceration",
  "Swelling",
  "Bleeding",
  "Suspected Fracture",
  "Head Injury",
  "Pain",
  "Reduced Mobility",
  "Burn",
  "Other",
].map((value) => ({ value, label: value }));

const injurySeverityOptions = ["Minor", "Moderate", "Serious"].map((value) => ({
  value,
  label: value,
}));

const immediateActionOptions = [
  "First Aid",
  "Observations Commenced",
  "GP Contacted",
  "NHS 111",
  "999",
  "Hospital",
  "Family Informed",
  "Manager Informed",
  "No Treatment Required",
  "Other",
].map((value) => ({ value, label: value }));

const outcomeOptions = [
  "Continued Normal Activities",
  "Resting",
  "Monitoring",
  "Hospital Assessment",
  "Admitted to Hospital",
  "Other",
].map((value) => ({ value, label: value }));

const followUpOptions = [
  "Body Map Completed",
  "Incident Review Required",
  "Risk Assessment Review",
  "Care Plan Review",
  "Falls Assessment",
  "Safeguarding Considered",
].map((value) => ({ value, label: value }));

const initialData: AccidentFallInjuryData = {
  incidentType: "",
  otherIncidentType: "",
  location: "",
  witnessedStatus: "",
  discoveryDetails: "",
  description: "",
  injurySustained: null,
  injuryTypes: [],
  otherInjuryType: "",
  injurySeverity: "",
  createLinkedBodyMap: false,
  involvedAnotherPerson: false,
  otherPersonDetails: "",
  immediateActions: [],
  otherImmediateAction: "",
  outcome: "",
  otherOutcome: "",
  followUpActions: [],
  notes: "",
};

export default function AccidentFallInjuryForm({ onChange }: Props) {
  const [data, setData] = useState<AccidentFallInjuryData>(initialData);

  const notesRecommended = useMemo(
    () =>
      data.injurySeverity === "Serious" ||
      data.immediateActions.includes("999") ||
      data.outcome === "Hospital Assessment" ||
      data.outcome === "Admitted to Hospital" ||
      data.followUpActions.includes("Safeguarding Considered"),
    [data],
  );

  function update(changes: Partial<AccidentFallInjuryData>) {
    const next = { ...data, ...changes };
    setData(next);
    onChange(next);
  }

  function updateImmediateActions(next: string[]) {
    let normalized = next;

    if (next.includes("No Treatment Required") && next.length > 1) {
      const newlySelectedNone =
        !data.immediateActions.includes("No Treatment Required") &&
        next.includes("No Treatment Required");

      normalized = newlySelectedNone
        ? ["No Treatment Required"]
        : next.filter((item) => item !== "No Treatment Required");
    }

    update({
      immediateActions: normalized,
      otherImmediateAction: normalized.includes("Other") ? data.otherImmediateAction : "",
    });
  }

  function selectInjurySustained(value: boolean) {
    if (!value) {
      update({
        injurySustained: false,
        injuryTypes: [],
        otherInjuryType: "",
        injurySeverity: "",
        createLinkedBodyMap: false,
      });
      return;
    }

    update({ injurySustained: true });
  }

  const coreDetailsComplete =
    data.incidentType &&
    (data.incidentType !== "Other" || data.otherIncidentType.trim()) &&
    data.location.trim() &&
    data.witnessedStatus &&
    (data.witnessedStatus === "yes" || data.discoveryDetails.trim()) &&
    data.description.trim();

  const injuryComplete =
    data.injurySustained === false ||
    (data.injurySustained === true &&
      data.injuryTypes.length > 0 &&
      (!data.injuryTypes.includes("Other") || data.otherInjuryType.trim()) &&
      data.injurySeverity);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Accident / Fall / Injury</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record facts in sequence so urgent information is captured without presenting every field at once.
        </p>
      </div>

      <FormSection title="What happened?" description="Start with the factual incident details.">
        <FormChoiceGroup
          label="Incident type"
          value={data.incidentType}
          options={incidentTypeOptions}
          onChange={(value) =>
            update({
              incidentType: value,
              otherIncidentType: value === "Other" ? data.otherIncidentType : "",
            })
          }
          required
          columns={2}
        />

        {data.incidentType === "Other" && (
          <FormField label="Describe the incident type" required>
            <FormInput
              value={data.otherIncidentType}
              onChange={(event) => update({ otherIncidentType: event.target.value })}
              placeholder="Describe the incident type"
            />
          </FormField>
        )}

        {data.incidentType && (data.incidentType !== "Other" || data.otherIncidentType.trim()) && (
          <FormField label="Location" required>
            <FormInput
              value={data.location}
              onChange={(event) => update({ location: event.target.value })}
              placeholder="Kitchen, bedroom, community, vehicle..."
            />
          </FormField>
        )}

        {data.location.trim() && (
          <FormChoiceGroup
            label="Was the incident witnessed?"
            value={data.witnessedStatus}
            options={witnessedOptions}
            onChange={(value) =>
              update({
                witnessedStatus: value as AccidentFallInjuryData["witnessedStatus"],
                discoveryDetails: value === "yes" ? "" : data.discoveryDetails,
              })
            }
            required
            columns={3}
          />
        )}

        {(data.witnessedStatus === "no" || data.witnessedStatus === "partially") && (
          <FormField label="How was the incident discovered?" required>
            <FormTextarea
              value={data.discoveryDetails}
              onChange={(event) => update({ discoveryDetails: event.target.value })}
              placeholder="For example: found on the floor or reported by the person..."
              rows={3}
            />
          </FormField>
        )}

        {data.witnessedStatus &&
          (data.witnessedStatus === "yes" || data.discoveryDetails.trim()) && (
            <FormField
              label="What happened?"
              description="Record observable facts. Avoid assumptions or blame."
              required
            >
              <FormTextarea
                value={data.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="Record the facts of what happened..."
                rows={5}
              />
            </FormField>
          )}
      </FormSection>

      {coreDetailsComplete && (
        <FormSection title="Injury" description="Record whether an injury was sustained.">
          <FormYesNo
            label="Was an injury sustained?"
            value={data.injurySustained}
            yesLabel="Injury sustained"
            noLabel="No injury"
            onChange={selectInjurySustained}
            required
          />

          {data.injurySustained === true && (
            <>
              <FormMultiSelect
                label="Injury type"
                value={data.injuryTypes}
                options={injuryTypeOptions}
                onChange={(next) =>
                  update({
                    injuryTypes: next,
                    otherInjuryType: next.includes("Other") ? data.otherInjuryType : "",
                  })
                }
                required
                columns={2}
              />

              {data.injuryTypes.includes("Other") && (
                <FormField label="Describe the injury" required>
                  <FormInput
                    value={data.otherInjuryType}
                    onChange={(event) => update({ otherInjuryType: event.target.value })}
                    placeholder="Describe the injury"
                  />
                </FormField>
              )}

              {data.injuryTypes.length > 0 &&
                (!data.injuryTypes.includes("Other") || data.otherInjuryType.trim()) && (
                  <FormChoiceGroup
                    label="Injury severity"
                    value={data.injurySeverity}
                    options={injurySeverityOptions}
                    onChange={(value) => update({ injurySeverity: value })}
                    required
                    columns={3}
                  />
                )}

              {data.injurySeverity && (
                <FormCheckbox
                  label="Create a linked Body Map after saving"
                  checked={data.createLinkedBodyMap}
                  onChange={(event) => update({ createLinkedBodyMap: event.target.checked })}
                />
              )}
            </>
          )}
        </FormSection>
      )}

      {coreDetailsComplete && injuryComplete && (
        <FormSection title="Immediate response" description="Record what staff did and the immediate outcome.">
          <FormMultiSelect
            label="Immediate actions"
            value={data.immediateActions}
            options={immediateActionOptions}
            onChange={updateImmediateActions}
            required
            columns={2}
          />

          {data.immediateActions.includes("Other") && (
            <FormField label="Describe the other immediate action" required>
              <FormTextarea
                value={data.otherImmediateAction}
                onChange={(event) => update({ otherImmediateAction: event.target.value })}
                placeholder="Describe the immediate action taken"
                rows={3}
              />
            </FormField>
          )}

          {data.immediateActions.length > 0 &&
            (!data.immediateActions.includes("Other") || data.otherImmediateAction.trim()) && (
              <FormChoiceGroup
                label="Immediate outcome"
                value={data.outcome}
                options={outcomeOptions}
                onChange={(value) =>
                  update({
                    outcome: value,
                    otherOutcome: value === "Other" ? data.otherOutcome : "",
                  })
                }
                required
                columns={2}
              />
            )}

          {data.outcome === "Other" && (
            <FormField label="Describe the outcome" required>
              <FormInput
                value={data.otherOutcome}
                onChange={(event) => update({ otherOutcome: event.target.value })}
                placeholder="Describe the immediate outcome"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.outcome && (data.outcome !== "Other" || data.otherOutcome.trim()) && (
        <FormSection
          title="People and follow-up"
          description="Add other people or follow-up actions only where relevant."
          collapsible
          defaultOpen={false}
          summary={
            data.involvedAnotherPerson || data.followUpActions.length
              ? "Additional follow-up recorded"
              : "Optional"
          }
        >
          <FormYesNo
            label="Did this incident involve another person?"
            value={data.involvedAnotherPerson}
            onChange={(value) =>
              update({
                involvedAnotherPerson: value,
                otherPersonDetails: value ? data.otherPersonDetails : "",
              })
            }
          />

          {data.involvedAnotherPerson && (
            <FormField label="Other person involved" required>
              <FormInput
                value={data.otherPersonDetails}
                onChange={(event) => update({ otherPersonDetails: event.target.value })}
                placeholder="Name and relationship or role"
              />
            </FormField>
          )}

          <FormMultiSelect
            label="Follow-up actions"
            value={data.followUpActions}
            options={followUpOptions}
            onChange={(next) => update({ followUpActions: next })}
            columns={2}
          />
        </FormSection>
      )}

      {data.outcome && (data.outcome !== "Other" || data.otherOutcome.trim()) &&
        (notesRecommended ? (
          <FormSection title="Additional incident detail" description="More detail is recommended because this record includes a higher-risk outcome or action.">
            <FormAlert variant="warning" title="Additional detail recommended">
              Add relevant detail about serious injury, emergency action, hospital care or safeguarding consideration.
            </FormAlert>
            <FormField label="Notes">
              <FormTextarea
                value={data.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Add relevant incident detail..."
                rows={4}
              />
            </FormField>
          </FormSection>
        ) : (
          <FormSection
            title="Additional notes"
            description="Only add narrative that is not already captured above."
            collapsible
            defaultOpen={false}
            summary={data.notes.trim() ? "Notes added" : "Optional"}
          >
            <FormField label="Notes">
              <FormTextarea
                value={data.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Optional additional information..."
                rows={4}
              />
            </FormField>
          </FormSection>
        ))}
    </div>
  );
}
