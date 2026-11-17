-- Multi-service organisation foundation.
-- Services belong to organisations; a provider can operate multiple care models.
CREATE TABLE public.care_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name text NOT NULL,
  care_model text NOT NULL CHECK (care_model IN ('supported_living', 'domiciliary', 'residential')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, care_model, name)
);
CREATE INDEX care_services_organisation_id_idx ON public.care_services(organisation_id);
ALTER TABLE public.care_services ENABLE ROW LEVEL SECURITY;

-- Initial configuration is limited to Castodia platform administrators.
-- Service-level manager/staff access will be added with memberships and permissions.
CREATE POLICY "Core administrators can read services" ON public.care_services
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('castodia_owner', 'castodia_admin')
  ));
CREATE POLICY "Core administrators can create services" ON public.care_services
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('castodia_owner', 'castodia_admin')
  ));
CREATE POLICY "Core administrators can update services" ON public.care_services
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('castodia_owner', 'castodia_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('castodia_owner', 'castodia_admin')
  ));

-- Backfill existing organisations as supported living without modifying their records.
INSERT INTO public.care_services (organisation_id, name, care_model)
SELECT id, 'Supported Living', 'supported_living'
FROM public.organisations
ON CONFLICT (organisation_id, care_model, name) DO NOTHING;
