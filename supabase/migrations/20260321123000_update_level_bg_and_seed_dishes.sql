-- Migration: Update level background links and seed dish image links
-- Date: 2026-03-21
-- Purpose:
--   1) Populate Level.bg_img_link for levels 1..10
--   2) Seed/refresh core dishes with img_link, rng, and start_appear_level

-- ============================================
-- Level background image links
-- ============================================

UPDATE "public"."Level"
SET "bg_img_link" = CONCAT(
  'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/kitchen/level_',
  "level"::text,
  '_bg.png'
)
WHERE "level" BETWEEN 1 AND 10;

-- ============================================
-- Dishes seed/update (idempotent)
-- ============================================

-- Insert missing rows first
INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Adobo', 'Adobo', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-adobo.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'adobo'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Halohalo', 'Halohalo', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-halohalo.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'halohalo'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Inasal', 'Inasal', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-inasal.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'inasal'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Karekare', 'Karekare', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-karekare.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'karekare'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Lechon', 'Lechon', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-lechon.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'lechon'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Lumpia', 'Lumpia', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-lumpia.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'lumpia'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Sinigang', 'Sinigang', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-sinigang.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'sinigang'
);

INSERT INTO "public"."Dishes" ("id", "name", "description", "rng", "start_appear_level", "img_link")
SELECT gen_random_uuid(), 'Sisig', 'Sisig', 0.8, 1,
       'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-sisig.png'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Dishes" d WHERE lower(d."name") = 'sisig'
);

-- Then update all target rows to enforce consistent values
UPDATE "public"."Dishes"
SET
  "description" = 'Adobo',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-adobo.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'adobo';

UPDATE "public"."Dishes"
SET
  "description" = 'Halohalo',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-halohalo.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'halohalo';

UPDATE "public"."Dishes"
SET
  "description" = 'Inasal',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-inasal.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'inasal';

UPDATE "public"."Dishes"
SET
  "description" = 'Karekare',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-karekare.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'karekare';

UPDATE "public"."Dishes"
SET
  "description" = 'Lechon',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-lechon.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'lechon';

UPDATE "public"."Dishes"
SET
  "description" = 'Lumpia',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-lumpia.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'lumpia';

UPDATE "public"."Dishes"
SET
  "description" = 'Sinigang',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-sinigang.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'sinigang';

UPDATE "public"."Dishes"
SET
  "description" = 'Sisig',
  "img_link" = 'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/dish/food-sisig.png',
  "rng" = 0.8,
  "start_appear_level" = 1
WHERE lower("name") = 'sisig';
