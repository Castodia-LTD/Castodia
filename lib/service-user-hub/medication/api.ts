import { supabase } from "@/lib/supabase";

export type HubMedicationRecord = {
  id: string;
  service_user_id: string;
  medication_name: string;
  dose: string;
  route: string | null;
  round: string | null;
  instructions: string | null;
  is_prn: boolean;
  active: boolean;
  locked: boolean;
};

function requiredText(
  value: string,
  fieldName: string,
) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanValue;
}

export async function getMedicationProfiles(
  serviceUserId: string,
): Promise<HubMedicationRecord[]> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const { data, error } = await supabase
    .from("medication_profiles")
    .select(`
      id,
      service_user_id,
      medication_name,
      dose,
      route,
      round,
      instructions,
      is_prn,
      active,
      locked
    `)
    .eq("service_user_id", cleanServiceUserId)
    .order("active", {
      ascending: false,
    })
    .order("medication_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as HubMedicationRecord[];
}

export async function getActiveMedicationProfiles(
  serviceUserId: string,
): Promise<HubMedicationRecord[]> {
  const medications =
    await getMedicationProfiles(serviceUserId);

  return medications.filter(
    (medication) => medication.active,
  );
}