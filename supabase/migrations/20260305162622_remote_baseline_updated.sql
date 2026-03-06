


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgmq";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."attendance_attribute_type" AS ENUM (
    'absences',
    'lates',
    'overtimes',
    'undertimes'
);


ALTER TYPE "public"."attendance_attribute_type" OWNER TO "postgres";


CREATE TYPE "public"."badge_requirement_type" AS ENUM (
    'manual',
    'attribute',
    'task',
    'attendance'
);


ALTER TYPE "public"."badge_requirement_type" OWNER TO "postgres";


CREATE TYPE "public"."kpitask_status_enum" AS ENUM (
    'assigned',
    'in review',
    'approved',
    'rejected'
);


ALTER TYPE "public"."kpitask_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."logic_type_enum" AS ENUM (
    'or',
    'and'
);


ALTER TYPE "public"."logic_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'badge',
    'user',
    'task',
    'reward'
);


ALTER TYPE "public"."notification_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."operator_enum" AS ENUM (
    '>',
    '<',
    '>=',
    '<=',
    '=',
    '!='
);


ALTER TYPE "public"."operator_enum" OWNER TO "postgres";


CREATE TYPE "public"."period_intervals_enum" AS ENUM (
    'weekly',
    'quarterly',
    'monthly',
    'anually',
    'none',
    'daily'
);


ALTER TYPE "public"."period_intervals_enum" OWNER TO "postgres";


CREATE TYPE "public"."rank_interval_enum" AS ENUM (
    'WEEK',
    'MONTH',
    'YEAR'
);


ALTER TYPE "public"."rank_interval_enum" OWNER TO "postgres";


CREATE TYPE "public"."requirement_type_enum" AS ENUM (
    'manual',
    'attribute',
    'task',
    'attendance'
);


ALTER TYPE "public"."requirement_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_employment_status_enum" AS ENUM (
    'probational',
    'regular'
);


ALTER TYPE "public"."user_employment_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_settings_on_auth_user_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert a corresponding row into public."User" when a new auth user is created.
  -- Use ON CONFLICT DO NOTHING to avoid duplicates if a user row already exists.
  INSERT INTO public."User" (id, email, name, date_added, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.user_metadata->>'name', NEW.email), now(), now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_settings_on_auth_user_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  claims jsonb := COALESCE(event->'claims', '{}'::jsonb);
  session_user_id uuid;
  db_user_id uuid;
  user_role text;
BEGIN
  -- extract user id safely (if absent, bail out)
  IF (event ? 'user_id') = FALSE THEN
    RETURN event;
  END IF;

  BEGIN
    session_user_id := (event->>'user_id')::uuid;
  EXCEPTION WHEN others THEN
    -- invalid uuid or cast error: do nothing
    RETURN event;
  END;

  -- Attempt to fetch the user and role from your tables.
  -- Adjust table names/columns below to match your schema.
  SELECT u.id, r.type
  INTO db_user_id, user_role
  FROM public."User" u
  JOIN public."Role" r ON u.role_id = r.id
  WHERE u.id = session_user_id
  LIMIT 1;

  -- If no row found, return original event unchanged
  IF db_user_id IS NULL THEN
    RETURN event;
  END IF;

  -- Ensure app_metadata exists on claims
  IF (claims ? 'app_metadata') = FALSE THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  -- Set the user_role inside app_metadata
  claims := jsonb_set(claims, '{app_metadata,user_role}', to_jsonb(user_role), true);

  -- Put updated claims back into event
  event := jsonb_set(event, '{claims}', claims, true);

  RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user_on_public_user_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Only attempt delete if auth.users row exists
  -- This performs a safe delete; if no row exists, nothing happens.
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user_on_public_user_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_public_user_on_auth_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Try to delete matching public."User"; if not present, no-op
  DELETE FROM public."User" WHERE id = OLD.id;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."delete_public_user_on_auth_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."evaluate_badges"("p_interval" "public"."period_intervals_enum") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  badge_rec RECORD;
  user_rec RECORD;
  req_rec RECORD;
  all_and_met boolean;
  any_or_met boolean;
  has_or_conditions boolean;
  has_and_conditions boolean;
  condition_met boolean;
  task_completed_orders integer;
  attendance_count integer;
  attr_value numeric;
BEGIN
  FOR badge_rec IN
    SELECT *
    FROM public."Badges"
    WHERE award_at_interval = p_interval
      AND award_at_interval <> 'none'::public.period_intervals_enum
  LOOP
    -- Skip badges with no requirements
    IF NOT EXISTS (
      SELECT 1
      FROM public."BadgeRequirements" br
      WHERE br.badge_id = badge_rec.id
    ) THEN
      CONTINUE;
    END IF;

    FOR user_rec IN SELECT id FROM public."User" LOOP
      all_and_met := true;
      any_or_met := false;
      has_or_conditions := false;
      has_and_conditions := false;

      -- Check for presence of OR and AND conditions
      SELECT EXISTS(
        SELECT 1 FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id AND logic_type = 'or'
      ) INTO has_or_conditions;

      SELECT EXISTS(
        SELECT 1 FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id AND logic_type = 'and'
      ) INTO has_and_conditions;

      FOR req_rec IN
        SELECT *
        FROM public."BadgeRequirements"
        WHERE badge_id = badge_rec.id
      LOOP
        condition_met := false;

        IF req_rec.requirement_type = 'task' THEN
          -- Use completed_orders instead of COUNT(*)
          SELECT COALESCE(SUM(tiv.completed_orders), 0)
          INTO task_completed_orders
          FROM public.task_info_view tiv
          WHERE tiv.assigned_to = user_rec.id
            AND tiv.category_id = req_rec.requirement_attrb_id::uuid
            AND tiv.status = 'approved';

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN task_completed_orders = req_rec.requirement_attrb_value
            WHEN '>' THEN task_completed_orders > req_rec.requirement_attrb_value
            WHEN '<' THEN task_completed_orders < req_rec.requirement_attrb_value
            WHEN '>=' THEN task_completed_orders >= req_rec.requirement_attrb_value
            WHEN '<=' THEN task_completed_orders <= req_rec.requirement_attrb_value
            WHEN '!=' THEN task_completed_orders <> req_rec.requirement_attrb_value
            ELSE false
          END;

        ELSIF req_rec.requirement_type = 'attendance' THEN
          SELECT COUNT(*)
          INTO attendance_count
          FROM public.attendance_log_view alv
          WHERE alv.employee_id = user_rec.id
            AND CASE req_rec.requirement_attrb_id
              WHEN 'is_overtime' THEN COALESCE(alv.is_overtime, false)
              WHEN 'is_absent' THEN COALESCE(alv.is_absent, false)
              WHEN 'is_undertime' THEN COALESCE(alv.is_undertime, false)
              WHEN 'over_breaktime' THEN COALESCE(alv.over_breaktime, false)
              ELSE false
            END;

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN attendance_count = req_rec.requirement_attrb_value
            WHEN '>' THEN attendance_count > req_rec.requirement_attrb_value
            WHEN '<' THEN attendance_count < req_rec.requirement_attrb_value
            WHEN '>=' THEN attendance_count >= req_rec.requirement_attrb_value
            WHEN '<=' THEN attendance_count <= req_rec.requirement_attrb_value
            WHEN '!=' THEN attendance_count <> req_rec.requirement_attrb_value
            ELSE false
          END;

        ELSIF req_rec.requirement_type = 'attribute' THEN
          SELECT CASE req_rec.requirement_attrb_id
            WHEN 'user_level' THEN ua.user_level
            WHEN 'total_xp' THEN ua.total_xp
            WHEN 'total_points_earned' THEN ua.total_points_earned
            ELSE NULL
          END
          INTO attr_value
          FROM public.user_attributes ua
          WHERE ua.user_id = user_rec.id;

          condition_met := CASE req_rec.requirement_operator
            WHEN '=' THEN attr_value = req_rec.requirement_attrb_value
            WHEN '>' THEN attr_value > req_rec.requirement_attrb_value
            WHEN '<' THEN attr_value < req_rec.requirement_attrb_value
            WHEN '>=' THEN attr_value >= req_rec.requirement_attrb_value
            WHEN '<=' THEN attr_value <= req_rec.requirement_attrb_value
            WHEN '!=' THEN attr_value <> req_rec.requirement_attrb_value
            ELSE false
          END;
        END IF;

        -- Apply logic type
        IF req_rec.logic_type = 'and' THEN
          IF NOT condition_met THEN
            all_and_met := false;
          END IF;
        ELSIF req_rec.logic_type = 'or' THEN
          IF condition_met THEN
            any_or_met := true;
          END IF;
        END IF;
      END LOOP;

      -- Award badge based on logic:
      -- 1. If only AND conditions: all must be met
      -- 2. If only OR conditions: at least one must be met
      -- 3. If both: all AND must be met + at least one OR must be met
      IF (NOT has_and_conditions OR all_and_met) AND
         (NOT has_or_conditions OR any_or_met) THEN
        -- Insert the badge award (on conflict do nothing to avoid duplicates)
        INSERT INTO public."UserBadges"(badge_id, awarded_to, date_acquired)
        VALUES (badge_rec.id, user_rec.id, now())
        ON CONFLICT (badge_id, awarded_to) DO NOTHING;
        
        -- Award points to the user for earning this badge
        UPDATE public."User"
        SET points = points + badge_rec.points
        WHERE id = user_rec.id
          AND badge_rec.points > 0;

        -- Insert notification for automatic badge award
        INSERT INTO public."Notification"(user_id, type, message, metadata)
        VALUES (
          user_rec.id,
          'badge',
          'You''ve been automatically awarded the ' || badge_rec.name || ' badge by the system and have earned ' || badge_rec.points || ' bonus points.',
          jsonb_build_object(
            'badgeId', badge_rec.id::text,
            'badgeName', badge_rec.name,
            'pointsAwarded', badge_rec.points,
            'isAutomatic', true,
            'evaluatedAt', now()::text
          )
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."evaluate_badges"("p_interval" "public"."period_intervals_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) RETURNS TABLE("employee_rank" bigint, "total_employees" bigint, "performance_score" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH user_kpis AS (
    -- Count approved tasks and sum their points as of cutoff for all regular employees
    -- Matches get_leaderboard_as_of logic
    SELECT
      kt.assigned_to AS user_id,
      COUNT(*)::bigint AS task_count,
      COALESCE(SUM(kc.points), 0)::bigint AS points_sum
    FROM "KPITask" kt
    JOIN "KPICategory" kc ON kt.category_id = kc.id
    WHERE kt.status = 'approved'
      AND kt.points_claimed_at IS NOT NULL
      AND kt.points_claimed_at <= p_cutoff
    GROUP BY kt.assigned_to
  ),
  user_performance AS (
    -- Calculate performance_score: task_count × points_sum
    -- Matches leaderboard calculation exactly
    SELECT
      u.id AS user_id,
      COALESCE(uk.task_count, 0) AS task_count,
      COALESCE(uk.points_sum, 0) AS points_sum,
      (COALESCE(uk.task_count, 0) * COALESCE(uk.points_sum, 0))::bigint AS perf_score
    FROM "User" u
    JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
    LEFT JOIN user_kpis uk ON uk.user_id = u.id
  ),
  ranked_employees AS (
    -- Rank all regular employees by their calculated performance_score
    SELECT
      up.user_id,
      RANK() OVER (ORDER BY up.perf_score DESC) AS user_rank,
      up.perf_score AS performance_score
    FROM user_performance up
  ),
  total_count AS (
    -- Count total regular employees
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


ALTER FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) OWNER TO "postgres";


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
    ((COALESCE(uk.total_kpi_points,0) + COALESCE(bp.badge_points,0)) * uk.task_count)::bigint AS performance_score,
    COALESCE(uk.total_kpi_points,0)::bigint AS total_kpi_points,
    COALESCE(bp.badge_points,0)::bigint AS badge_points
  FROM "User" u
  JOIN "Role" r ON r.id = u.role_id AND r.type = 'regular'
  JOIN user_kpis uk ON uk.user_id = u.id
  LEFT JOIN badge_points bp ON bp.user_id = u.id
  ORDER BY performance_score DESC;
$$;


ALTER FUNCTION "public"."get_leaderboard_as_of"("p_cutoff" timestamp with time zone) OWNER TO "postgres";


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
      (SELECT COUNT(*)::bigint 
       FROM "KPITask" kt
       WHERE kt.assigned_to = u.id 
         AND kt.status = 'approved'
         AND kt.points_claimed_at IS NOT NULL 
         AND kt.points_claimed_at <= p_cutoff)
      *
      (SELECT COALESCE(SUM(kc.points), 0)::bigint 
       FROM "KPITask" kt
       JOIN "KPICategory" kc ON kt.category_id = kc.id
       WHERE kt.assigned_to = u.id 
         AND kt.status = 'approved'
         AND kt.points_claimed_at IS NOT NULL 
         AND kt.points_claimed_at <= p_cutoff)
    )::bigint AS performance_score
   FROM "User" u
     LEFT JOIN "Role" r ON r.id = u.role_id
  GROUP BY u.id, u.role_id, u.name, u.email, u.date_added, u.employee_id, u.employment_status, u.contact_details, u.home_address, u.tin_id, u.sss_id, u.pagibig_id, r.id, r.type, u.xp, u.level, u.points, u.deducted_points, u.is_tenured, u.total_xp, u.total_points_earned;
$$;


ALTER FUNCTION "public"."get_user_attributes_as_of"("p_cutoff" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_default_view"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT default_view FROM public.user_settings WHERE user_id = (SELECT auth.uid());
$$;


ALTER FUNCTION "public"."get_user_default_view"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert only columns that exist in public."User"; ignore conflict on id
  INSERT INTO public."User"(
    id, email, name, date_added, employee_id, employment_status, contact_details, home_address, tin_id, sss_id, pagibig_id, role_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata->> 'name', NEW.email),
    COALESCE( (NEW.user_metadata->> 'date_added')::timestamptz, now()),
    NEW.user_metadata->> 'employee_id',
    COALESCE(NEW.user_metadata->> 'employment_status', ''),
    NEW.user_metadata->> 'contact_details',
    NEW.user_metadata->> 'home_address',
    NEW.user_metadata->> 'tin_id',
    NEW.user_metadata->> 'sss_id',
    NEW.user_metadata->> 'pagibig_id',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_points_for_user"("target_user_id" "uuid", "amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public."User"
  SET
    points = COALESCE(points, 0) + amount,
    total_points_earned = COALESCE(total_points_earned, 0) + amount
  WHERE id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."increment_points_for_user"("target_user_id" "uuid", "amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_hr_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public."User" 
    WHERE id = auth.uid() 
    AND role_id = 'ee9c3df2-8d1e-435e-861c-49680e483058'::uuid
  );
$$;


ALTER FUNCTION "public"."is_hr_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_hr_user_by_type"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."User" u
    JOIN public."Role" r ON r.id = u.role_id
    WHERE u.id = auth.uid()
    AND r.type = 'hr'
  );
$$;


ALTER FUNCTION "public"."is_hr_user_by_type"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") RETURNS TABLE("updated_user_id" "uuid", "updated_user_name" "text", "assigned_role_id" "uuid", "assigned_role_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be null';
  END IF;
  IF p_new_role_type IS NULL THEN
    RAISE EXCEPTION 'p_new_role_type cannot be null';
  END IF;

  -- Find an existing role with the requested type
  SELECT id INTO v_role_id
  FROM public."Role"
  WHERE type = p_new_role_type
  ORDER BY id
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'role with type "%" not found', p_new_role_type;
  END IF;

  -- Update the user's role_id
  UPDATE public."User" u
  SET role_id = v_role_id
  WHERE u.id = p_user_id
  RETURNING u.id, u.name INTO updated_user_id, updated_user_name;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user with id "%" not found', p_user_id;
  END IF;

  -- Return assigned role details
  SELECT id, type INTO assigned_role_id, assigned_role_type
  FROM public."Role"
  WHERE id = v_role_id
  LIMIT 1;

  RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") RETURNS TABLE("updated_user_id" "uuid", "updated_user_name" "text", "updated_role_id" "uuid", "updated_role_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be null';
  END IF;

  WITH updated_user AS (
    UPDATE public."User" u
    SET name = p_new_name
    WHERE u.id = p_user_id
    RETURNING u.id, u.name, u.role_id
  ),
  updated_role AS (
    UPDATE public."Role" r
    SET type = p_new_role_type
    FROM updated_user uu
    WHERE r.id = uu.role_id
    RETURNING r.id, r.type
  )
  SELECT
    uu.id,
    uu.name,
    ur.id,
    ur.type
  INTO updated_user_id, updated_user_name, updated_role_id, updated_role_type
  FROM updated_user uu
  LEFT JOIN updated_role ur ON ur.id = uu.role_id
  LIMIT 1;

  RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") RETURNS TABLE("updated_user_id" "uuid", "updated_user_name" "text", "assigned_role_id" "uuid", "assigned_role_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be null';
  END IF;

  -- Determine role_id only if a non-empty role_type was provided
  IF p_new_role_type IS NOT NULL AND btrim(p_new_role_type) <> '' THEN
    SELECT id INTO v_role_id
    FROM public."Role"
    WHERE type = p_new_role_type
    ORDER BY id
    LIMIT 1;

    IF v_role_id IS NULL THEN
      RAISE EXCEPTION 'role with type "%" not found', p_new_role_type;
    END IF;
  ELSE
    v_role_id := NULL; -- means do not change role
  END IF;

  -- Perform atomic update: only set columns when new non-empty values were provided.
  UPDATE public."User" u
  SET
    name  = CASE WHEN p_new_name IS NOT NULL AND btrim(p_new_name) <> '' THEN p_new_name ELSE u.name END,
    role_id = CASE WHEN v_role_id IS NOT NULL THEN v_role_id ELSE u.role_id END
  WHERE u.id = p_user_id
  RETURNING u.id, u.name INTO updated_user_id, updated_user_name;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user with id "%" not found', p_user_id;
  END IF;

  -- Return assigned role details (the effective role after update)
  SELECT r.id, r.type INTO assigned_role_id, assigned_role_type
  FROM public."Role" r
  WHERE r.id = (SELECT role_id FROM public."User" WHERE id = p_user_id)
  LIMIT 1;

  RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_role_type" "text", "p_employment_status" "text", "p_contact_details" "text", "p_home_address" "text", "p_tin_id" "text", "p_sss_id" "text", "p_pagibig_id" "text") RETURNS TABLE("user_id" "uuid", "name" "text", "role_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_role_id uuid;
  v_employment_status public.user_employment_status_enum;
BEGIN
  -- lookup role case-insensitively
  IF p_role_type IS NOT NULL AND p_role_type <> '' THEN
    SELECT id INTO v_role_id FROM public."Role" WHERE lower(type) = lower(p_role_type) LIMIT 1;
    IF v_role_id IS NULL THEN
      RAISE EXCEPTION 'Role type "%s" not found in public."Role"', p_role_type;
    END IF;
  END IF;

  -- update user name if provided
  IF p_new_name IS NOT NULL AND p_new_name <> '' THEN
    UPDATE public."User"
    SET name = p_new_name
    WHERE id = p_user_id;
  END IF;

  -- assign role if provided
  IF v_role_id IS NOT NULL THEN
    BEGIN
      UPDATE public."User"
      SET role_id = v_role_id
      WHERE id = p_user_id;
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
  END IF;

  -- prepare enum value if provided
  IF p_employment_status IS NOT NULL AND p_employment_status <> '' THEN
    BEGIN
      v_employment_status := p_employment_status::public.user_employment_status_enum;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Invalid employment_status value: "%s"', p_employment_status;
    END;
  ELSE
    v_employment_status := NULL;
  END IF;

  -- update other profile fields only when non-empty, with proper casting
  UPDATE public."User"
  SET
    employment_status = COALESCE(v_employment_status, employment_status),
    contact_details = CASE WHEN p_contact_details IS NOT NULL AND p_contact_details <> '' THEN p_contact_details ELSE contact_details END,
    home_address = CASE WHEN p_home_address IS NOT NULL AND p_home_address <> '' THEN p_home_address ELSE home_address END,
    tin_id = CASE WHEN p_tin_id IS NOT NULL AND p_tin_id <> '' THEN p_tin_id ELSE tin_id END,
    sss_id = CASE WHEN p_sss_id IS NOT NULL AND p_sss_id <> '' THEN p_sss_id ELSE sss_id END,
    pagibig_id = CASE WHEN p_pagibig_id IS NOT NULL AND p_pagibig_id <> '' THEN p_pagibig_id ELSE pagibig_id END
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT u.id::uuid, u.name::text, u.role_id::uuid
  FROM public."User" u
  WHERE u.id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_role_type" "text", "p_employment_status" "text", "p_contact_details" "text", "p_home_address" "text", "p_tin_id" "text", "p_sss_id" "text", "p_pagibig_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role_id" "uuid",
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "date_added" timestamp with time zone DEFAULT "now"(),
    "employee_id" "text",
    "employment_status" "public"."user_employment_status_enum",
    "contact_details" "text",
    "home_address" "text",
    "tin_id" "text",
    "sss_id" "text",
    "pagibig_id" "text",
    "points" integer DEFAULT 0,
    "xp" integer,
    "level" integer DEFAULT 0,
    "is_tenured" boolean,
    "total_xp" integer,
    "deducted_points" integer DEFAULT 0,
    "total_points_earned" bigint DEFAULT 0 NOT NULL,
    CONSTRAINT "User_level_check" CHECK (("level" >= 0)),
    CONSTRAINT "User_xp_check" CHECK (("xp" >= 0)),
    CONSTRAINT "chk_user_xp_nonnegative" CHECK ((("xp" IS NULL) OR ("xp" >= 0)))
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" character varying, "p_role_id" "uuid" DEFAULT NULL::"uuid", "p_role_type" character varying DEFAULT NULL::character varying, "p_employment_status" character varying DEFAULT NULL::character varying, "p_contact_number" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text", "p_tin" "text" DEFAULT NULL::"text", "p_sss" "text" DEFAULT NULL::"text", "p_pagibig" "text" DEFAULT NULL::"text") RETURNS "public"."User"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_role_id uuid;
  v_result public."User"%ROWTYPE;
  v_employment_enum public.user_employment_status_enum; -- adjust schema-qualified enum type
BEGIN
  -- Determine role id: prefer explicit p_role_id, otherwise look up by type
  IF p_role_id IS NOT NULL THEN
    v_role_id := p_role_id;
  ELSIF p_role_type IS NOT NULL THEN
    SELECT id
    INTO v_role_id
    FROM public."Role"
    WHERE type = p_role_type
    LIMIT 1;

    IF v_role_id IS NULL THEN
      RAISE EXCEPTION 'role with type "%" not found', p_role_type;
    END IF;
  ELSE
    v_role_id := NULL;
  END IF;

  -- Validate and cast employment status if provided
  IF p_employment_status IS NOT NULL AND length(p_employment_status) > 0 THEN
    BEGIN
      v_employment_enum := p_employment_status::public.user_employment_status_enum;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'invalid employment status value: %', p_employment_status;
    END;
  ELSE
    v_employment_enum := NULL;
  END IF;

  -- Update user row: only set columns when a non-empty value is provided.
  UPDATE public."User"
  SET
    name = COALESCE(NULLIF(p_new_name, ''), name),
    role_id = v_role_id,
    employment_status = COALESCE(v_employment_enum, employment_status),
    contact_details = COALESCE(NULLIF(p_contact_number, ''), contact_details),
    home_address = COALESCE(NULLIF(p_address, ''), home_address),
    tin_id = COALESCE(NULLIF(p_tin, ''), tin_id),
    sss_id = COALESCE(NULLIF(p_sss, ''), sss_id),
    pagibig_id = COALESCE(NULLIF(p_pagibig, ''), pagibig_id)
  WHERE id = p_user_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user with id % not found', p_user_id;
  END IF;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" character varying, "p_role_id" "uuid", "p_role_type" character varying, "p_employment_status" character varying, "p_contact_number" "text", "p_address" "text", "p_tin" "text", "p_sss" "text", "p_pagibig" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_task_employee_view"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_view text;
  new_view text;
  uid uuid := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT default_view INTO current_view FROM user_settings WHERE user_id = uid;

  IF current_view IS NULL THEN
    -- insert default row if missing
    INSERT INTO user_settings (user_id, default_view, updated_at)
    VALUES (uid, 'employee', now())
    ON CONFLICT (user_id) DO UPDATE SET default_view = EXCLUDED.default_view, updated_at = now();
    new_view := 'employee';
  ELSE
    IF current_view = 'task' THEN
      new_view := 'employee';
    ELSE
      new_view := 'task';
    END IF;

    UPDATE user_settings SET default_view = new_view, updated_at = now() WHERE user_id = uid;
  END IF;

  RETURN new_view;
END;
$$;


ALTER FUNCTION "public"."toggle_task_employee_view"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_award_xp_and_level"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  role_type text;
  total_xp integer;
  level_increase integer;
BEGIN
  -- Determine role type
  SELECT r.type INTO role_type FROM public."Role" r WHERE r.id = NEW.role_id;
  IF role_type IS NULL OR role_type <> 'regular' THEN
    -- Ensure non-regular users have NULLs
    NEW.xp := NULL;
    NEW.level := NULL;
    RETURN NEW;
  END IF;

  -- For regular users, initialize xp/level if NULL on INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.xp IS NULL THEN
      NEW.xp := 0;
    END IF;
    IF NEW.level IS NULL THEN
      NEW.level := 1;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If xp didn't change, do nothing
    IF (NEW.xp IS NOT DISTINCT FROM OLD.xp) THEN
      RETURN NEW;
    END IF;
  END IF;

  IF NEW.xp < 0 THEN
    RAISE EXCEPTION 'xp cannot be negative';
  END IF;

  total_xp := NEW.xp;
  IF total_xp >= 100 THEN
    level_increase := total_xp / 100;
    NEW.level := COALESCE(NEW.level, 1) + level_increase;
    NEW.xp := total_xp % 100;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."user_award_xp_and_level"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_points_enforce"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  r_type text;
BEGIN
  -- Fetch role type; assume role exists but fail loudly if not.
  SELECT type INTO r_type FROM public."Role" WHERE id = NEW.role_id;

  IF r_type IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'Invalid role_id for user', ERRCODE = 'P0001';
  END IF;

  IF lower(r_type) = 'regular' THEN
    -- For regular roles, ensure points default to 0 if not provided.
    NEW.points := COALESCE(NEW.points, 0);
  ELSE
    -- For non-regular roles, disallow non-NULL points.
    IF NEW.points IS NOT NULL THEN
      RAISE EXCEPTION USING MESSAGE = format('Users with role "%" cannot have points.', r_type), ERRCODE = 'P0001';
    END IF;
    NEW.points := NULL;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."user_points_enforce"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_total_xp_maintain"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  role_type text;
BEGIN
  -- fetch role type if role_id provided
  IF NEW.role_id IS NOT NULL THEN
    SELECT "type" INTO role_type FROM public."Role" WHERE id = NEW.role_id;
  ELSE
    role_type := NULL;
  END IF;

  IF role_type = 'regular' THEN
    -- ensure level and xp are treated as integers; allow NULLs
    NEW.total_xp := (COALESCE(NEW.level, 0) * 100) + COALESCE(NEW.xp, 0);
  ELSE
    NEW.total_xp := NULL;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."user_total_xp_maintain"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."AttendanceLog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timein_time" timestamp with time zone NOT NULL,
    "is_ontime" boolean DEFAULT true,
    "employee_id" "uuid" NOT NULL,
    "timeout_time" timestamp with time zone NOT NULL,
    "is_overtime" boolean DEFAULT false,
    "is_absent" boolean DEFAULT false,
    "no_timeout" boolean DEFAULT false,
    "is_undertime" boolean DEFAULT false,
    "breaktime_start" timestamp with time zone,
    "breaktime_end" timestamp with time zone,
    "over_breaktime" boolean DEFAULT false
);


ALTER TABLE "public"."AttendanceLog" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."BadgeRequirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "requirement_type" "public"."badge_requirement_type",
    "requirement_operator" "public"."operator_enum" DEFAULT '='::"public"."operator_enum",
    "requirement_interval" "public"."period_intervals_enum" DEFAULT 'none'::"public"."period_intervals_enum",
    "requirement_attrb_id" "text",
    "requirement_attrb_value" integer DEFAULT 0,
    "logic_type" "public"."logic_type_enum" DEFAULT 'and'::"public"."logic_type_enum"
);


ALTER TABLE "public"."BadgeRequirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "points" integer DEFAULT 0 NOT NULL,
    "date_created" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "img_link" "text",
    "award_at_interval" "public"."period_intervals_enum" DEFAULT 'none'::"public"."period_intervals_enum"
);


ALTER TABLE "public"."Badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Dishes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "rng" double precision
);


ALTER TABLE "public"."Dishes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."KPICategory" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "points" integer NOT NULL,
    "is_repeatable" boolean DEFAULT true,
    "type" "text",
    "xp" bigint DEFAULT '1'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."KPICategory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."KPITask" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assigned_by" "uuid",
    "assigned_to" "uuid",
    "category_id" "uuid",
    "status" "public"."kpitask_status_enum" DEFAULT 'assigned'::"public"."kpitask_status_enum",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "pending_orders" integer DEFAULT 0,
    "deadline_date" timestamp with time zone,
    "remark" "text",
    "max_orders" integer DEFAULT 1,
    "completed_orders" integer DEFAULT 0,
    "points_claimed_at" timestamp with time zone,
    CONSTRAINT "KPITask_completed_orders_check" CHECK (("completed_orders" >= 0)),
    CONSTRAINT "KPITask_max_attempts_check" CHECK (("max_orders" > 0))
);


ALTER TABLE "public"."KPITask" OWNER TO "postgres";


COMMENT ON COLUMN "public"."KPITask"."pending_orders" IS 'the orders that the employee is currently requesting for verification';



COMMENT ON COLUMN "public"."KPITask"."max_orders" IS 'the maximum number of orders an employee can complete in a specified period of time (configured by the manager)';



COMMENT ON COLUMN "public"."KPITask"."completed_orders" IS 'the orders (an entry in an assigned task) of an employee that has been completed AND verified';



COMMENT ON COLUMN "public"."KPITask"."points_claimed_at" IS 'When the assigned employee claimed points and XP for this task; NULL if not yet claimed.';



CREATE TABLE IF NOT EXISTS "public"."Level" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "level" integer NOT NULL,
    "perk" "text"
);


ALTER TABLE "public"."Level" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Notification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type_enum" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."Notification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RankingEntry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ranking_period_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rank" smallint NOT NULL,
    "performance_score" bigint NOT NULL,
    "total_kpi_points" bigint DEFAULT 0 NOT NULL,
    "badge_points" bigint DEFAULT 0 NOT NULL,
    "completed_task_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."RankingEntry" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RankingPeriod" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "period_type" "text" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "is_visible" boolean DEFAULT true NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."RankingPeriod" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Reward" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "points_cost" bigint NOT NULL,
    "quantity" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "redeeming_limit" integer,
    "availability_interval" "text",
    "availability_anchor_date" "date",
    CONSTRAINT "reward_availability_interval_check" CHECK ((("availability_interval" IS NULL) OR ("lower"("availability_interval") = ANY (ARRAY['weekly'::"text", 'monthly'::"text", 'yearly'::"text"]))))
);


ALTER TABLE "public"."Reward" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Reward"."redeeming_limit" IS 'Maximum number of times an employee can redeem this reward. NULL means no limit.';



COMMENT ON COLUMN "public"."Reward"."availability_interval" IS 'Availability interval for rewards: weekly, monthly, yearly, or null for always available.';



COMMENT ON COLUMN "public"."Reward"."availability_anchor_date" IS 'Anchor date used to evaluate weekly/monthly/yearly interval visibility.';



CREATE TABLE IF NOT EXISTS "public"."RewardRequest" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "approved_by" "uuid",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "quantity" integer DEFAULT 1 NOT NULL,
    "remarks" "text"
);


ALTER TABLE "public"."RewardRequest" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Role" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."Role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RoleAttribute" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "value" boolean
);


ALTER TABLE "public"."RoleAttribute" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."SpecificRoleAttribute" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role_id" "uuid",
    "attribute_id" "uuid"
);


ALTER TABLE "public"."SpecificRoleAttribute" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."UserBadges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "awarded_to" "uuid" NOT NULL,
    "awarded_by" "uuid",
    "date_acquired" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."UserBadges" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."attendance_log_view" AS
 SELECT "a"."id",
    "a"."timein_time",
    "a"."is_ontime",
    "a"."employee_id",
    "a"."timeout_time",
    "a"."is_overtime",
    "a"."is_absent",
    "a"."no_timeout",
    "a"."is_undertime",
    "a"."breaktime_start",
    "a"."breaktime_end",
    "a"."over_breaktime",
    "u"."name" AS "user_name",
    "u"."email" AS "user_email",
    "u"."employee_id" AS "user_employee_id",
    "r"."type" AS "role_type",
    "r"."id" AS "role_id"
   FROM (("public"."AttendanceLog" "a"
     LEFT JOIN "public"."User" "u" ON (("u"."id" = "a"."employee_id")))
     LEFT JOIN "public"."Role" "r" ON (("r"."id" = "u"."role_id")));


ALTER VIEW "public"."attendance_log_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."badge_conditions_view" AS
 SELECT "id" AS "badge_id",
    "name" AS "badge_name",
    "description" AS "badge_description",
    "points" AS "badge_points",
    "img_link" AS "badge_img_link",
    "award_at_interval" AS "badge_award_at_interval",
    COALESCE(( SELECT "jsonb_agg"("jsonb_build_object"('id', "r"."id", 'requirement_type', ("r"."requirement_type")::"text", 'requirement_operator', ("r"."requirement_operator")::"text", 'requirement_interval', ("r"."requirement_interval")::"text", 'requirement_attrb_id', "r"."requirement_attrb_id", 'requirement_attrb_value', "r"."requirement_attrb_value", 'logic_type', ("r"."logic_type")::"text") ORDER BY "r"."id") AS "jsonb_agg"
           FROM "public"."BadgeRequirements" "r"
          WHERE ("r"."badge_id" = "b"."id")), '[]'::"jsonb") AS "conditions",
    COALESCE(( SELECT "jsonb_agg"("jsonb_build_object"('id', "ub"."id", 'awarded_to', "ub"."awarded_to", 'date_acquired', "ub"."date_acquired", 'badge_id', "ub"."badge_id", 'badge_name', "b"."name", 'badge_description', "b"."description", 'badge_points', "b"."points", 'badge_img_link', "b"."img_link") ORDER BY "ub"."date_acquired") AS "jsonb_agg"
           FROM "public"."UserBadges" "ub"
          WHERE ("ub"."badge_id" = "b"."id")), '[]'::"jsonb") AS "collected_badges",
    COALESCE(( SELECT "jsonb_agg"(("r"."logic_type")::"text" ORDER BY "r"."id") AS "jsonb_agg"
           FROM "public"."BadgeRequirements" "r"
          WHERE (("r"."badge_id" = "b"."id") AND ("r"."logic_type" IS NOT NULL))), '[]'::"jsonb") AS "requirements_logic_type"
   FROM "public"."Badges" "b";


ALTER VIEW "public"."badge_conditions_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employee_daily_attendance_stats_view" AS
 SELECT "employee_id",
    ("date_trunc"('day'::"text", "timein_time"))::"date" AS "day",
    "count"(*) FILTER (WHERE "is_absent") AS "absences",
    "count"(*) FILTER (WHERE "is_overtime") AS "overtimes",
    "count"(*) FILTER (WHERE ((COALESCE("is_ontime", true) = false) AND (COALESCE("is_absent", false) = false))) AS "lates",
    "count"(*) FILTER (WHERE "over_breaktime") AS "over_breaktimes",
    "count"(*) FILTER (WHERE "is_undertime") AS "undertimes"
   FROM "public"."AttendanceLog" "al"
  GROUP BY "employee_id", (("date_trunc"('day'::"text", "timein_time"))::"date");


ALTER VIEW "public"."employee_daily_attendance_stats_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employee_annual_attendance_stats_view" AS
 SELECT "u"."id" AS "employee_id",
    "u"."email",
    "u"."name",
    "d"."period_start",
    (("d"."period_start" + '1 year'::interval) - '00:00:01'::interval) AS "period_end",
    "sum"("d"."absences") AS "absences",
    "sum"("d"."overtimes") AS "overtimes",
    "sum"("d"."lates") AS "lates",
    "sum"("d"."over_breaktimes") AS "over_breaktimes",
    "sum"("d"."undertimes") AS "undertimes"
   FROM (( SELECT "employee_daily_attendance_stats_view"."employee_id",
            ("date_trunc"('year'::"text", ("employee_daily_attendance_stats_view"."day")::timestamp with time zone))::"date" AS "period_start",
            "employee_daily_attendance_stats_view"."absences",
            "employee_daily_attendance_stats_view"."overtimes",
            "employee_daily_attendance_stats_view"."lates",
            "employee_daily_attendance_stats_view"."over_breaktimes",
            "employee_daily_attendance_stats_view"."undertimes"
           FROM "public"."employee_daily_attendance_stats_view") "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."employee_id")))
  GROUP BY "u"."id", "u"."email", "u"."name", "d"."period_start";


ALTER VIEW "public"."employee_annual_attendance_stats_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employee_monthly_attendance_stats_view" AS
 SELECT "u"."id" AS "employee_id",
    "u"."email",
    "u"."name",
    "d"."period_start",
    (("d"."period_start" + '1 mon'::interval) - '00:00:01'::interval) AS "period_end",
    "sum"("d"."absences") AS "absences",
    "sum"("d"."overtimes") AS "overtimes",
    "sum"("d"."lates") AS "lates",
    "sum"("d"."over_breaktimes") AS "over_breaktimes",
    "sum"("d"."undertimes") AS "undertimes"
   FROM (( SELECT "employee_daily_attendance_stats_view"."employee_id",
            ("date_trunc"('month'::"text", ("employee_daily_attendance_stats_view"."day")::timestamp with time zone))::"date" AS "period_start",
            "employee_daily_attendance_stats_view"."absences",
            "employee_daily_attendance_stats_view"."overtimes",
            "employee_daily_attendance_stats_view"."lates",
            "employee_daily_attendance_stats_view"."over_breaktimes",
            "employee_daily_attendance_stats_view"."undertimes"
           FROM "public"."employee_daily_attendance_stats_view") "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."employee_id")))
  GROUP BY "u"."id", "u"."email", "u"."name", "d"."period_start";


ALTER VIEW "public"."employee_monthly_attendance_stats_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employee_weekly_attendance_stats_view" AS
 SELECT "u"."id" AS "employee_id",
    "u"."email",
    "u"."name",
    "d"."period_start",
    (("d"."period_start" + '7 days'::interval) - '00:00:01'::interval) AS "period_end",
    "sum"("d"."absences") AS "absences",
    "sum"("d"."overtimes") AS "overtimes",
    "sum"("d"."lates") AS "lates",
    "sum"("d"."over_breaktimes") AS "over_breaktimes",
    "sum"("d"."undertimes") AS "undertimes"
   FROM (( SELECT "employee_daily_attendance_stats_view"."employee_id",
            ("date_trunc"('week'::"text", ("employee_daily_attendance_stats_view"."day")::timestamp with time zone))::"date" AS "period_start",
            "employee_daily_attendance_stats_view"."absences",
            "employee_daily_attendance_stats_view"."overtimes",
            "employee_daily_attendance_stats_view"."lates",
            "employee_daily_attendance_stats_view"."over_breaktimes",
            "employee_daily_attendance_stats_view"."undertimes"
           FROM "public"."employee_daily_attendance_stats_view") "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."employee_id")))
  GROUP BY "u"."id", "u"."email", "u"."name", "d"."period_start";


ALTER VIEW "public"."employee_weekly_attendance_stats_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ranking_leaderboard_view" AS
 SELECT "rp"."id" AS "ranking_period_id",
    "re"."user_id",
    "u"."name" AS "user_name",
    "re"."id" AS "entry_id",
    "rp"."period_type",
    "rp"."period_start",
    "rp"."period_end",
    "rp"."is_visible",
    "rp"."generated_at",
        CASE "rp"."period_type"
            WHEN 'weekly'::"text" THEN ((('Week '::"text" || (EXTRACT(week FROM "rp"."period_start"))::"text") || ', '::"text") || (EXTRACT(isoyear FROM "rp"."period_start"))::"text")
            WHEN 'monthly'::"text" THEN "to_char"(("rp"."period_start")::timestamp with time zone, 'FMMonth YYYY'::"text")
            WHEN 'yearly'::"text" THEN ('Year '::"text" || (EXTRACT(year FROM "rp"."period_start"))::"text")
            ELSE NULL::"text"
        END AS "period_label",
    "re"."rank",
    "re"."performance_score",
    "re"."total_kpi_points",
    "re"."badge_points",
    "re"."completed_task_count"
   FROM (("public"."RankingEntry" "re"
     JOIN "public"."RankingPeriod" "rp" ON (("rp"."id" = "re"."ranking_period_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "re"."user_id")));


ALTER VIEW "public"."ranking_leaderboard_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."role_attributes" AS
 SELECT "r"."id" AS "role_id",
    "r"."type" AS "role_type",
    COALESCE("jsonb_agg"("a"."name" ORDER BY "a"."name") FILTER (WHERE ("a"."name" IS NOT NULL)), '[]'::"jsonb") AS "attributes"
   FROM (("public"."Role" "r"
     LEFT JOIN "public"."SpecificRoleAttribute" "s" ON (("s"."role_id" = "r"."id")))
     LEFT JOIN "public"."RoleAttribute" "a" ON (("a"."id" = "s"."attribute_id")))
  GROUP BY "r"."id", "r"."type";


ALTER VIEW "public"."role_attributes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."task_info_view" AS
 SELECT "k"."id" AS "kpitask_id",
    "k"."assigned_by",
    "k"."assigned_to",
    "k"."status",
    "k"."created_at" AS "kpitask_created_at",
    "k"."completed_at" AS "kpitask_completed_at",
    "k"."pending_orders",
    "k"."completed_orders",
    "k"."max_orders",
    "k"."points_claimed_at",
    "u_from"."role_id" AS "assigned_by_role_id",
    "u_from"."name" AS "assigned_by_name",
    "u_from"."employee_id" AS "assigned_by_employee_id",
    "Role_from"."type" AS "assigned_by_role_name",
    "u_to"."role_id" AS "assigned_to_role_id",
    "u_to"."name" AS "assigned_to_name",
    "u_to"."employee_id" AS "assigned_to_employee_id",
    "Role_to"."type" AS "assigned_to_role_name",
    "c"."id" AS "category_id",
    "c"."name" AS "category_name",
    "c"."description" AS "category_description",
    "c"."points" AS "category_points",
    "c"."xp" AS "category_xp",
    "k"."deadline_date" AS "k_deadline_date",
    "k"."remark"
   FROM ((((("public"."KPITask" "k"
     LEFT JOIN "public"."User" "u_from" ON (("u_from"."id" = "k"."assigned_by")))
     LEFT JOIN "public"."Role" "Role_from" ON (("Role_from"."id" = "u_from"."role_id")))
     LEFT JOIN "public"."User" "u_to" ON (("u_to"."id" = "k"."assigned_to")))
     LEFT JOIN "public"."Role" "Role_to" ON (("Role_to"."id" = "u_to"."role_id")))
     LEFT JOIN "public"."KPICategory" "c" ON (("c"."id" = "k"."category_id")));


ALTER VIEW "public"."task_info_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."total_attendance_stats_view" AS
 SELECT "u"."id" AS "employee_id",
    "u"."email",
    "u"."name",
    COALESCE("sum"("d"."absences"), (0)::numeric) AS "total_absences",
    COALESCE("sum"("d"."overtimes"), (0)::numeric) AS "total_overtimes",
    COALESCE("sum"("d"."lates"), (0)::numeric) AS "total_lates",
    COALESCE("sum"("d"."over_breaktimes"), (0)::numeric) AS "total_over_breaktimes",
    COALESCE("sum"("d"."undertimes"), (0)::numeric) AS "total_undertimes",
    "min"("d"."absences") AS "min_absences_per_day",
    "percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("d"."absences")::double precision)) AS "median_absences_per_day",
    "max"("d"."absences") AS "max_absences_per_day",
    "min"("d"."overtimes") AS "min_overtimes_per_day",
    "percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("d"."overtimes")::double precision)) AS "median_overtimes_per_day",
    "max"("d"."overtimes") AS "max_overtimes_per_day",
    "min"("d"."lates") AS "min_lates_per_day",
    "percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("d"."lates")::double precision)) AS "median_lates_per_day",
    "max"("d"."lates") AS "max_lates_per_day",
    "min"("d"."over_breaktimes") AS "min_over_breaktimes_per_day",
    "percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("d"."over_breaktimes")::double precision)) AS "median_over_breaktimes_per_day",
    "max"("d"."over_breaktimes") AS "max_over_breaktimes_per_day",
    "min"("d"."undertimes") AS "min_undertimes_per_day",
    "percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("d"."undertimes")::double precision)) AS "median_undertimes_per_day",
    "max"("d"."undertimes") AS "max_undertimes_per_day"
   FROM ("public"."User" "u"
     LEFT JOIN "public"."employee_daily_attendance_stats_view" "d" ON (("d"."employee_id" = "u"."id")))
  GROUP BY "u"."id", "u"."email", "u"."name";


ALTER VIEW "public"."total_attendance_stats_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_attributes" AS
 SELECT "u"."id" AS "user_id",
    "u"."role_id" AS "user_role_id",
    "u"."name" AS "user_name",
    "u"."email" AS "user_email",
    "u"."date_added" AS "user_date_added",
    "u"."employee_id",
    "u"."employment_status",
    "u"."contact_details",
    "u"."home_address",
    "u"."tin_id",
    "u"."sss_id",
    "u"."pagibig_id",
    "r"."id" AS "role_id",
    "r"."type" AS "role_type",
    "u"."xp",
    "u"."level" AS "user_level",
    "u"."points",
    "u"."deducted_points",
    "u"."is_tenured",
    "u"."total_xp",
    "u"."total_points_earned",
    (( SELECT "count"(*) AS "count"
           FROM "public"."KPITask" "kt"
          WHERE (("kt"."assigned_to" = "u"."id") AND ("kt"."status" = 'approved'::"public"."kpitask_status_enum") AND ("kt"."points_claimed_at" IS NOT NULL))) * COALESCE("u"."total_points_earned", (0)::bigint)) AS "performance_score"
   FROM ("public"."User" "u"
     LEFT JOIN "public"."Role" "r" ON (("r"."id" = "u"."role_id")))
  GROUP BY "u"."id", "u"."role_id", "u"."name", "u"."email", "u"."date_added", "u"."employee_id", "u"."employment_status", "u"."contact_details", "u"."home_address", "u"."tin_id", "u"."sss_id", "u"."pagibig_id", "r"."id", "r"."type", "u"."xp", "u"."level", "u"."points", "u"."deducted_points", "u"."is_tenured", "u"."total_xp", "u"."total_points_earned";


ALTER VIEW "public"."user_attributes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_collected_badges_view" AS
 SELECT "ub"."awarded_to" AS "awarded_to_id",
    "u_to"."name" AS "awarded_to_name",
    "jsonb_agg"("jsonb_build_object"('userbadge_id', "ub"."id", 'badge_id', "b"."id", 'badge_name', "b"."name", 'badge_description', "b"."description", 'badge_points', "b"."points", 'badge_img_link', "b"."img_link", 'awarded_by_id', "ub"."awarded_by", 'awarded_by_name', "u_by"."name", 'date_acquired', "ub"."date_acquired") ORDER BY "ub"."date_acquired") FILTER (WHERE ("ub"."id" IS NOT NULL)) AS "collected_badges",
    "min"("ub"."date_acquired") AS "first_acquired_at",
    "max"("ub"."date_acquired") AS "last_acquired_at",
    "count"(*) AS "total_badges"
   FROM ((("public"."UserBadges" "ub"
     LEFT JOIN "public"."Badges" "b" ON (("ub"."badge_id" = "b"."id")))
     LEFT JOIN "public"."User" "u_to" ON (("ub"."awarded_to" = "u_to"."id")))
     LEFT JOIN "public"."User" "u_by" ON (("ub"."awarded_by" = "u_by"."id")))
  GROUP BY "ub"."awarded_to", "u_to"."name"
  ORDER BY "u_to"."name";


ALTER VIEW "public"."user_collected_badges_view" OWNER TO "postgres";


ALTER TABLE ONLY "public"."AttendanceLog"
    ADD CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."BadgeRequirements"
    ADD CONSTRAINT "BadgeRequirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Badges"
    ADD CONSTRAINT "Badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Dishes"
    ADD CONSTRAINT "Dishes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."KPICategory"
    ADD CONSTRAINT "KPICategory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Level"
    ADD CONSTRAINT "Level_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RankingEntry"
    ADD CONSTRAINT "RankingEntry_period_rank_unique" UNIQUE ("ranking_period_id", "rank");



ALTER TABLE ONLY "public"."RankingEntry"
    ADD CONSTRAINT "RankingEntry_period_user_unique" UNIQUE ("ranking_period_id", "user_id");



ALTER TABLE ONLY "public"."RankingEntry"
    ADD CONSTRAINT "RankingEntry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RankingPeriod"
    ADD CONSTRAINT "RankingPeriod_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RankingPeriod"
    ADD CONSTRAINT "RankingPeriod_unique_period" UNIQUE ("period_type", "period_start");



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Reward"
    ADD CONSTRAINT "Reward_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RoleAttribute"
    ADD CONSTRAINT "RoleAttribute_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."SpecificRoleAttribute"
    ADD CONSTRAINT "SpecificRoleAttribute_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."UserBadges"
    ADD CONSTRAINT "UserBadges_badge_id_awarded_to_key" UNIQUE ("badge_id", "awarded_to");



ALTER TABLE ONLY "public"."UserBadges"
    ADD CONSTRAINT "UserBadges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ranking_entry_user_id" ON "public"."RankingEntry" USING "btree" ("user_id");



CREATE INDEX "idx_rankingentry_completed_task_count" ON "public"."RankingEntry" USING "btree" ("completed_task_count");



CREATE INDEX "idx_user_total_xp" ON "public"."User" USING "btree" ("total_xp" DESC NULLS LAST);



CREATE INDEX "idx_userbadges_awarded_to" ON "public"."UserBadges" USING "btree" ("awarded_to");



CREATE INDEX "idx_userbadges_badge_id" ON "public"."UserBadges" USING "btree" ("badge_id");



CREATE INDEX "notification_user_read_created_idx" ON "public"."Notification" USING "btree" ("user_id", "read_at", "created_at" DESC);



CREATE OR REPLACE TRIGGER "trg_public_user_delete_on_public_user" AFTER DELETE ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."delete_auth_user_on_public_user_delete"();



CREATE OR REPLACE TRIGGER "trg_user_award_xp_and_level" BEFORE INSERT OR UPDATE OF "xp", "role_id" ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."user_award_xp_and_level"();



CREATE OR REPLACE TRIGGER "user_points_enforce_trigger" BEFORE INSERT OR UPDATE ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."user_points_enforce"();

ALTER TABLE "public"."User" DISABLE TRIGGER "user_points_enforce_trigger";



CREATE OR REPLACE TRIGGER "user_total_xp_insert_trg" BEFORE INSERT ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."user_total_xp_maintain"();



CREATE OR REPLACE TRIGGER "user_total_xp_update_trg" BEFORE UPDATE OF "level", "xp", "role_id" ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."user_total_xp_maintain"();



ALTER TABLE ONLY "public"."AttendanceLog"
    ADD CONSTRAINT "AttendanceLog_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."BadgeRequirements"
    ADD CONSTRAINT "BadgeRequirements_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."Badges"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Badges"
    ADD CONSTRAINT "Badges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."KPICategory"("id");



ALTER TABLE ONLY "public"."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RankingEntry"
    ADD CONSTRAINT "RankingEntry_period_fk" FOREIGN KEY ("ranking_period_id") REFERENCES "public"."RankingPeriod"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RankingEntry"
    ADD CONSTRAINT "RankingEntry_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."Reward"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Reward"
    ADD CONSTRAINT "Reward_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."SpecificRoleAttribute"
    ADD CONSTRAINT "SpecificRoleAttribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."RoleAttribute"("id");



ALTER TABLE ONLY "public"."SpecificRoleAttribute"
    ADD CONSTRAINT "SpecificRoleAttribute_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."UserBadges"
    ADD CONSTRAINT "UserBadges_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."UserBadges"
    ADD CONSTRAINT "UserBadges_awarded_to_fkey" FOREIGN KEY ("awarded_to") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."UserBadges"
    ADD CONSTRAINT "UserBadges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."Badges"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE "public"."Notification" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Notification_delete_all" ON "public"."Notification" FOR DELETE USING (true);



CREATE POLICY "Notification_insert_all" ON "public"."Notification" FOR INSERT WITH CHECK (true);



CREATE POLICY "Notification_select_all" ON "public"."Notification" FOR SELECT USING (true);



CREATE POLICY "Notification_update_all" ON "public"."Notification" FOR UPDATE USING (true) WITH CHECK (true);



ALTER TABLE "public"."RankingEntry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."RankingPeriod" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Role" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."RoleAttribute" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."SpecificRoleAttribute" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employee_select_visible_ranking_entry" ON "public"."RankingEntry" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."RankingPeriod" "rp"
  WHERE (("rp"."id" = "RankingEntry"."ranking_period_id") AND ("rp"."is_visible" = true)))));



CREATE POLICY "employee_select_visible_ranking_period" ON "public"."RankingPeriod" FOR SELECT TO "authenticated" USING (("is_visible" = true));



CREATE POLICY "hr_insert_ranking_entry" ON "public"."RankingEntry" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_hr_user"());



CREATE POLICY "hr_insert_ranking_period" ON "public"."RankingPeriod" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_hr_user"());



CREATE POLICY "hr_select_all_users" ON "public"."User" FOR SELECT TO "authenticated" USING ("public"."is_hr_user"());



CREATE POLICY "hr_select_ranking_entry" ON "public"."RankingEntry" FOR SELECT TO "authenticated" USING ("public"."is_hr_user"());



CREATE POLICY "hr_select_ranking_period" ON "public"."RankingPeriod" FOR SELECT TO "authenticated" USING ("public"."is_hr_user"());



CREATE POLICY "hr_update_ranking_period" ON "public"."RankingPeriod" FOR UPDATE TO "authenticated" USING ("public"."is_hr_user"()) WITH CHECK ("public"."is_hr_user"());



CREATE POLICY "hr_update_user_points" ON "public"."User" FOR UPDATE TO "authenticated" USING ("public"."is_hr_user"()) WITH CHECK ("public"."is_hr_user"());



CREATE POLICY "user_select_own" ON "public"."User" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."Notification";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";














































































































































































GRANT ALL ON FUNCTION "public"."create_user_settings_on_auth_user_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_settings_on_auth_user_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_settings_on_auth_user_insert"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."evaluate_badges"("p_interval" "public"."period_intervals_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."evaluate_badges"("p_interval" "public"."period_intervals_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."evaluate_badges"("p_interval" "public"."period_intervals_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_employee_rank_as_of"("p_user_id" "uuid", "p_cutoff" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_leaderboard_as_of"("p_cutoff" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_leaderboard_as_of"("p_cutoff" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_leaderboard_as_of"("p_cutoff" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_attributes_as_of"("p_cutoff" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_attributes_as_of"("p_cutoff" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_attributes_as_of"("p_cutoff" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_default_view"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_default_view"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_default_view"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_auth_user_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_points_for_user"("target_user_id" "uuid", "amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_points_for_user"("target_user_id" "uuid", "amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_points_for_user"("target_user_id" "uuid", "amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_hr_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_hr_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_hr_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_hr_user_by_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_hr_user_by_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_hr_user_by_type"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_role_type" "text", "p_employment_status" "text", "p_contact_details" "text", "p_home_address" "text", "p_tin_id" "text", "p_sss_id" "text", "p_pagibig_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_role_type" "text", "p_employment_status" "text", "p_contact_details" "text", "p_home_address" "text", "p_tin_id" "text", "p_sss_id" "text", "p_pagibig_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_role_type" "text", "p_employment_status" "text", "p_contact_details" "text", "p_home_address" "text", "p_tin_id" "text", "p_sss_id" "text", "p_pagibig_id" "text") TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "service_role";
GRANT SELECT ON TABLE "public"."User" TO "supabase_auth_admin";
GRANT SELECT,UPDATE ON TABLE "public"."User" TO "authenticated";



GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" character varying, "p_role_id" "uuid", "p_role_type" character varying, "p_employment_status" character varying, "p_contact_number" "text", "p_address" "text", "p_tin" "text", "p_sss" "text", "p_pagibig" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" character varying, "p_role_id" "uuid", "p_role_type" character varying, "p_employment_status" character varying, "p_contact_number" "text", "p_address" "text", "p_tin" "text", "p_sss" "text", "p_pagibig" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" character varying, "p_role_id" "uuid", "p_role_type" character varying, "p_employment_status" character varying, "p_contact_number" "text", "p_address" "text", "p_tin" "text", "p_sss" "text", "p_pagibig" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."toggle_task_employee_view"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."toggle_task_employee_view"() TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_task_employee_view"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_task_employee_view"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_award_xp_and_level"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_award_xp_and_level"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_award_xp_and_level"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."user_points_enforce"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_points_enforce"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_points_enforce"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_points_enforce"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_total_xp_maintain"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_total_xp_maintain"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_total_xp_maintain"() TO "service_role";
























GRANT ALL ON TABLE "public"."AttendanceLog" TO "anon";
GRANT ALL ON TABLE "public"."AttendanceLog" TO "authenticated";
GRANT ALL ON TABLE "public"."AttendanceLog" TO "service_role";



GRANT ALL ON TABLE "public"."BadgeRequirements" TO "anon";
GRANT ALL ON TABLE "public"."BadgeRequirements" TO "authenticated";
GRANT ALL ON TABLE "public"."BadgeRequirements" TO "service_role";



GRANT ALL ON TABLE "public"."Badges" TO "anon";
GRANT ALL ON TABLE "public"."Badges" TO "authenticated";
GRANT ALL ON TABLE "public"."Badges" TO "service_role";



GRANT ALL ON TABLE "public"."Dishes" TO "anon";
GRANT ALL ON TABLE "public"."Dishes" TO "authenticated";
GRANT ALL ON TABLE "public"."Dishes" TO "service_role";



GRANT ALL ON TABLE "public"."KPICategory" TO "anon";
GRANT ALL ON TABLE "public"."KPICategory" TO "authenticated";
GRANT ALL ON TABLE "public"."KPICategory" TO "service_role";



GRANT ALL ON TABLE "public"."KPITask" TO "anon";
GRANT ALL ON TABLE "public"."KPITask" TO "authenticated";
GRANT ALL ON TABLE "public"."KPITask" TO "service_role";



GRANT ALL ON TABLE "public"."Level" TO "anon";
GRANT ALL ON TABLE "public"."Level" TO "authenticated";
GRANT ALL ON TABLE "public"."Level" TO "service_role";



GRANT ALL ON TABLE "public"."Notification" TO "anon";
GRANT ALL ON TABLE "public"."Notification" TO "authenticated";
GRANT ALL ON TABLE "public"."Notification" TO "service_role";



GRANT ALL ON TABLE "public"."RankingEntry" TO "anon";
GRANT ALL ON TABLE "public"."RankingEntry" TO "authenticated";
GRANT ALL ON TABLE "public"."RankingEntry" TO "service_role";



GRANT ALL ON TABLE "public"."RankingPeriod" TO "anon";
GRANT ALL ON TABLE "public"."RankingPeriod" TO "authenticated";
GRANT ALL ON TABLE "public"."RankingPeriod" TO "service_role";



GRANT ALL ON TABLE "public"."Reward" TO "anon";
GRANT ALL ON TABLE "public"."Reward" TO "authenticated";
GRANT ALL ON TABLE "public"."Reward" TO "service_role";



GRANT ALL ON TABLE "public"."RewardRequest" TO "anon";
GRANT ALL ON TABLE "public"."RewardRequest" TO "authenticated";
GRANT ALL ON TABLE "public"."RewardRequest" TO "service_role";



GRANT ALL ON TABLE "public"."Role" TO "service_role";
GRANT SELECT ON TABLE "public"."Role" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."RoleAttribute" TO "anon";
GRANT ALL ON TABLE "public"."RoleAttribute" TO "authenticated";
GRANT ALL ON TABLE "public"."RoleAttribute" TO "service_role";



GRANT ALL ON TABLE "public"."SpecificRoleAttribute" TO "anon";
GRANT ALL ON TABLE "public"."SpecificRoleAttribute" TO "authenticated";
GRANT ALL ON TABLE "public"."SpecificRoleAttribute" TO "service_role";



GRANT ALL ON TABLE "public"."UserBadges" TO "anon";
GRANT ALL ON TABLE "public"."UserBadges" TO "authenticated";
GRANT ALL ON TABLE "public"."UserBadges" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_log_view" TO "anon";
GRANT ALL ON TABLE "public"."attendance_log_view" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_log_view" TO "service_role";



GRANT ALL ON TABLE "public"."badge_conditions_view" TO "anon";
GRANT ALL ON TABLE "public"."badge_conditions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_conditions_view" TO "service_role";



GRANT ALL ON TABLE "public"."employee_daily_attendance_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."employee_daily_attendance_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_daily_attendance_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."employee_annual_attendance_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."employee_annual_attendance_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_annual_attendance_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."employee_monthly_attendance_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."employee_monthly_attendance_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_monthly_attendance_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."employee_weekly_attendance_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."employee_weekly_attendance_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_weekly_attendance_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."ranking_leaderboard_view" TO "anon";
GRANT ALL ON TABLE "public"."ranking_leaderboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."ranking_leaderboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."role_attributes" TO "anon";
GRANT ALL ON TABLE "public"."role_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."role_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."task_info_view" TO "anon";
GRANT ALL ON TABLE "public"."task_info_view" TO "authenticated";
GRANT ALL ON TABLE "public"."task_info_view" TO "service_role";



GRANT ALL ON TABLE "public"."total_attendance_stats_view" TO "anon";
GRANT ALL ON TABLE "public"."total_attendance_stats_view" TO "authenticated";
GRANT ALL ON TABLE "public"."total_attendance_stats_view" TO "service_role";



GRANT ALL ON TABLE "public"."user_attributes" TO "anon";
GRANT ALL ON TABLE "public"."user_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."user_collected_badges_view" TO "anon";
GRANT ALL ON TABLE "public"."user_collected_badges_view" TO "authenticated";
GRANT ALL ON TABLE "public"."user_collected_badges_view" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































