CREATE OR REPLACE FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) RETURNS TABLE("employee_rank" bigint, "total_employees" bigint, "performance_score" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH badge_points AS (
    SELECT
      ub.awarded_to AS user_id,
      COALESCE(SUM(b.points), 0)::bigint AS badge_points
    FROM "UserBadges" ub
    JOIN "Badges" b ON ub.badge_id = b.id
    GROUP BY ub.awarded_to
  ),
  user_kpis AS (
    -- Matches get_leaderboard_as_of logic
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
          LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
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
  user_performance AS (
    SELECT
      u.id AS user_id,
      (
        (COALESCE(uk.total_kpi_points, 0) * COALESCE(uk.task_count, 0))
        + COALESCE(bp.badge_points, 0)
      )::bigint AS perf_score
    FROM "User" u
    JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
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
    FROM "User" u
    JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
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


CREATE OR REPLACE FUNCTION "public"."get_leaderboard_as_of"("p_cutoff" timestamp with time zone) RETURNS TABLE("user_id" "uuid", "user_name" "text", "performance_score" bigint, "total_kpi_points" bigint, "badge_points" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH badge_points AS (
    SELECT
      ub.awarded_to AS user_id,
      COALESCE(SUM(b.points),0)::bigint AS badge_points
    FROM "UserBadges" ub
    JOIN "Badges" b ON ub.badge_id = b.id
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
          LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
        ),
        0
      )::bigint AS task_count
    FROM "KPITask" kt
    JOIN "KPICategory" kc ON kt.category_id = kc.id
    WHERE kt.status = 'approved'
      AND kt.points_claimed_at IS NOT NULL
      AND kt.points_claimed_at <= p_cutoff
    GROUP BY kt.assigned_to
  )
  SELECT
    u.id AS user_id,
    u.name::text AS user_name,
    ((COALESCE(uk.total_kpi_points, 0) * COALESCE(uk.task_count, 0)) + COALESCE(bp.badge_points, 0))::bigint AS performance_score,
    COALESCE(uk.total_kpi_points,0)::bigint AS total_kpi_points,
    COALESCE(bp.badge_points,0)::bigint AS badge_points
  FROM "User" u
  JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
  JOIN user_kpis uk ON uk.user_id = u.id
  LEFT JOIN badge_points bp ON bp.user_id = u.id
  ORDER BY performance_score DESC;
$$;


CREATE OR REPLACE FUNCTION "public"."get_user_attributes_as_of"("p_cutoff" timestamp with time zone) RETURNS TABLE("user_id" "uuid", "user_role_id" "uuid", "user_name" character varying, "user_email" character varying, "user_date_added" timestamp with time zone, "employee_id" "text", "employment_status" "public"."user_employment_status_enum", "contact_details" "text", "home_address" "text", "tin_id" "text", "sss_id" "text", "pagibig_id" "text", "role_id" "uuid", "role_type" "text", "xp" integer, "user_level" integer, "points" integer, "deducted_points" integer, "is_tenured" boolean, "total_xp" integer, "total_points_earned" bigint, "performance_score" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
SELECT u.id AS user_id,
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
      (
        COALESCE(
          (
            SELECT SUM(
              kc.points * LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
            )::bigint
            FROM "KPITask" kt
            JOIN "KPICategory" kc ON kt.category_id = kc.id
            WHERE kt.assigned_to = u.id
              AND kt.status = 'approved'
              AND kt.points_claimed_at IS NOT NULL
              AND kt.points_claimed_at <= p_cutoff
          ),
          0
        )
        *
        COALESCE(
          (
            SELECT SUM(
              LEAST(COALESCE(kt.completed_orders, 0), COALESCE(kt.max_orders, 0))
            )::bigint
            FROM "KPITask" kt
            WHERE kt.assigned_to = u.id
              AND kt.status = 'approved'
              AND kt.points_claimed_at IS NOT NULL
              AND kt.points_claimed_at <= p_cutoff
          ),
          0
        )
      )
      +
      COALESCE(
        (
          SELECT SUM(b.points)::bigint
          FROM "UserBadges" ub
          JOIN "Badges" b ON ub.badge_id = b.id
          WHERE ub.awarded_to = u.id
        ),
        0
      )
    )::bigint AS performance_score
   FROM "User" u
     LEFT JOIN "Role" r ON r.id = u.role_id
  GROUP BY u.id, u.role_id, u.name, u.email, u.date_added, u.employee_id, u.employment_status, u.contact_details, u.home_address, u.tin_id, u.sss_id, u.pagibig_id, r.id, r.type, u.xp, u.level, u.points, u.deducted_points, u.is_tenured, u.total_xp, u.total_points_earned;
$$;
