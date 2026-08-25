-- Castodia product rename: Platform -> CastodiaCore.
-- Historical migrations remain unchanged; this migration renames the live objects.

ALTER FUNCTION private.is_platform_admin() RENAME TO is_core_admin;

ALTER TABLE public.platform_issues RENAME TO core_issues;

ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_category_check TO core_issues_category_check;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_organisation_id_fkey TO core_issues_organisation_id_fkey;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_pkey TO core_issues_pkey;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_priority_check TO core_issues_priority_check;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_status_check TO core_issues_status_check;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_ticket_number_key TO core_issues_ticket_number_key;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_assigned_to_fkey TO core_issues_assigned_to_fkey;
ALTER TABLE public.core_issues
  RENAME CONSTRAINT platform_issues_reported_by_fkey TO core_issues_reported_by_fkey;

DO $$
BEGIN
  IF to_regclass('public.platform_issues_ticket_number_seq') IS NOT NULL THEN
    ALTER SEQUENCE public.platform_issues_ticket_number_seq
      RENAME TO core_issues_ticket_number_seq;
  END IF;
END;
$$;
