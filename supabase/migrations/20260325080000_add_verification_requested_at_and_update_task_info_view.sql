-- Migration: Add verification_requested_at to KPITask and expose it in task_info_view
-- Date: 2026-03-25
-- Purpose:
--   1. Track when an employee submits a task assignment for manager verification
--   2. Expose that timestamp in task_info_view for manager verification sorting/display

ALTER TABLE public."KPITask"
ADD COLUMN IF NOT EXISTS verification_requested_at timestamp with time zone;

COMMENT ON COLUMN public."KPITask".verification_requested_at
IS 'Timestamp when employee submits the task for verification (in review). Updated on each resubmission.';

DO $$
DECLARE
  view_sql text;
BEGIN
  SELECT pg_get_viewdef('public.task_info_view'::regclass, true)
    INTO view_sql;

  IF position('kpitask_verification_requested_at' in view_sql) = 0 THEN
    view_sql := regexp_replace(
      view_sql,
      'k\\.created_at\\s+AS\\s+kpitask_created_at',
      'k.created_at AS kpitask_created_at, k.verification_requested_at AS kpitask_verification_requested_at',
      'i'
    );

    EXECUTE 'CREATE OR REPLACE VIEW public.task_info_view AS ' || view_sql;
  END IF;
END $$;