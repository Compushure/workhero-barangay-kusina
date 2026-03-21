-- Migration: Disable automatic XP/level/total_xp triggers on User
-- Date: 2026-03-21
-- Purpose:
--   Disable trigger-based XP mutations so awarding logic is fully managed in app/server actions.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'User'
      AND t.tgname = 'trg_user_award_xp_and_level'
  ) THEN
    EXECUTE 'ALTER TABLE "public"."User" DISABLE TRIGGER "trg_user_award_xp_and_level"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'User'
      AND t.tgname = 'user_total_xp_insert_trg'
  ) THEN
    EXECUTE 'ALTER TABLE "public"."User" DISABLE TRIGGER "user_total_xp_insert_trg"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'User'
      AND t.tgname = 'user_total_xp_update_trg'
  ) THEN
    EXECUTE 'ALTER TABLE "public"."User" DISABLE TRIGGER "user_total_xp_update_trg"';
  END IF;
END $$;