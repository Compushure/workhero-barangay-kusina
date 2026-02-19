-- Add performance_score to user_attributes view
-- performance_score = (count of approved KPITask) × (sum of KPICategory.points for those tasks)
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
  COALESCE(
    (
      SELECT COUNT(*)::bigint * NULLIF(SUM(kc.points), 0)
      FROM "KPITask" kt
      JOIN "KPICategory" kc ON kt.category_id = kc.id
      WHERE kt.assigned_to = u.id AND kt.status = 'approved'
    ),
    0
  )::bigint AS performance_score
FROM "User" u
LEFT JOIN "Role" r ON r.id = u.role_id
GROUP BY u.id, u.role_id, u.name, u.email, u.date_added, u.employee_id, u.employment_status, u.contact_details, u.home_address, u.tin_id, u.sss_id, u.pagibig_id, r.id, r.type, u.xp, u.level, u.points, u.deducted_points, u.is_tenured, u.total_xp;
