-- Replace meal toggles with macro inputs (protein, carbs, fat per meal)
-- Users enter macros for breakfast, lunch, snacks, dinner. Score based on daily totals.

-- Add macro columns per meal (protein_g, carbs_g, fat_g)
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS breakfast_protein numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS breakfast_carbs numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS breakfast_fat numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS lunch_protein numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS lunch_carbs numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS lunch_fat numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS snacks_protein numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS snacks_carbs numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS snacks_fat numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS dinner_protein numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS dinner_carbs numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS dinner_fat numeric NOT NULL DEFAULT 0;

-- Drop old meal toggle columns
ALTER TABLE public.daily_logs DROP COLUMN IF EXISTS breakfast_logged;
ALTER TABLE public.daily_logs DROP COLUMN IF EXISTS lunch_logged;
ALTER TABLE public.daily_logs DROP COLUMN IF EXISTS snacks_logged;
ALTER TABLE public.daily_logs DROP COLUMN IF EXISTS dinner_logged;
