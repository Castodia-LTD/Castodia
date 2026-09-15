import { createClient } from "@/lib/supabase/client";

export type MfaPreparation =
  | {
      mode: "verify";
      factorId: string;
    }
  | {
      mode: "enroll";
      factorId: string;
      qrCode: string;
      secret: string;
    };

export async function prepareMfa(
  enrollmentRequired: boolean,
): Promise<MfaPreparation> {
  const supabase = createClient();

  if (!enrollmentRequired) {
    const { data: factors, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new Error(error.message);

    const factor = factors.totp.find(
      (item) => item.status === "verified",
    );

    if (!factor) {
      throw new Error(
        "Your multi-factor authentication setup could not be found. Please sign in again.",
      );
    }

    return {
      mode: "verify",
      factorId: factor.id,
    };
  }

  const { data: factors, error: factorError } =
    await supabase.auth.mfa.listFactors();

  if (factorError) throw new Error(factorError.message);

  for (const factor of factors.totp) {
    if (factor.status === "unverified") {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (unenrollError) throw new Error(unenrollError.message);
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Castodia Authenticator",
  });

  if (error) throw new Error(error.message);

  return {
    mode: "enroll",
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function verifyMfa(
  preparation: MfaPreparation,
  code: string,
): Promise<void> {
  const trimmedCode = code.replace(/\s+/g, "");

  if (!/^\d{6}$/.test(trimmedCode)) {
    throw new Error("Enter the 6-digit code from your authenticator app.");
  }

  const supabase = createClient();
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: preparation.factorId,
    });

  if (challengeError) throw new Error(challengeError.message);

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: preparation.factorId,
    challengeId: challenge.id,
    code: trimmedCode,
  });

  if (verifyError) throw new Error(verifyError.message);

  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) throw new Error(aalError.message);

  if (aal.currentLevel !== "aal2") {
    throw new Error(
      "Multi-factor authentication could not be confirmed. Please try again.",
    );
  }
}

export async function cancelMfa(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
