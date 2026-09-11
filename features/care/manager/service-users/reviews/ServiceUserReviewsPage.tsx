"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Check, ChevronDown, ChevronUp, Plus, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type ResponseValue = "yes" | "not_sure" | "no" | "";

type ReviewResponses = {
  home: ResponseValue;
  staffSupport: ResponseValue;
  meals: ResponseValue;
  choices: ResponseValue;
  family: ResponseValue;
  unhappy: ResponseValue;
  activities: ResponseValue;
  needsAnything: ResponseValue;
  wantsToTalk: ResponseValue;
  homeNotes: string;
  staffNotes: string;
  mealsNotes: string;
  choicesNotes: string;
  familyNotes: string;
  unhappyNotes: string;
  activitiesNotes: string;
  needsNotes: string;
  talkNotes: string;
};

type ConsentState = {
  personalCare: ResponseValue;
  medication: ResponseValue;
  personalInformation: ResponseValue;
  unannouncedVisits: ResponseValue;
};

type ReviewRow = {
  id: string;
  review_month: string;
  meeting_date: string;
  completed_at: string | null;
  reviewer_name: string | null;
  responses: ReviewResponses;
};

const emptyResponses: ReviewResponses = {
  home: "",
  staffSupport: "",
  meals: "",
  choices: "",
  family: "",
  unhappy: "",
  activities: "",
  needsAnything: "",
  wantsToTalk: "",
  homeNotes: "",
  staffNotes: "",
  mealsNotes: "",
  choicesNotes: "",
  familyNotes: "",
  unhappyNotes: "",
  activitiesNotes: "",
  needsNotes: "",
  talkNotes: "",
};

const emptyConsent: ConsentState = {
  personalCare: "",
  medication: "",
  personalInformation: "",
  unannouncedVisits: "",
};

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function formatMonth(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function ResponseCards({
  value,
  onChange,
}: {
  value: ResponseValue;
  onChange: (value: ResponseValue) => void;
}) {
  const options: { value: ResponseValue; label: string; helper: string }[] = [
    { value: "yes", label: "Yes", helper: "Happy / positive" },
    { value: "not_sure", label: "Not sure", helper: "Unsure / mixed" },
    { value: "no", label: "No", helper: "Not happy / negative" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              selected
                ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/10"
                : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-950">{option.label}</span>
              {selected ? <Check size={17} className="text-teal-600" /> : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">{option.helper}</p>
          </button>
        );
      })}
    </div>
  );
}

function ReviewQuestion({
  title,
  prompt,
  value,
  notes,
  onValue,
  onNotes,
  notesPlaceholder = "Add the person's own words or any useful context...",
}: {
  title: string;
  prompt: string;
  value: ResponseValue;
  notes: string;
  onValue: (value: ResponseValue) => void;
  onNotes: (value: string) => void;
  notesPlaceholder?: string;
}) {
  const [open, setOpen] = useState(Boolean(notes));

  return (
    <CastodiaCard padding="md">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">{title}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-950">{prompt}</h3>
      <div className="mt-4">
        <ResponseCards value={value} onChange={onValue} />
      </div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {open ? "Hide notes" : "Add their words / context"}
      </button>
      {open ? (
        <textarea
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          rows={3}
          placeholder={notesPlaceholder}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
        />
      ) : null}
    </CastodiaCard>
  );
}

export default function ServiceUserReviewsPage() {
  const params = useParams<{ id: string }>();
  const serviceUserId = params.id;

  const [serviceUserName, setServiceUserName] = useState("Person");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reviewMonth, setReviewMonth] = useState(monthStart());
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [responses, setResponses] = useState<ReviewResponses>(emptyResponses);
  const [consent, setConsent] = useState<ConsentState>(emptyConsent);
  const [serviceUserComments, setServiceUserComments] = useState("");
  const [actions, setActions] = useState("");
  const [capacityStatus, setCapacityStatus] = useState("");
  const [bestInterestDecisionCopy, setBestInterestDecisionCopy] = useState<boolean | null>(null);
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeRelationship, setRepresentativeRelationship] = useState("");
  const [serviceUserConfirmed, setServiceUserConfirmed] = useState(false);

  async function loadPage() {
    if (!serviceUserId) return;
    setLoading(true);

    const [{ data: person }, { data: reviewRows, error: reviewError }] = await Promise.all([
      supabase.from("service_users").select("full_name").eq("id", serviceUserId).maybeSingle(),
      supabase
        .from("monthly_service_user_reviews")
        .select("id, review_month, meeting_date, completed_at, reviewer_name, responses")
        .eq("service_user_id", serviceUserId)
        .order("review_month", { ascending: false }),
    ]);

    if (person?.full_name) setServiceUserName(person.full_name);
    if (reviewError) {
      console.error("Unable to load monthly check-ins", reviewError);
      setReviews([]);
    } else {
      setReviews((reviewRows ?? []) as ReviewRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadPage();
  }, [serviceUserId]);

  function updateResponse<K extends keyof ReviewResponses>(key: K, value: ReviewResponses[K]) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  const answeredCount = useMemo(() => {
    const keys: (keyof ReviewResponses)[] = [
      "home",
      "staffSupport",
      "meals",
      "choices",
      "family",
      "unhappy",
      "activities",
      "needsAnything",
      "wantsToTalk",
    ];
    return keys.filter((key) => Boolean(responses[key])).length;
  }, [responses]);

  function resetForm() {
    setReviewMonth(monthStart());
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setResponses(emptyResponses);
    setConsent(emptyConsent);
    setServiceUserComments("");
    setActions("");
    setCapacityStatus("");
    setBestInterestDecisionCopy(null);
    setRepresentativeName("");
    setRepresentativeRelationship("");
    setServiceUserConfirmed(false);
    setSaveError(null);
  }

  async function saveReview() {
    if (saving) return;
    if (answeredCount < 9) {
      setSaveError("Please complete all nine monthly check-in questions before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("You must be logged in to save this check-in.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const reviewMonthValue = `${reviewMonth.slice(0, 7)}-01`;
      const actionItems = actions
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ text: item, completed: false }));

      const payload = {
        service_user_id: serviceUserId,
        reviewer_id: user.id,
        review_month: reviewMonthValue,
        meeting_date: meetingDate,
        responses,
        consent,
        actions: actionItems,
        service_user_comments: serviceUserComments.trim() || null,
        reviewer_name: profile?.full_name || user.email || "Manager",
        service_user_name: serviceUserName,
        representative_name: representativeName.trim() || null,
        representative_relationship: representativeRelationship.trim() || null,
        capacity_status: capacityStatus || null,
        best_interest_decision_copy: bestInterestDecisionCopy,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("monthly_service_user_reviews")
        .upsert(payload, { onConflict: "service_user_id,review_month" });

      if (error) throw error;

      setEditing(false);
      resetForm();
      await loadPage();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save the monthly check-in.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CastodiaPageShell
      title="Reviews"
      description={`Monthly check-ins and formal reviews for ${serviceUserName}.`}
      maxWidth="wide"
    >
      {!editing ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Monthly Check-Ins</h2>
              <p className="mt-1 text-sm text-slate-500">Keep the person's voice, choices and lived experience visible month by month.</p>
            </div>
            <CastodiaButton onClick={() => setEditing(true)}>
              <span className="inline-flex items-center gap-2"><Plus size={17} /> New monthly check-in</span>
            </CastodiaButton>
          </div>

          {loading ? (
            <CastodiaCard><p className="text-sm text-slate-500">Loading monthly check-ins...</p></CastodiaCard>
          ) : reviews.length === 0 ? (
            <CastodiaCard>
              <div className="py-8 text-center">
                <CalendarDays className="mx-auto text-teal-600" size={34} />
                <h2 className="mt-3 text-lg font-semibold text-slate-950">No monthly check-ins yet</h2>
                <p className="mt-1 text-sm text-slate-500">Create the first check-in to begin a monthly record of the person's views and agreed actions.</p>
              </div>
            </CastodiaCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => (
                <CastodiaCard key={review.id} interactive>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">Monthly check-in</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950">{formatMonth(review.review_month)}</h2>
                    </div>
                    <CastodiaBadge variant={review.completed_at ? "success" : "warning"}>
                      {review.completed_at ? "Completed" : "Draft"}
                    </CastodiaBadge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="inline-flex items-center gap-2"><CalendarDays size={15} /> {new Date(`${review.meeting_date}T12:00:00`).toLocaleDateString("en-GB")}</p>
                    <p className="inline-flex items-center gap-2"><UserRound size={15} /> {review.reviewer_name || "Manager"}</p>
                  </div>
                </CastodiaCard>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <CastodiaCard padding="md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">Monthly check-in</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{serviceUserName}</h2>
                <p className="mt-1 text-sm text-slate-500">Ask the questions directly wherever possible and record the person's own words when they add meaning.</p>
              </div>
              <CastodiaButton variant="secondary" onClick={() => { setEditing(false); resetForm(); }}>Cancel</CastodiaButton>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Check-in month
                <input type="month" value={reviewMonth.slice(0, 7)} onChange={(event) => setReviewMonth(`${event.target.value}-01`)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Meeting date
                <input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15" />
              </label>
            </div>
          </CastodiaCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReviewQuestion title="Home" prompt="How are you finding it at your home?" value={responses.home} notes={responses.homeNotes} onValue={(value) => updateResponse("home", value)} onNotes={(value) => updateResponse("homeNotes", value)} />
            <ReviewQuestion title="Staff support" prompt="Do you like the staff and the support you receive?" value={responses.staffSupport} notes={responses.staffNotes} onValue={(value) => updateResponse("staffSupport", value)} onNotes={(value) => updateResponse("staffNotes", value)} />
            <ReviewQuestion title="Meals" prompt="Do you like your meals?" value={responses.meals} notes={responses.mealsNotes} onValue={(value) => updateResponse("meals", value)} onNotes={(value) => updateResponse("mealsNotes", value)} />
            <ReviewQuestion title="Making choices" prompt="Do you make your own choices?" value={responses.choices} notes={responses.choicesNotes} onValue={(value) => updateResponse("choices", value)} onNotes={(value) => updateResponse("choicesNotes", value)} />
            <ReviewQuestion title="Family & important people" prompt="Do you see the people who are important to you?" value={responses.family} notes={responses.familyNotes} onValue={(value) => updateResponse("family", value)} onNotes={(value) => updateResponse("familyNotes", value)} />
            <ReviewQuestion title="Wellbeing" prompt="Does anything make you unhappy or worried?" value={responses.unhappy} notes={responses.unhappyNotes} onValue={(value) => updateResponse("unhappy", value)} onNotes={(value) => updateResponse("unhappyNotes", value)} notesPlaceholder="Record what is making the person unhappy or worried and any action requested..." />
            <ReviewQuestion title="Activities" prompt="Do you enjoy your activities?" value={responses.activities} notes={responses.activitiesNotes} onValue={(value) => updateResponse("activities", value)} onNotes={(value) => updateResponse("activitiesNotes", value)} />
            <ReviewQuestion title="Support" prompt="Is there anything you need?" value={responses.needsAnything} notes={responses.needsNotes} onValue={(value) => updateResponse("needsAnything", value)} onNotes={(value) => updateResponse("needsNotes", value)} />
            <ReviewQuestion title="Your voice" prompt="Would you like to tell us anything?" value={responses.wantsToTalk} notes={responses.talkNotes} onValue={(value) => updateResponse("wantsToTalk", value)} onNotes={(value) => updateResponse("talkNotes", value)} notesPlaceholder="Record the person's own words wherever possible..." />
          </div>

          <CastodiaCard padding="md">
            <h2 className="text-lg font-semibold text-slate-950">The person's own summary</h2>
            <p className="mt-1 text-sm text-slate-500">What went well this month, what would they like to change, or what matters most right now?</p>
            <textarea value={serviceUserComments} onChange={(event) => setServiceUserComments(event.target.value)} rows={4} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15" placeholder="Use the person's own words where possible..." />
          </CastodiaCard>

          <CastodiaCard padding="md">
            <h2 className="text-lg font-semibold text-slate-950">Consent review</h2>
            <p className="mt-1 text-sm text-slate-500">Review the consent areas used in the monthly check-in.</p>
            <div className="mt-5 space-y-5">
              {([
                ["personalCare", "Personal care"],
                ["medication", "Administering medication"],
                ["personalInformation", "Holding personal information"],
                ["unannouncedVisits", "Unannounced visits"],
              ] as const).map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-3 font-semibold text-slate-800">{label}</p>
                  <ResponseCards value={consent[key]} onChange={(value) => setConsent((current) => ({ ...current, [key]: value }))} />
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Capacity / consent status
                <select value={capacityStatus} onChange={(event) => setCapacityStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-teal-500">
                  <option value="">Select status</option>
                  <option value="able_to_consent">Able to consent</option>
                  <option value="unable_to_consent">Unable to consent</option>
                  <option value="decision_specific">Decision-specific / requires review</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">Best interest decision copy
                <select value={bestInterestDecisionCopy === null ? "" : bestInterestDecisionCopy ? "yes" : "no"} onChange={(event) => setBestInterestDecisionCopy(event.target.value === "" ? null : event.target.value === "yes")} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-teal-500">
                  <option value="">Not applicable / not recorded</option>
                  <option value="yes">Copy held</option>
                  <option value="no">Copy not held</option>
                </select>
              </label>
            </div>

            {capacityStatus === "unable_to_consent" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Representative name
                  <input value={representativeName} onChange={(event) => setRepresentativeName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-500" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Relationship to person
                  <input value={representativeRelationship} onChange={(event) => setRepresentativeRelationship(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-500" />
                </label>
              </div>
            ) : null}
          </CastodiaCard>

          <CastodiaCard padding="md">
            <h2 className="text-lg font-semibold text-slate-950">Agreed actions for next month</h2>
            <p className="mt-1 text-sm text-slate-500">Add one action per line. These can later be connected to Growth goals and follow-up reminders.</p>
            <textarea value={actions} onChange={(event) => setActions(event.target.value)} rows={5} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15" placeholder={"Example: Arrange visit to local music group\nReview transport support for college"} />
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input type="checkbox" checked={serviceUserConfirmed} onChange={(event) => setServiceUserConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span><strong className="font-semibold text-slate-900">Person involved in the check-in</strong><br />Confirm that the person's views were sought and the check-in was discussed with them, or with their representative where appropriate.</span>
            </label>
          </CastodiaCard>

          {saveError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{saveError}</div> : null}

          <div className="sticky bottom-0 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{answeredCount}/9 monthly check-in questions completed</p>
              <CastodiaButton onClick={saveReview} disabled={saving || !serviceUserConfirmed}>
                <span className="inline-flex items-center gap-2"><Save size={17} /> {saving ? "Saving check-in..." : "Save monthly check-in"}</span>
              </CastodiaButton>
            </div>
          </div>
        </div>
      )}
    </CastodiaPageShell>
  );
}
