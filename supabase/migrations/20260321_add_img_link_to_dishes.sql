-- Migration: Add image link column to Dishes table and rename Level.img_link
-- Date: 2026-03-21
-- Purpose:
--   1. Add 'img_link' column to Dishes table for storing dish-specific image URLs
--   2. Rename Level.img_link to Level.bg_img_link for clarity (background image)

-- ============================================
-- Level Table Modifications
-- ============================================

-- Rename img_link to bg_img_link in Level table for clarity
ALTER TABLE "public"."Level"
RENAME COLUMN "img_link" TO "bg_img_link";

-- Add comment for bg_img_link column
COMMENT ON COLUMN "public"."Level"."bg_img_link" IS 'Background image URL for the kitchen when player is at this level.';

-- ============================================
-- Dishes Table Modifications
-- ============================================

-- Add img_link column (image link for the dish itself)
ALTER TABLE "public"."Dishes"
ADD COLUMN "img_link" text;

-- Add comment for img_link column
COMMENT ON COLUMN "public"."Dishes"."img_link" IS 'Image URL for the dish. Displayed in the cooking UI and mercado/shop.';
