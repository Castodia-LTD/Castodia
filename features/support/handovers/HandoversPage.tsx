"use client";

import { useEffect, useState } from "react";
import {
  ContentWidth,
  PageHeader,
  SectionCard,
} from "@/components/layout";
import { supabase } from "@/lib/supabase";
import HandoverCard from "./components/HandoverCard";
import HandoverForm from "./components/HandoverForm";
import type { Handover, ServiceUser } from "./types";

type HandoverLink = {
  handover_id: string;
  service_user_id: string;
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
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

let visibleServiceUsers: ServiceUser[] = [];

if (profile?.role === "manager") {
  const { data } = await supabase
    .from("service_users")
    .select("id, full_name, house_name")
    .eq("is_active", true)
    .order("full_name");

  visibleServiceUsers = data || [];
} else {
  const { data: accessRows } = await supabase
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
    accessRows
      ?.map((row: any) => row.service_users)
      .filter(Boolean) || [];
}

setServiceUsers(visibleServiceUsers);

    const visibleServiceUserIds = visibleServiceUsers.map(
      (serviceUser: ServiceUser) => serviceUser.id
    );

    if (visibleServiceUserIds.length === 0) {
      setHandovers([]);
      setLoading(false);
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
      setLoading(false);
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
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: reads } = await supabase
      .from("handover_reads")
      .select("handover_id, staff_id");

    const enrichedHandovers =
      handoverData?.map((handover) => {
        const staff = profiles?.find(
          (profile) => profile.id === handover.created_by
        );

        const hasRead = reads?.some(
          (read) =>
            read.handover_id === handover.id && read.staff_id === user.id
        );

        const readNames =
          reads
            ?.filter((read) => read.handover_id === handover.id)
            .map((read) => {
              const profile = profiles?.find(
                (person) => person.id === read.staff_id
              );

              return profile?.full_name;
            })
            .filter(Boolean) || [];

        const linkedServiceUsers =
          handoverLinks
            ?.filter(
              (link: HandoverLink) => link.handover_id === handover.id
            )
            .map((link: HandoverLink) =>
              visibleServiceUsers.find(
                (serviceUser: ServiceUser) =>
                  serviceUser.id === link.service_user_id
              )
            )
            .filter(Boolean) || [];

        return {
          ...handover,
          staff_name: staff?.full_name || "Unknown",
          read: hasRead || false,
          read_by: readNames as string[],
          service_users: linkedServiceUsers,
        };
      }) || [];

    setHandovers(enrichedHandovers);
    setLoading(false);
  }

  function toggleServiceUser(id: string) {
    setSelectedServiceUsers((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function daysSince(dateString?: string) {
    if (!dateString) return "No record";

    const then = new Date(dateString);
    const now = new Date();

    const diff = Math.floor(
      (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";

    return `${diff} days ago`;
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

      since.setHours(since.getHours() - Number(handoverPeriod));

      for (const serviceUserId of selectedServiceUsers) {
        const serviceUser = serviceUsers.find(
          (person) => person.id === serviceUserId
        );

        if (!serviceUser) continue;

        lines.push(`${serviceUser.full_name}`);

        const { data: recentTimeline } = await supabase
          .from("timeline_entries")
          .select("entry_type, created_at")
          .eq("service_user_id", serviceUserId)
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false });

        const sleepEntries =
          recentTimeline?.filter((entry) => entry.entry_type === "Sleep") ||
          [];

        if (sleepEntries.length > 0) {
          lines.push("");
          lines.push("Sleep:");
          lines.push(`• ${sleepEntries.length} sleep observations recorded`);
        }

        const { data: toileting } = await supabase
          .from("toileting_records")
          .select("toileting_outcome")
          .eq("service_user_id", serviceUserId)
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false });

        const bowelMovements =
          toileting?.filter((record) =>
            ["Bowel movement", "Both"].includes(record.toileting_outcome)
          ).length || 0;

        lines.push("");
        lines.push("Continence:");
        lines.push(`• ${bowelMovements} bowel movements recorded`);

        const { data: personalCare } = await supabase
          .from("personal_care_records")
          .select("care_type, occurred_at")
          .eq("service_user_id", serviceUserId)
          .order("occurred_at", { ascending: false });

        const lastWash = personalCare?.find((row) =>
          ["Shower", "Bath", "Strip wash"].includes(row.care_type)
        );

        const lastClothing = personalCare?.find(
          (row) => row.care_type === "Clothing changed"
        );

        lines.push("");
        lines.push("Personal Care:");
        lines.push(`• Last washed: ${daysSince(lastWash?.occurred_at)}`);
        lines.push(
          `• Last clothing change: ${daysSince(lastClothing?.occurred_at)}`
        );

        const incidentCount =
          recentTimeline?.filter((entry) => entry.entry_type === "Incident")
            .length || 0;

        if (incidentCount > 0) {
          lines.push("");
          lines.push("Incidents:");
          lines.push(`• ${incidentCount} incidents recorded`);
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
    if (!userId) return;

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
    <ContentWidth>
      <PageHeader
        title="Handovers"
        subtitle="Create and review handovers for your assigned service users."
      >
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30"
        >
          + New
        </button>
      </PageHeader>

      {formOpen && (
        <div className="mb-8">
          <HandoverForm
            title={title}
            content={content}
            handoverPeriod={handoverPeriod}
            serviceUsers={serviceUsers}
            selectedServiceUsers={selectedServiceUsers}
            generating={generating}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onHandoverPeriodChange={setHandoverPeriod}
            onToggleServiceUser={toggleServiceUser}
            onGenerateSummary={generateAutomaticSummary}
            onCreateHandover={createHandover}
            onClose={() => setFormOpen(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {loading && (
          <SectionCard>
            <p className="text-sm text-slate-400">Loading handovers...</p>
          </SectionCard>
        )}

        {!loading && handovers.length === 0 && (
          <SectionCard>
            <p className="text-sm text-slate-400">No active handovers.</p>
          </SectionCard>
        )}

        {!loading &&
          handovers.map((handover) => (
            <HandoverCard
              key={handover.id}
              handover={handover}
              onMarkAsRead={markAsRead}
            />
          ))}
      </div>
    </ContentWidth>
  );
}