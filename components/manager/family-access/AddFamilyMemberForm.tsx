"use client";

import { Loader2, Send, UserPlus } from "lucide-react";
import { useState } from "react";

import { CastodiaButton } from "@/components/castodia";

import {
  FormAlert,
  FormInput,
  FormLabel,
  FormSelect,
} from "@/components/timelines/forms/shared";

import { supabase } from "@/lib/supabase";

type Props = {
  serviceUserId: string;
  serviceUserName: string;
  onCreated?: () => void | Promise<void>;
};

type ApiResponse = {
  error?: string;
  message?: string;
};

const relationships = [
  "Mother",
  "Father",
  "Parent",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandmother",
  "Grandfather",
  "Grandparent",
  "Aunt",
  "Uncle",
  "Cousin",
  "Partner",
  "Spouse",
  "Friend",
  "Advocate",
  "Other",
];

export default function AddFamilyMemberForm({
  serviceUserId,
  serviceUserName,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [success, setSuccess] = useState<
    string | null
  >(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const cleanName = fullName.trim();
    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanName) {
      setError("Enter the family member's name.");
      return;
    }

    if (!cleanEmail) {
      setError(
        "Enter the family member's email address.",
      );
      return;
    }

    if (!relationship) {
      setError("Select their relationship.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.access_token) {
        throw new Error(
          "You must be signed in to create Family access.",
        );
      }

      const response = await fetch(
        "/api/family-users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            serviceUserId,
            fullName: cleanName,
            email: cleanEmail,
            relationship,
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Unable to create Family access.",
        );
      }

      setFullName("");
      setEmail("");
      setRelationship("");

      setSuccess(
        result.message ??
          `Family access created for ${cleanName}.`,
      );

      await onCreated?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create Family access.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-400 text-white shadow-sm">
          <UserPlus
            size={21}
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Add family member
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Give an approved relative or contact
            secure access to {serviceUserName}&apos;s
            Castodia Family area.
          </p>
        </div>
      </div>

      {error ? (
        <FormAlert variant="error">
          {error}
        </FormAlert>
      ) : null}

      {success ? (
        <FormAlert variant="success">
          {success}
        </FormAlert>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="family-name">
            Full name
          </FormLabel>

          <FormInput
            id="family-name"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            placeholder="e.g. Sarah Smith"
            autoComplete="name"
            disabled={submitting}
          />
        </div>

        <div>
          <FormLabel htmlFor="family-email">
            Email address
          </FormLabel>

          <FormInput
            id="family-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="sarah@example.com"
            autoComplete="email"
            disabled={submitting}
          />
        </div>

        <div>
          <FormLabel htmlFor="family-relationship">
            Relationship to {serviceUserName}
          </FormLabel>

          <FormSelect
            id="family-relationship"
            value={relationship}
            onChange={(event) =>
              setRelationship(event.target.value)
            }
            placeholder="Select relationship"
            disabled={submitting}
          >
            {relationships.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <CastodiaButton
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />

              Sending invitation...
            </>
          ) : (
            <>
              <Send
                className="h-4 w-4"
                aria-hidden="true"
              />

              Create Family Access
            </>
          )}
        </CastodiaButton>
      </div>
    </form>
  );
}