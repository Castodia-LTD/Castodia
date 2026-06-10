"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Incident } from "./types";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

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
      <CastodiaPageShell
        title="Incident Review"
        description="Review incident details, staff recording and management actions."
      >
        <CastodiaCard>
          <p className="text-sm text-slate-500">Loading incident...</p>
        </CastodiaCard>
      </CastodiaPageShell>
    );
  }

  if (!incident) {
    return (
      <CastodiaPageShell
        title="Incident Review"
        description="Review incident details, staff recording and management actions."
      >
        <CastodiaCard>
          <p className="text-sm text-slate-500">Incident not found.</p>
        </CastodiaCard>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell
      title="Incident Review"
      description="Review incident details, staff recording and management actions."
      maxWidth="wide"
      actions={
        <div className="flex items-center gap-3">
          <CastodiaBadge variant={incident.reviewed ? "success" : "warning"}>
            {incident.reviewed ? "Reviewed" : "Awaiting review"}
          </CastodiaBadge>

          <Link href="/manager/incidents">
            <CastodiaButton variant="secondary">
              <ArrowLeft size={16} />
              Back
            </CastodiaButton>
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <CastodiaCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                {new Date(incident.created_at).toLocaleString("en-GB")}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Incident Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {incident.service_user_name}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="whitespace-pre-line text-base leading-7 text-slate-800">
              {incident.content}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <UserRound size={16} />
              Recorded by {incident.staff_name}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock size={16} />
              {new Date(incident.created_at).toLocaleString("en-GB")}
            </span>
          </div>
        </CastodiaCard>

        <div className="space-y-4">
          {incident.reviewed ? (
            <CastodiaCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <CheckCircle size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Manager Review
                  </h2>
                  <p className="text-sm text-slate-500">
                    Reviewed by {incident.reviewer_name || "Unknown manager"}
                  </p>
                </div>
              </div>

              {incident.reviewed_at && (
                <p className="mt-4 text-sm text-slate-500">
                  {new Date(incident.reviewed_at).toLocaleString("en-GB")}
                </p>
              )}

              {incident.review_comment ? (
                <p className="mt-4 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
                  {incident.review_comment}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No review comment recorded.
                </p>
              )}
            </CastodiaCard>
          ) : role === "manager" ? (
            <CastodiaCard>
              <h2 className="text-xl font-bold text-slate-950">
                Complete Review
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add management comments before marking this incident as
                reviewed.
              </p>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Manager review comments..."
                className="mt-5 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />

              <CastodiaButton
                onClick={reviewIncident}
                variant="success"
                className="mt-4 w-full"
              >
                Mark as Reviewed
              </CastodiaButton>
            </CastodiaCard>
          ) : (
            <CastodiaCard>
              <p className="text-sm text-slate-500">
                This incident is awaiting manager review.
              </p>
            </CastodiaCard>
          )}
        </div>
      </div>
    </CastodiaPageShell>
  );
}