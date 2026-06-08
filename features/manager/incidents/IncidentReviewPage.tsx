"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, UserRound } from "lucide-react";
import { PageContainer, PageHeader, SectionCard } from "@/components/layouts";
import { supabase } from "@/lib/supabase";
import type { Incident } from "./types";

export default function IncidentReviewPage() {
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadIncident() {
    setLoading(true);

    const { data, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("id", incidentId)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
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

    const { data: staffProfile } = await supabase
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
      staff_name: staffProfile?.full_name || "Unknown staff member",
      service_user_name: serviceUser?.full_name || "Unknown service user",
      reviewer_name: reviewerName,
    });

    setReviewComment(data.review_comment || "");
    setLoading(false);
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

  if (loading) {
    return (
      <PageContainer>
        <SectionCard>
          <p className="text-sm text-slate-400">Loading incident...</p>
        </SectionCard>
      </PageContainer>
    );
  }

  if (!incident) {
    return (
      <PageContainer>
        <SectionCard>
          <p className="text-sm text-slate-400">Incident not found.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        href="/manager/incidents"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to incidents
      </Link>

      <PageHeader
        title="Incident Review"
        subtitle="Review incident details, staff recording and management actions."
      >
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            incident.reviewed
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-300"
          }`}
        >
          {incident.reviewed ? "Reviewed" : "Awaiting review"}
        </span>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                {new Date(incident.created_at).toLocaleString("en-GB")}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Incident Details
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {incident.service_user_name}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <p className="whitespace-pre-line text-base leading-7 text-slate-100">
              {incident.content}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <UserRound size={16} />
              Recorded by {incident.staff_name}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock size={16} />
              {new Date(incident.created_at).toLocaleString("en-GB")}
            </span>
          </div>
        </SectionCard>

        <div className="space-y-4">
          {incident.reviewed ? (
            <SectionCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                  <CheckCircle size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Manager Review
                  </h2>
                  <p className="text-sm text-slate-400">
                    Reviewed by {incident.reviewer_name || "Unknown manager"}
                  </p>
                </div>
              </div>

              {incident.reviewed_at && (
                <p className="mt-4 text-sm text-slate-400">
                  {new Date(incident.reviewed_at).toLocaleString("en-GB")}
                </p>
              )}

              {incident.review_comment ? (
                <p className="mt-4 whitespace-pre-line rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-slate-100">
                  {incident.review_comment}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  No review comment recorded.
                </p>
              )}
            </SectionCard>
          ) : role === "manager" ? (
            <SectionCard>
              <h2 className="text-xl font-bold text-white">
                Complete Review
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Add management comments before marking this incident as
                reviewed.
              </p>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Manager review comments..."
                className="mt-5 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500"
              />

              <button
                onClick={reviewIncident}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 p-4 font-semibold text-white"
              >
                Mark as Reviewed
              </button>
            </SectionCard>
          ) : (
            <SectionCard>
              <p className="text-sm text-slate-400">
                This incident is awaiting manager review.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}