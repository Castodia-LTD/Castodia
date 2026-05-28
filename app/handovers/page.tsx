"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

type Handover = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  active: boolean;
  staff_name?: string;
  read?: boolean;
  read_by?: string[];
  service_users?: ServiceUser[];
};

export default function HandoversPage() {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedServiceUsers, setSelectedServiceUsers] = useState<string[]>(
    []
  );
  const [generating, setGenerating] = useState(false);
  const [handoverPeriod, setHandoverPeriod] = useState("24");
  const [formOpen, setFormOpen] = useState(false);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

const { data: profile } = await supabase
  .from("profiles")
  .select("role, organisation_id")
  .eq("id", user.id)
  .single();

const userRole = profile?.role || "staff";

    let visibleServiceUsers: ServiceUser[] = [];

    if (userRole === "manager") {
      const { data } = await supabase
        .from("service_users")
        .select("id, full_name, house_name")
        .eq("organisation_id", profile?.organisation_id)
        .eq("is_active", true)
        .order("full_name");

      visibleServiceUsers = data || [];
    } else {
      const { data } = await supabase
        .from("staff_service_user_access")
        .select(`
          service_users (
            id,
            full_name,
            house_name
          )
        `)
        .eq("staff_id", user.id);

      visibleServiceUsers =
        data?.map((row: any) => row.service_users).filter(Boolean) || [];
    }

    setServiceUsers(visibleServiceUsers);

    const visibleServiceUserIds = visibleServiceUsers.map((su) => su.id);

    if (visibleServiceUserIds.length === 0) {
      setHandovers([]);
      return;
    }

    const { data: handoverLinks } = await supabase
      .from("handover_service_users")
      .select("handover_id, service_user_id")
      .in("service_user_id", visibleServiceUserIds);

    const handoverIds = [
      ...new Set(handoverLinks?.map((link) => link.handover_id) || []),
    ];

    if (handoverIds.length === 0) {
      setHandovers([]);
      return;
    }

    const { data: handoverData, error } = await supabase
      .from("handovers")
      .select("*")
      .eq("active", true)
      .in("id", handoverIds)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: reads } = await supabase
      .from("handover_reads")
      .select("handover_id, staff_id");

    const enriched =
      handoverData?.map((handover) => {
        const staff = profiles?.find((p) => p.id === handover.created_by);

        const hasRead = reads?.some(
          (r) => r.handover_id === handover.id && r.staff_id === user.id
        );

        const readNames =
          reads
            ?.filter((r) => r.handover_id === handover.id)
            .map((r) => {
              const profile = profiles?.find((p) => p.id === r.staff_id);
              return profile?.full_name;
            })
            .filter(Boolean) || [];

        const linkedServiceUsers =
          handoverLinks
            ?.filter((link) => link.handover_id === handover.id)
            .map((link) =>
              visibleServiceUsers.find((su) => su.id === link.service_user_id)
            )
            .filter(Boolean) as ServiceUser[];

        return {
          ...handover,
          staff_name: staff?.full_name || "Unknown",
          read: hasRead || false,
          read_by: readNames as string[],
          service_users: linkedServiceUsers,
        };
      }) || [];

    setHandovers(enriched);
  }

  function toggleServiceUser(id: string) {
    setSelectedServiceUsers((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }
async function generateAutomaticSummary() {
  if (selectedServiceUsers.length === 0) {
    alert("Select at least one service user.");
    return;
  }

  setGenerating(true);

  try {
    const lines: string[] = [];

    const since = new Date();

since.setHours(
  since.getHours() - Number(handoverPeriod)
);

    for (const serviceUserId of selectedServiceUsers) {
      const serviceUser = serviceUsers.find(
        (su) => su.id === serviceUserId
      );

      if (!serviceUser) continue;

      lines.push(`${serviceUser.full_name}`);

      const { data: recentTimeline } = await supabase
        .from("timeline_entries")
        .select("entry_type, created_at")
        .eq("service_user_id", serviceUserId)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })

      const sleepEntries =
        recentTimeline?.filter(
          (entry) => entry.entry_type === "Sleep"
        ) || [];

        if (sleepEntries.length > 0) {
        lines.push("");
        lines.push("Sleep:");
        lines.push(
        `• ${sleepEntries.length} sleep observations recorded`
      );
    }

      const { data: toileting } = await supabase
        .from("toileting_records")
        .select("toileting_outcome")
        .eq("service_user_id", serviceUserId)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })

      const bowelMovements =
        toileting?.filter((t) =>
          ["Bowel movement", "Both"].includes(
            t.toileting_outcome
          )
        ).length || 0;

        lines.push("");
        lines.push("Continence:");
        lines.push(
        `• ${bowelMovements} bowel movements recorded`
      );

      const { data: personalCare } = await supabase
  .from("personal_care_records")
  .select("care_type, occurred_at")
  .eq("service_user_id", serviceUserId)
  .order("occurred_at", { ascending: false });

      const lastWash = personalCare?.find((row) =>
        ["Shower", "Bath", "Strip wash"].includes(
          row.care_type
        )
      );

      const lastClothing = personalCare?.find(
        (row) => row.care_type === "Clothing changed"
      );

      function daysSince(dateString?: string) {
        if (!dateString) return "No record";

        const then = new Date(dateString);
        const now = new Date();

        const diff = Math.floor(
          (now.getTime() - then.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diff === 0) return "Today";
        if (diff === 1) return "Yesterday";

        return `${diff} days ago`;
      }

      lines.push("");
      lines.push("Personal Care:");

      lines.push(
      `• Last washed: ${daysSince(
      lastWash?.occurred_at
    )}`
  );

      lines.push(
      `• Last clothing change: ${daysSince(
      lastClothing?.occurred_at
    )}`
  );

      const incidentCount =
        recentTimeline?.filter(
          (entry) => entry.entry_type === "Incident"
        ).length || 0;

      if (incidentCount > 0) {
  lines.push("");
  lines.push("Incidents:");
  lines.push(
    `• ${incidentCount} incidents recorded`
  );
}

      lines.push("");
    }

    setContent(lines.join("\n"));
  } finally {
    setGenerating(false);
  }
}

  async function createHandover() {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and handover details.");
      return;
    }

    if (selectedServiceUsers.length === 0) {
      alert("Please select at least one service user.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { data: handover, error } = await supabase
      .from("handovers")
      .insert({
        title: title.trim(),
        content: content.trim(),
        created_by: user.id,
        active: true,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const links = selectedServiceUsers.map((serviceUserId) => ({
      handover_id: handover.id,
      service_user_id: serviceUserId,
    }));

    const { error: linkError } = await supabase
      .from("handover_service_users")
      .insert(links);

    if (linkError) {
      alert(linkError.message);
      return;
    }

    setTitle("");
    setContent("");
    setSelectedServiceUsers([]);
    setFormOpen(false);

    await loadData();
  }

  async function markAsRead(handoverId: string) {
    const { error } = await supabase.from("handover_reads").insert({
      handover_id: handoverId,
      staff_id: userId,
    });

    if (error && !error.message.includes("duplicate")) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-sm px-4 py-6 md:max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Handovers</h1>

            <p className="mt-2 text-slate-400">
              Create handovers for selected service users. Assigned staff will
              see them here.
            </p>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="shrink-0 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-5 py-3 font-semibold shadow-lg shadow-blue-900/30"
          >
            + New
          </button>
        </div>

        {formOpen && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Handover</h2>

              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Handover title"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write handover details..."
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <div>
                <div>
  <h3 className="mb-3 font-semibold">
    Handover Period
  </h3>

  <select
    value={handoverPeriod}
    onChange={(e) =>
      setHandoverPeriod(e.target.value)
    }
    className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
  >
    <option value="24">Last 24 Hours</option>
    <option value="48">Last 48 Hours</option>
    <option value="72">Last 72 Hours</option>
  </select>
</div>
                <h3 className="mb-3 font-semibold">Select service users</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceUsers.map((su) => {
                    const selected = selectedServiceUsers.includes(su.id);

                    return (
                      <button
                        key={su.id}
                        type="button"
                        onClick={() => toggleServiceUser(su.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-cyan-300 bg-cyan-500/20"
                            : "border-white/10 bg-white/10"
                        }`}
                      >
                        <p className="font-semibold">{su.full_name}</p>
                        <p className="text-sm text-slate-400">
                          {su.house_name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

<button
  type="button"
  onClick={generateAutomaticSummary}
  disabled={generating}
  className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 font-semibold text-cyan-200"
>
  {generating
    ? "Generating summary..."
    : "Generate Automatic Summary"}
</button>

              <button
                onClick={createHandover}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
              >
                Create Handover
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {handovers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
              No active handovers.
            </div>
          )}

          {handovers.map((handover) => (
            <div
              key={handover.id}
              className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">
                    {new Date(handover.created_at).toLocaleString("en-GB")}
                  </p>

                  <h2 className="mt-2 break-words text-xl font-bold">
                    {handover.title}
                  </h2>
                </div>

                {handover.read ? (
                  <span className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
                    Read
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold">
                    Unread
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {handover.service_users?.map((su) => (
                  <span
                    key={su.id}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                  >
                    {su.full_name}
                  </span>
                ))}
              </div>

              <p className="mt-4 whitespace-pre-line break-words text-slate-200">
                {handover.content}
              </p>

              <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
                Created by {handover.staff_name}
              </p>

              {handover.read_by && handover.read_by.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Read by
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {handover.read_by.map((person) => (
                      <span
                        key={person}
                        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!handover.read && (
                <button
                  onClick={() => markAsRead(handover.id)}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}