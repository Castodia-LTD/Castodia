-- Classify each person by the care model used to route their rota.
-- Existing records are treated as Supported Living to preserve existing access.
ALTER TABLE public.service_users
  ADD COLUMN care_model text NOT NULL DEFAULT 'supported_living'
  CONSTRAINT service_users_care_model_check
    CHECK (care_model IN ('supported_living', 'domiciliary', 'residential'));

CREATE INDEX service_users_organisation_care_model_idx
  ON public.service_users (organisation_id, care_model)
  WHERE is_active = true;
