"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Incident = {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  service_user_id: string;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  staff_name?: string;
  service_user_name?: string;
  reviewer_name?: string;
};

export default function IncidentPage() {
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  async function loadIncident() {
    const { data, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("id", incidentId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(myProfile?.role || null);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.created_by)
      .single();

    const { data: serviceUser } = await supabase
      .from("service_users")
      .select("full_name")
      .eq("id", data.service_user_id)
      .single();

    let reviewerName = "";

    if (data.reviewed_by) {
      const { data: reviewer } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.reviewed_by)
        .single();

      reviewerName = reviewer?.full_name || "";
    }

    setIncident({
      ...data,
      staff_name: profile?.full_name || "Unknown",
      service_user_name: serviceUser?.full_name || "Unknown",
      reviewer_name: reviewerName,
    });

    setReviewComment(data.review_comment || "");
  }

  async function reviewIncident() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { error } = await supabase
      .from("timeline_entries")
      .update({
        reviewed: true,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_comment: reviewComment.trim() || null,
      })
      .eq("id", incidentId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadIncident();
  }

  useEffect(() => {
    loadIncident();
  }, []);

  if (!incident) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Link
        href={`/service-user/${incident.service_user_id}`}
        className="text-slate-400"
      >
        ← Back to Timeline
      </Link>

      <div className="mt-6 rounded-2xl bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              {new Date(incident.created_at).toLocaleString("en-GB")}
            </p>

            <h1 className="mt-2 text-3xl font-bold">Incident</h1>

            <p className="mt-2 text-slate-400">
              {incident.service_user_name}
            </p>
          </div>

          {incident.reviewed && (
            <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
              Reviewed
            </span>
          )}
        </div>

        <p className="mt-6 whitespace-pre-line text-lg">
          {incident.content}
        </p>

        <p className="mt-8 text-sm text-slate-500">
          Entered by {incident.staff_name}
        </p>
      </div>

      {incident.reviewed && (
        <div className="mt-6 rounded-2xl bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Manager Review</h2>

          <p className="mt-2 text-sm text-slate-400">
            Reviewed by {incident.reviewer_name || "Unknown manager"}
            {incident.reviewed_at &&
              ` on ${new Date(incident.reviewed_at).toLocaleString("en-GB")}`}
          </p>

          {incident.review_comment && (
            <p className="mt-4 whitespace-pre-line text-lg">
              {incident.review_comment}
            </p>
          )}
        </div>
      )}

      {role === "manager" && !incident.reviewed && (
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 space-y-4">
          <h2 className="text-xl font-bold">Review Incident</h2>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Manager review comments..."
            className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
          />

          <button
            onClick={reviewIncident}
            className="w-full rounded-xl bg-green-600 p-4 font-semibold"
          >
            Mark as Reviewed
          </button>
        </div>
      )}
    </main>
  );
}