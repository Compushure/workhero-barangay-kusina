-- Migration: Fix leaderboard badge cutoff leakage into past ranking generations
-- Date: 2026-03-24
-- Purpose:
--   1) Make get_leaderboard_as_of(p_cutoff) include only badges acquired on/before the cutoff
--   2) Keep get_employee_rank_as_of(p_user_id, p_cutoff) consistent with leaderboard math
--   3) Recompute stored RankingEntry snapshots using each period's own end-of-period cutoff

CREATE OR REPLACE FUNCTION public.get_employee_rank_as_of(
  p_user_id uuid,
  p_cutoff timestamp with time zone
)
RETURNS TABLE(employee_rank bigint, total_employees bigint, performance_score bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH badge_points AS (
    SELECT
      ub.awarded_to AS user_id,
      COALESCE(SUM(b.points), 0)::bigint AS badge_points
    FROM public."UserBadges" ub
    JOIN public."Badges" b ON b.id = ub.badge_id
    WHERE ub.date_acquired IS NOT NULL
      AND ub.date_acquired <= p_cutoff
    GROUP BY ub.awarded_to
  ),
  user_kpis AS (
    SELECT
      kt.assigned_to AS user_id,
      COALESCE(
        SUM(
          kc.points * LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
        ),
        0
      )::bigint AS total_kpi_points,
      COALESCE(
        SUM(
          CASE
            WHEN COALESCE(kt.max_orders, 0) > 0 AND COALESCE(kt.completed_orders, 0) >= kt.max_orders THEN 1
            WHEN COALESCE(kt.max_orders, 0) = 0 AND COALESCE(kt.completed_orders, 0) > 0 THEN 1
            ELSE 0
          END
        ),
        0
      )::bigint AS task_count
    FROM public."KPITask" kt
    JOIN public."KPICategory" kc ON kc.id = kt.category_id
    WHERE kt.status = 'approved'
      AND kt.points_claimed_at IS NOT NULL
      AND kt.points_claimed_at <= p_cutoff
    GROUP BY kt.assigned_to
  ),
  user_performance AS (
    SELECT
      u.id AS user_id,
      COALESCE(uk.task_count, 0)::bigint AS task_count,
      COALESCE(uk.total_kpi_points, 0)::bigint AS total_kpi_points,
      COALESCE(bp.badge_points, 0)::bigint AS badge_points,
      ((COALESCE(uk.total_kpi_points, 0) * COALESCE(uk.task_count, 0)) + COALESCE(bp.badge_points, 0))::bigint AS perf_score
    FROM public."User" u
    JOIN public."Role" r ON r.id = u.role_id AND r.type = 'regular'
    LEFT JOIN user_kpis uk ON uk.user_id = u.id
    LEFT JOIN badge_points bp ON bp.user_id = u.id
  ),
  ranked_employees AS (
    SELECT
      up.user_id,
      RANK() OVER (ORDER BY up.perf_score DESC) AS user_rank,
      up.perf_score AS performance_score
    FROM user_performance up
  ),
  total_count AS (
    SELECT COUNT(*)::bigint AS count
    FROM public."User" u
    JOIN public."Role" r ON r.id = u.role_id AND r.type = 'regular'
  )
  SELECT
    re.user_rank::bigint AS employee_rank,
    tc.count AS total_employees,
    re.performance_score::bigint AS performance_score
  FROM ranked_employees re
  CROSS JOIN total_count tc
  WHERE re.user_id = p_user_id;
END;
$$;

ALTER FUNCTION public.get_employee_rank_as_of(uuid, timestamp with time zone) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_leaderboard_as_of(
  p_cutoff timestamp with time zone
)
RETURNS TABLE(
  user_id uuid,
  user_name text,
  performance_score bigint,
  total_kpi_points bigint,
  badge_points bigint,
  task_count bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH badge_points AS (
    SELECT
      ub.awarded_to AS user_id,
      COALESCE(SUM(b.points), 0)::bigint AS badge_points
    FROM "UserBadges" ub
    JOIN "Badges" b ON ub.badge_id = b.id
    WHERE ub.date_acquired IS NOT NULL
      AND ub.date_acquired <= p_cutoff
    GROUP BY ub.awarded_to
  ),
  user_kpis AS (
    SELECT
      kt.assigned_to AS user_id,
      COALESCE(
        SUM(
          kc.points * LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
        ),
        0
      )::bigint AS total_kpi_points,
      COALESCE(
        SUM(
          CASE
            WHEN COALESCE(kt.max_orders, 0) > 0 AND COALESCE(kt.completed_orders, 0) >= kt.max_orders THEN 1
            WHEN COALESCE(kt.max_orders, 0) = 0 AND COALESCE(kt.completed_orders, 0) > 0 THEN 1
            ELSE 0
          END
        ),
        0
      )::bigint AS task_count
    FROM "KPITask" kt
    JOIN "KPICategory" kc ON kt.category_id = kc.id
    WHERE kt.status = 'approved'
      AND kt.points_claimed_at IS NOT NULL
      AND kt.points_claimed_at <= p_cutoff
    GROUP BY kt.assigned_to
  ),
  computed AS (
    SELECT
      u.id AS user_id,
      u.name::text AS user_name,
      ((COALESCE(uk.total_kpi_points, 0) * COALESCE(uk.task_count, 0)) + COALESCE(bp.badge_points, 0))::bigint AS performance_score,
      COALESCE(uk.total_kpi_points, 0)::bigint AS total_kpi_points,
      COALESCE(bp.badge_points, 0)::bigint AS badge_points,
      COALESCE(uk.task_count, 0)::bigint AS task_count
    FROM "User" u
    JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
    JOIN user_kpis uk ON uk.user_id = u.id
    LEFT JOIN badge_points bp ON bp.user_id = u.id
  )
  SELECT
    user_id,
    user_name,
    performance_score,
    total_kpi_points,
    badge_points,
    task_count,
    DENSE_RANK() OVER (ORDER BY performance_score DESC) AS rank
  FROM computed
  ORDER BY performance_score DESC, user_name ASC;
$$;

ALTER FUNCTION public.get_leaderboard_as_of(timestamp with time zone) OWNER TO postgres;

WITH recomputed_entries AS (
  SELECT
    rp.id AS ranking_period_id,
    lb.user_id,
    lb.rank,
    lb.performance_score,
    lb.total_kpi_points,
    lb.badge_points,
    lb.task_count
  FROM public."RankingPeriod" rp
  CROSS JOIN LATERAL public.get_leaderboard_as_of(
    (((rp.period_end::timestamp + interval '1 day') - interval '1 millisecond') AT TIME ZONE 'Asia/Manila')
  ) lb
)
UPDATE public."RankingEntry" re
SET
  rank = r.rank,
  performance_score = r.performance_score,
  total_kpi_points = r.total_kpi_points,
  badge_points = r.badge_points,
  completed_task_count = r.task_count
FROM recomputed_entries r
WHERE re.ranking_period_id = r.ranking_period_id
  AND re.user_id = r.user_id;
