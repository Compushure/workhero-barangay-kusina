


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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

SET default_tablespace = '';

SET default_table_access_method = "heap";


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
    "points" integer NOT NULL
);


ALTER TABLE "public"."KPICategory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."KPITask" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assigned_by" "uuid",
    "assigned_to" "uuid",
    "category_id" "uuid",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."KPITask" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Level" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "level" integer NOT NULL,
    "perk" "text"
);


ALTER TABLE "public"."Level" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Reward" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "points_cost" integer NOT NULL,
    "category" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."Reward" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RewardRequest" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "approved_by" "uuid",
    "requested_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."RewardRequest" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Role" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."Role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RoleAttribute" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role_id" "uuid",
    "name" character varying(255) NOT NULL,
    "value" character varying(255)
);


ALTER TABLE "public"."RoleAttribute" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role_id" "uuid",
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "date_added" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_role_attribute" AS
 SELECT "u"."id" AS "user_id",
    "u"."name" AS "user_name",
    "u"."email" AS "user_email",
    "u"."date_added" AS "user_date_added",
    "r"."id" AS "role_id",
    "r"."type" AS "role_type",
    "ra"."id" AS "role_attribute_id",
    "ra"."name" AS "role_attribute_name",
    "ra"."value" AS "role_attribute_value"
   FROM (("public"."User" "u"
     LEFT JOIN "public"."Role" "r" ON (("u"."role_id" = "r"."id")))
     LEFT JOIN "public"."RoleAttribute" "ra" ON (("r"."id" = "ra"."role_id")));


ALTER VIEW "public"."user_role_attribute" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_role_with_attributes" AS
 SELECT "u"."id" AS "user_id",
    "u"."name" AS "user_name",
    "u"."email" AS "user_email",
    "u"."date_added" AS "user_date_added",
    "r"."id" AS "role_id",
    "r"."type" AS "role_type",
    COALESCE("jsonb_object_agg"("ra"."name", "ra"."value") FILTER (WHERE ("ra"."name" IS NOT NULL)), '{}'::"jsonb") AS "role_attributes"
   FROM (("public"."User" "u"
     LEFT JOIN "public"."Role" "r" ON (("u"."role_id" = "r"."id")))
     LEFT JOIN "public"."RoleAttribute" "ra" ON (("r"."id" = "ra"."role_id")))
  GROUP BY "u"."id", "u"."name", "u"."email", "u"."date_added", "r"."id", "r"."type";


ALTER VIEW "public"."user_role_with_attributes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."Dishes"
    ADD CONSTRAINT "Dishes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."KPICategory"
    ADD CONSTRAINT "KPICategory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Level"
    ADD CONSTRAINT "Level_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Reward"
    ADD CONSTRAINT "Reward_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RoleAttribute"
    ADD CONSTRAINT "RoleAttribute_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "trg_public_user_delete_on_public_user" AFTER DELETE ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."delete_auth_user_on_public_user_delete"();



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."KPITask"
    ADD CONSTRAINT "KPITask_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."KPICategory"("id");



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."Reward"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RewardRequest"
    ADD CONSTRAINT "RewardRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Reward"
    ADD CONSTRAINT "Reward_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."RoleAttribute"
    ADD CONSTRAINT "RoleAttribute_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE "public"."KPITask" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Role" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."RoleAttribute" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";

























































































































































REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_public_user_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_public_user_on_auth_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_assign_user_role_by_type"("p_user_id" "uuid", "p_new_role_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_and_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_update_user_name_and_assign_role"("p_user_id" "uuid", "p_new_name" "text", "p_new_role_type" "text") TO "service_role";


















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



GRANT ALL ON TABLE "public"."User" TO "service_role";
GRANT SELECT ON TABLE "public"."User" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."user_role_attribute" TO "anon";
GRANT ALL ON TABLE "public"."user_role_attribute" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role_attribute" TO "service_role";



GRANT ALL ON TABLE "public"."user_role_with_attributes" TO "anon";
GRANT ALL ON TABLE "public"."user_role_with_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role_with_attributes" TO "service_role";









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































drop extension if exists "pg_net";

revoke delete on table "public"."Role" from "anon";

revoke insert on table "public"."Role" from "anon";

revoke references on table "public"."Role" from "anon";

revoke select on table "public"."Role" from "anon";

revoke trigger on table "public"."Role" from "anon";

revoke truncate on table "public"."Role" from "anon";

revoke update on table "public"."Role" from "anon";

revoke delete on table "public"."Role" from "authenticated";

revoke insert on table "public"."Role" from "authenticated";

revoke references on table "public"."Role" from "authenticated";

revoke select on table "public"."Role" from "authenticated";

revoke trigger on table "public"."Role" from "authenticated";

revoke truncate on table "public"."Role" from "authenticated";

revoke update on table "public"."Role" from "authenticated";

revoke delete on table "public"."User" from "anon";

revoke insert on table "public"."User" from "anon";

revoke references on table "public"."User" from "anon";

revoke select on table "public"."User" from "anon";

revoke trigger on table "public"."User" from "anon";

revoke truncate on table "public"."User" from "anon";

revoke update on table "public"."User" from "anon";

revoke delete on table "public"."User" from "authenticated";

revoke insert on table "public"."User" from "authenticated";

revoke references on table "public"."User" from "authenticated";

revoke select on table "public"."User" from "authenticated";

revoke trigger on table "public"."User" from "authenticated";

revoke truncate on table "public"."User" from "authenticated";

revoke update on table "public"."User" from "authenticated";

CREATE TRIGGER trg_auth_user_delete_on_auth_users AFTER DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.delete_public_user_on_auth_delete();


