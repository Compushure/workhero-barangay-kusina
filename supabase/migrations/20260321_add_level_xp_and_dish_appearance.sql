-- Migration: Add XP requirements to Level table and appearance level to Dishes
-- Date: 2026-03-21
-- Purpose:
--   1. Add 'xp' column to Level table for required XP to reach that level
--   2. Add 'img_link' column to Level table for kitchen background images
--   3. Add 'start_appear_level' column to Dishes table for progressive dish unlocking
--   4. Update leveling system to use DB-driven XP values instead of hardcoded frontend logic

-- ============================================
-- Level Table Modifications
-- ============================================

-- Add xp column (required XP to reach this level)
-- Default: NULL initially, will be populated with level progression values
ALTER TABLE "public"."Level"
ADD COLUMN "xp" integer;

-- Add img_link column (background image for kitchen at this level)
ALTER TABLE "public"."Level"
ADD COLUMN "img_link" text;

-- Add comment for xp column
COMMENT ON COLUMN "public"."Level"."xp" IS 'Required total XP to reach this level. Used for leveling progression.';

-- Add comment for img_link column
COMMENT ON COLUMN "public"."Level"."img_link" IS 'Background image URL for the kitchen when player is at this level.';

-- ============================================
-- Dishes Table Modifications
-- ============================================

-- Add start_appear_level column (level at which this dish becomes available)
ALTER TABLE "public"."Dishes"
ADD COLUMN "start_appear_level" integer DEFAULT 1;

-- Add comment for start_appear_level column
COMMENT ON COLUMN "public"."Dishes"."start_appear_level" IS 'Minimum player level required to see/cook this dish. Default 1 for all dishes.';

-- ============================================
-- Add unique constraint on level column
-- ============================================
-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Level_level_key'
    AND table_name = 'Level'
  ) THEN
    ALTER TABLE "public"."Level"
    ADD CONSTRAINT "Level_level_key" UNIQUE ("level");
  END IF;
END $$;

-- ============================================
-- Seed Data for Levels
-- ============================================
-- Max level is 10, users start at level 1
-- XP progression: each level requires a cumulative amount of XP

-- Insert/Update Level data with XP milestones
-- Formula: Each level requires progressively more XP
-- Level 1: 0 XP (starting point)
-- Level 2: 100 XP
-- Level 3: 250 XP
-- Level 4: 450 XP
-- Level 5: 700 XP
-- Level 6: 1000 XP
-- Level 7: 1350 XP
-- Level 8: 1750 XP
-- Level 9: 2200 XP
-- Level 10: 2700 XP (max level)

INSERT INTO "public"."Level" ("id", "level", "xp", "img_link", "perk")
VALUES 
  (gen_random_uuid(), 1, 0, NULL, 'Level 1 - Trainee'),
  (gen_random_uuid(), 2, 100, NULL, 'Level 2 - Apprentice'),
  (gen_random_uuid(), 3, 250, NULL, 'Level 3 - Skilled'),
  (gen_random_uuid(), 4, 450, NULL, 'Level 4 - Experienced'),
  (gen_random_uuid(), 5, 700, NULL, 'Level 5 - Expert'),
  (gen_random_uuid(), 6, 1000, NULL, 'Level 6 - Master'),
  (gen_random_uuid(), 7, 1350, NULL, 'Level 7 - Grand Master'),
  (gen_random_uuid(), 8, 1750, NULL, 'Level 8 - Legendary'),
  (gen_random_uuid(), 9, 2200, NULL, 'Level 9 - Mythic'),
  (gen_random_uuid(), 10, 2700, NULL, 'Level 10 - Ultimate Chef')
ON CONFLICT ("level") DO UPDATE
SET "xp" = EXCLUDED."xp", "img_link" = EXCLUDED."img_link", "perk" = EXCLUDED."perk";

-- Note: Image links should be populated separately through the application
-- or manually in the admin panel based on actual image assets

-- ============================================
-- User Level Cap Constraint
-- ============================================
-- Ensure users cannot exceed level 10
-- This constraint should enforce max level = 10 in the User table

-- Add constraint if not already present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'User_level_max_cap_check'
  ) THEN
    ALTER TABLE "public"."User"
    ADD CONSTRAINT "User_level_max_cap_check" CHECK ("level" <= 10);
  END IF;
END $$;

-- ============================================
-- XP Calculation Logic Notes
-- ============================================
-- Frontend should now:
-- 1. Get Level table data with 'xp' values
-- 2. For user at level N, calculate progress to level N+1:
--    - Get required_xp for level N+1 from Level table
--    - If not found, default to 100
--    - current_progress = user.xp
--    - progress_percent = (current_progress / required_xp) * 100
-- 3. Users can earn XP up to level 10 but cannot level up beyond 10
--    - Their total_xp can exceed 2700 but level stays capped at 10
-- 4. Points production is not affected by level cap
