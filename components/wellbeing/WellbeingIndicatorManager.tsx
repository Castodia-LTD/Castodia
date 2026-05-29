"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getServiceUserWellbeingIndicators,
  createServiceUserWellbeingIndicator,
  deactivateServiceUserWellbeingIndicator,
} from "@/lib/wellbeing/queries";

type Props = {
  serviceUserId: string;

};

export default function WellbeingIndicatorManager({
  serviceUserId,
}: Props) {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadIndicators() {
    try {
      const data = await getServiceUserWellbeingIndicators(serviceUserId);
      setIndicators(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIndicators();
  }, [serviceUserId]);

  async function handleAdd() {
  if (!newIndicator.trim()) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await createServiceUserWellbeingIndicator(
      serviceUserId,
      newIndicator,
      user.id
    );

    setNewIndicator("");
    await loadIndicators();
  } catch (error) {
    console.error(error);
  }
}

  async function handleDelete(id: string) {
    try {
      await deactivateServiceUserWellbeingIndicator(id);
      await loadIndicators();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Custom Wellbeing Indicators</h3>
        <p className="text-sm text-gray-500">
          Add indicators specific to this service user.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={newIndicator}
          onChange={(e) => setNewIndicator(e.target.value)}
          placeholder="e.g. Increased stimming"
          className="border rounded px-3 py-2 flex-1"
        />

        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="flex justify-between items-center border rounded px-3 py-2"
          >
            <span>{indicator.label}</span>

            <button
              onClick={() => handleDelete(indicator.id)}
              className="text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}