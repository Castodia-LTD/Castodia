"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getServiceUserWellbeingIndicators,
  createServiceUserWellbeingIndicator,
  deactivateServiceUserWellbeingIndicator,
} from "@/lib/wellbeing/queries";

type Props = {
  serviceUserId: string;
};

type WellbeingIndicator = {
  id: string;
  label: string;
};

export default function WellbeingIndicatorManager({
  serviceUserId,
}: Props) {
  const [indicators, setIndicators] = useState<WellbeingIndicator[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadIndicators() {
    setLoading(true);
    setError(null);

    try {
      const data =
        await getServiceUserWellbeingIndicators(serviceUserId);

      setIndicators(data ?? []);
    } catch (error) {
      console.error(error);
      setError("We could not load the wellbeing indicators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIndicators();
  }, [serviceUserId]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const label = newIndicator.trim();

    if (!label || adding) return;

    setAdding(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your session could not be verified. Please sign in again.");
        return;
      }

      await createServiceUserWellbeingIndicator(
        serviceUserId,
        label,
        user.id
      );

      setNewIndicator("");
      await loadIndicators();
    } catch (error) {
      console.error(error);
      setError("We could not add this wellbeing indicator.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (removingId) return;

    setRemovingId(id);
    setError(null);

    try {
      await deactivateServiceUserWellbeingIndicator(id);
      await loadIndicators();
    } catch (error) {
      console.error(error);
      setError("We could not remove this wellbeing indicator.");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />

        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />

        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-teal-50 p-6 ring-1 ring-cyan-100 sm:p-8">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-800">
            Personalised care
          </span>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            Custom wellbeing indicators
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add signs, behaviours or communication cues that are specific to
            this service user. Staff can then select them when recording a
            wellbeing observation.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
        >
          <label
            htmlFor="new-wellbeing-indicator"
            className="block text-sm font-bold text-slate-800"
          >
            New indicator
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="new-wellbeing-indicator"
              value={newIndicator}
              onChange={(event) =>
                setNewIndicator(event.target.value)
              }
              placeholder="For example, increased stimming"
              maxLength={100}
              disabled={adding}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <button
              type="submit"
              disabled={!newIndicator.trim() || adding}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add indicator"}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Keep the wording clear and observable.
            </p>

            <span className="text-xs text-slate-400">
              {newIndicator.length}/100
            </span>
          </div>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-slate-950">
              Active indicators
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              These indicators are currently available to staff.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
            {indicators.length}{" "}
            {indicators.length === 1 ? "indicator" : "indicators"}
          </span>
        </div>

        {indicators.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-xl">
              +
            </div>

            <h5 className="mt-4 font-bold text-slate-900">
              No custom indicators yet
            </h5>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add the first personalised sign or behaviour using the form
              above.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {indicators.map((indicator) => {
              const isRemoving = removingId === indicator.id;

              return (
                <div
                  key={indicator.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 text-sm font-bold text-cyan-800">
                      ✓
                    </div>

                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-900">
                        {indicator.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Available in wellbeing observations
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(indicator.id)}
                    disabled={Boolean(removingId)}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}