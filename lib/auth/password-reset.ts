import { createClient } from "@/lib/supabase/client";

export async function requestPasswordReset(
  email: string,
  redirectUrl: string,
): Promise<void> {
  const trimmedEmail =
    email.trim().toLowerCase();

  if (!trimmedEmail) {
    throw new Error(
      "Enter your email address before requesting a password reset.",
    );
  }

  const supabase = createClient();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      {
        redirectTo: redirectUrl,
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}