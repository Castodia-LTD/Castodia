"use client";

import { FormEvent, useState } from "react";
import type {
  AboutMeFormValues,
  ServiceUserAboutMe,
} from "@/lib/service-user-hub/about-me/types";

type AboutMeFormProps = {
  serviceUserId: string;
  initialData: ServiceUserAboutMe | null;
  onCancel: () => void;
  onSaved: (record: ServiceUserAboutMe) => void;
};

function getInitialValues(
  initialData: ServiceUserAboutMe | null
): AboutMeFormValues {
  return {
    about_me: initialData?.about_me ?? "",
    preferred_name: initialData?.preferred_name ?? "",
    gender_identity: initialData?.gender_identity ?? "",
    nhs_number: initialData?.nhs_number ?? "",
    religion: initialData?.religion ?? "",
    nationality: initialData?.nationality ?? "",
    languages: initialData?.languages ?? [],

    emergency_contact_name:
      initialData?.emergency_contact_name ?? "",
    emergency_contact_relationship:
      initialData?.emergency_contact_relationship ?? "",
    emergency_contact_phone:
      initialData?.emergency_contact_phone ?? "",

    key_worker_name: initialData?.key_worker_name ?? "",
    gp_name: initialData?.gp_name ?? "",

    likes: initialData?.likes ?? [],
    dislikes_triggers: initialData?.dislikes_triggers ?? [],

    preferred_communication:
      initialData?.preferred_communication ?? "",
    hearing_notes: initialData?.hearing_notes ?? "",
    vision_notes: initialData?.vision_notes ?? "",
    communication_notes:
      initialData?.communication_notes ?? "",

    important_information:
      initialData?.important_information ?? [],
  };
}

function arrayToText(values: string[]) {
  return values.join("\n");
}

function textToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AboutMeForm({
  serviceUserId,
  initialData,
  onCancel,
  onSaved,
}: AboutMeFormProps) {
  const [values, setValues] = useState<AboutMeFormValues>(
    getInitialValues(initialData)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  function updateField<K extends keyof AboutMeFormValues>(
    field: K,
    value: AboutMeFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/service-users/${serviceUserId}/about-me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to save About Me information."
        );
      }

      onSaved(result.data as ServiceUserAboutMe);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save About Me information."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inputClassName =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

  const labelClassName =
    "block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          About Me
        </h2>

        <label className={labelClassName}>
          About Me
          <textarea
            value={values.about_me}
            onChange={(event) =>
              updateField("about_me", event.target.value)
            }
            rows={6}
            className={inputClassName}
            placeholder="Describe the person, their history, personality and what matters to them."
          />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Quick Facts
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClassName}>
            Preferred name
            <input
              type="text"
              value={values.preferred_name}
              onChange={(event) =>
                updateField("preferred_name", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Gender identity
            <input
              type="text"
              value={values.gender_identity}
              onChange={(event) =>
                updateField("gender_identity", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            NHS number
            <input
              type="text"
              value={values.nhs_number}
              onChange={(event) =>
                updateField("nhs_number", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Religion
            <input
              type="text"
              value={values.religion}
              onChange={(event) =>
                updateField("religion", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Nationality
            <input
              type="text"
              value={values.nationality}
              onChange={(event) =>
                updateField("nationality", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Languages
            <textarea
              value={arrayToText(values.languages)}
              onChange={(event) =>
                updateField(
                  "languages",
                  textToArray(event.target.value)
                )
              }
              rows={3}
              className={inputClassName}
              placeholder="One language per line"
            />
          </label>

          <label className={labelClassName}>
            Key worker
            <input
              type="text"
              value={values.key_worker_name}
              onChange={(event) =>
                updateField("key_worker_name", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            GP
            <input
              type="text"
              value={values.gp_name}
              onChange={(event) =>
                updateField("gp_name", event.target.value)
              }
              className={inputClassName}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className={labelClassName}>
            Emergency contact
            <input
              type="text"
              value={values.emergency_contact_name}
              onChange={(event) =>
                updateField(
                  "emergency_contact_name",
                  event.target.value
                )
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Relationship
            <input
              type="text"
              value={values.emergency_contact_relationship}
              onChange={(event) =>
                updateField(
                  "emergency_contact_relationship",
                  event.target.value
                )
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Contact number
            <input
              type="tel"
              value={values.emergency_contact_phone}
              onChange={(event) =>
                updateField(
                  "emergency_contact_phone",
                  event.target.value
                )
              }
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <label className={labelClassName}>
          Likes
          <textarea
            value={arrayToText(values.likes)}
            onChange={(event) =>
              updateField("likes", textToArray(event.target.value))
            }
            rows={6}
            className={inputClassName}
            placeholder="One item per line"
          />
        </label>

        <label className={labelClassName}>
          Dislikes and triggers
          <textarea
            value={arrayToText(values.dislikes_triggers)}
            onChange={(event) =>
              updateField(
                "dislikes_triggers",
                textToArray(event.target.value)
              )
            }
            rows={6}
            className={inputClassName}
            placeholder="One item per line"
          />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Communication
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClassName}>
            Preferred communication
            <textarea
              value={values.preferred_communication}
              onChange={(event) =>
                updateField(
                  "preferred_communication",
                  event.target.value
                )
              }
              rows={4}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Communication notes
            <textarea
              value={values.communication_notes}
              onChange={(event) =>
                updateField(
                  "communication_notes",
                  event.target.value
                )
              }
              rows={4}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Hearing notes
            <textarea
              value={values.hearing_notes}
              onChange={(event) =>
                updateField("hearing_notes", event.target.value)
              }
              rows={4}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Vision notes
            <textarea
              value={values.vision_notes}
              onChange={(event) =>
                updateField("vision_notes", event.target.value)
              }
              rows={4}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section>
        <label className={labelClassName}>
          Important information
          <textarea
            value={arrayToText(values.important_information)}
            onChange={(event) =>
              updateField(
                "important_information",
                textToArray(event.target.value)
              )
            }
            rows={7}
            className={inputClassName}
            placeholder="One item per line"
          />
        </label>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}