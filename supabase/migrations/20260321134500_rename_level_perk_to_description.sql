-- Migration: Rename Level.perk to Level.description
-- Date: 2026-03-21
-- Purpose:
--   Rename the Level table text column from perk to description for clearer semantics.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Level'
      AND column_name = 'perk'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Level'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE "public"."Level"
    RENAME COLUMN "perk" TO "description";
  END IF;
END $$;

COMMENT ON COLUMN "public"."Level"."description" IS
  'Description text for this level (formerly perk).';
