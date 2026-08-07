export const DEMO_ORGANISATION_ID =
  "ae4210c8-9331-42c1-848e-be27a2113557";

export const DEMO_ENGINE_VERSION = "1.0";

export const DEMO_GENERATED_FLAG = "demo_generated";

export const DEMO_TIMELINE_RETENTION_DAYS = 14;

export const DEMO_GENERATION_WINDOW_DAYS = 3;

export function assertDemoOrganisation(
  organisationId: string,
) {
  if (!organisationId) {
    throw new Error(
      "Demo organisation ID was not provided.",
    );
  }

  if (
    organisationId !== DEMO_ORGANISATION_ID
  ) {
    throw new Error(
      "Demo Engine safety lock: this operation can only run against the configured Castodia demo organisation.",
    );
  }
}