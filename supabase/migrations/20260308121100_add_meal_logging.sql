-- Add meal logging columns (breakfast, lunch, snacks, dinner)
-- Replaces single food_logged boolean with granular meal tracking

ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS breakfast_logged boolean NOT NULL DEFAULT false;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS lunch_logged boolean NOT NULL DEFAULT false;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS snacks_logged boolean NOT NULL DEFAULT false;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS dinner_logged boolean NOT NULL DEFAULT false;

-- Migrate existing data: if food_logged was true, set all meals to true
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_logs' AND column_name = 'food_logged'
  ) THEN
    UPDATE public.daily_logs
    SET breakfast_logged = true, lunch_logged = true, snacks_logged = true, dinner_logged = true
    WHERE food_logged = true;
    ALTER TABLE public.daily_logs DROP COLUMN food_logged;
  END IF;
END $$;
