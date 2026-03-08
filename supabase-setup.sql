-- ============================================
-- LifeScore — Supabase Setup
-- ============================================
-- Run this entire file in Supabase SQL Editor:
-- 1. Go to supabase.com → your project
-- 2. Click "SQL Editor" in the left menu
-- 3. Click "New query"
-- 4. Copy ALL the text below and paste it
-- 5. Click "Run" (or press Ctrl+Enter)
-- ============================================

-- Step 1: Create the daily_logs table (skip if you already have it)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  water_ml integer NOT NULL DEFAULT 0,
  sleep_hours numeric NOT NULL DEFAULT 0,
  exercise_minutes integer NOT NULL DEFAULT 0,
  learning_minutes integer NOT NULL DEFAULT 0,
  food_logged boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_logs_user_date_idx
ON public.daily_logs (user_id, date);

-- Step 2: Allow users to save their own logs (fixes "Could not save" error)
-- (Dropping first in case you run this file more than once)
DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can select own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;

CREATE POLICY "Users can insert own logs"
ON public.daily_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own logs"
ON public.daily_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
ON public.daily_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
