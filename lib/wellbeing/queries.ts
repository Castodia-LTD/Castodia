import { supabase } from "@/lib/supabase";
import { generateWellbeingNarrative } from "./generateNarrative";

export async function createWellbeingObservation({
  serviceUserId,
  serviceUserName,
  overallPresentationScore,
  overallPresentationLabel,
  observedIndicators,
  notes,
  recordedBy,
}: {
  serviceUserId: string;
  serviceUserName: string;
  overallPresentationScore: number;
  overallPresentationLabel: string;
  observedIndicators: string[];
  notes: string;
  recordedBy: string;
}) {
  const narrative = generateWellbeingNarrative(
    serviceUserName,
    observedIndicators
  );

  const { error: observationError } = await supabase
    .from("wellbeing_observations")
    .insert({
      service_user_id: serviceUserId,
      overall_presentation_score: overallPresentationScore,
      overall_presentation_label: overallPresentationLabel,
      observed_indicators: observedIndicators,
      notes: notes.trim() || null,
      recorded_by: recordedBy,
    });

  if (observationError) throw observationError;

  const timelineContent = [
    `Overall Presentation: ${overallPresentationLabel}`,
    "",
    narrative,
    observedIndicators.length
      ? `Observed indicators: ${observedIndicators.join(", ")}`
      : "",
    notes.trim() ? `Additional Notes: ${notes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { error: timelineError } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: recordedBy,
      entry_type: "Wellbeing Observation",
      content: timelineContent,
      event_time: new Date().toISOString(),
    });

  if (timelineError) throw timelineError;
}

export async function getServiceUserWellbeingIndicators(serviceUserId: string) {
  
  const { data, error } = await supabase
    .from("service_user_wellbeing_indicators")
    .select("*")
    .eq("service_user_id", serviceUserId)
    .eq("is_active", true)
    .order("label", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function createServiceUserWellbeingIndicator(
  serviceUserId: string,
  label: string,
  userId: string
) {
  

  const { data, error } = await supabase
    .from("service_user_wellbeing_indicators")
    .insert({
      service_user_id: serviceUserId,
      label: label.trim(),
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deactivateServiceUserWellbeingIndicator(id: string) {
  

  const { error } = await supabase
    .from("service_user_wellbeing_indicators")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}