-- Add total_points_earned to User (monotonically increasing; used for leaderboard performance_score)
ALTER TABLE public."User"
ADD COLUMN IF NOT EXISTS total_points_earned bigint NOT NULL DEFAULT 0;

-- Backfill from claimed KPITask: sum of KPICategory.points where points_claimed_at IS NOT NULL
UPDATE public."User" u
SET total_points_earned = COALESCE(
  (
    SELECT SUM(kc.points)::bigint
    FROM "KPITask" kt
    JOIN "KPICategory" kc ON kt.category_id = kc.id
    WHERE kt.assigned_to = u.id AND kt.points_claimed_at IS NOT NULL
  ),
  0
);

-- Update RPC to also increment total_points_earned (existing logic already increments points)
DROP FUNCTION IF EXISTS public.increment_points_for_user(uuid, integer);

CREATE OR REPLACE FUNCTION public.increment_points_for_user(target_user_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."User"
  SET
    points = COALESCE(points, 0) + amount,
    total_points_earned = COALESCE(total_points_earned, 0) + amount
  WHERE id = target_user_id;
END;
$$;

-- Recreate user_attributes view: performance_score = (approved task count) × total_points_earned
DROP VIEW IF EXISTS public.user_attributes;

CREATE VIEW public.user_attributes AS
SELECT
  u.id AS user_id,
  u.role_id AS user_role_id,
  u.name AS user_name,
  u.email AS user_email,
  u.date_added AS user_date_added,
  u.employee_id,
  u.employment_status,
  u.contact_details,
  u.home_address,
  u.tin_id,
  u.sss_id,
  u.pagibig_id,
  r.id AS role_id,
  r.type AS role_type,
  u.xp,
  u.level AS user_level,
  u.points,
  u.deducted_points,
  u.is_tenured,
  u.total_xp,
  u.total_points_earned,
  (
    (SELECT COUNT(*)::bigint FROM "KPITask" kt WHERE kt.assigned_to = u.id AND kt.status = 'approved')
    * COALESCE(u.total_points_earned, 0)
  )::bigint AS performance_score
FROM "User" u
LEFT JOIN "Role" r ON r.id = u.role_id
GROUP BY u.id, u.role_id, u.name, u.email, u.date_added, u.employee_id, u.employment_status, u.contact_details, u.home_address, u.tin_id, u.sss_id, u.pagibig_id, r.id, r.type, u.xp, u.level, u.points, u.deducted_points, u.is_tenured, u.total_xp, u.total_points_earned;
