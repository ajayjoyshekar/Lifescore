'use client';

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type MealLog = {
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
};

type LifeMetrics = {
  water_ml: number;
  sleep_hours: number;
  exercise_minutes: number;
  learning_minutes: number;
  meals: MealLog;
};

type ScoreBreakdown = {
  water: number;
  sleep: number;
  exercise: number;
  learning: number;
  food: number;
  total: number;
};

const emptyMeals: MealLog = {
  breakfast: false,
  lunch: false,
  snacks: false,
  dinner: false
};

const emptyMetrics: LifeMetrics = {
  water_ml: 0,
  sleep_hours: 0,
  exercise_minutes: 0,
  learning_minutes: 0,
  meals: { ...emptyMeals }
};

function calculateScore(metrics: LifeMetrics): ScoreBreakdown {
  let water = 0;
  if (metrics.water_ml >= 3000) water = 15;
  else if (metrics.water_ml >= 2000) water = 10;
  else if (metrics.water_ml >= 1000) water = 5;

  let sleep = 0;
  if (metrics.sleep_hours >= 7 && metrics.sleep_hours <= 8) sleep = 20;
  else if (metrics.sleep_hours === 6) sleep = 10;

  let exercise = 0;
  if (metrics.exercise_minutes >= 60) exercise = 25;
  else if (metrics.exercise_minutes >= 30) exercise = 15;

  let learning = 0;
  if (metrics.learning_minutes >= 60) learning = 15;
  else if (metrics.learning_minutes >= 30) learning = 10;

  // Food: 25 pts max. Breakfast 7, Lunch 6, Snacks 5, Dinner 7
  let food = 0;
  if (metrics.meals.breakfast) food += 7;
  if (metrics.meals.lunch) food += 6;
  if (metrics.meals.snacks) food += 5;
  if (metrics.meals.dinner) food += 7;

  const total = water + sleep + exercise + learning + food;

  return { water, sleep, exercise, learning, food, total };
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<LifeMetrics>(emptyMetrics);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [logId, setLogId] = useState<string | null>(null);

  const score = useMemo(() => calculateScore(metrics), [metrics]);

  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (user) {
        void loadTodayMetrics(user.id);
      }
    };

    init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadTodayMetrics(session.user.id);
      } else {
        setMetrics(emptyMetrics);
        setLogId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTodayMetrics = async (userId: string) => {
    setMetricsLoading(true);
    setSaveMessage(null);
    try {
      const today = todayString();
      const { data, error } = await supabase
        .from("daily_logs")
        .select(
          "id, water_ml, sleep_hours, exercise_minutes, learning_minutes, breakfast_logged, lunch_logged, snacks_logged, dinner_logged"
        )
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        // ignore "no rows" error code
        console.error(error);
      }

      if (data) {
        setLogId(data.id);
        setMetrics({
          water_ml: data.water_ml ?? 0,
          sleep_hours: data.sleep_hours ?? 0,
          exercise_minutes: data.exercise_minutes ?? 0,
          learning_minutes: data.learning_minutes ?? 0,
          meals: {
            breakfast: data.breakfast_logged ?? false,
            lunch: data.lunch_logged ?? false,
            snacks: data.snacks_logged ?? false,
            dinner: data.dinner_logged ?? false
          }
        });
      } else {
        setLogId(null);
        setMetrics(emptyMetrics);
      }
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      setAuthError("Please enter an email and password.");
      return;
    }

    try {
      setAuthLoading(true);
      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) {
          setAuthError(error.message);
        } else {
          setAuthError(
            "Sign up successful. Please check your email to confirm your account if required."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setAuthError(error.message);
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleMetricChange = <K extends keyof LifeMetrics>(
    key: K,
    value: LifeMetrics[K]
  ) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMealChange = (meal: keyof MealLog, value: boolean) => {
    setMetrics((prev) => ({
      ...prev,
      meals: { ...prev.meals, [meal]: value }
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const today = todayString();
      const payload = {
        user_id: user.id,
        date: today,
        water_ml: metrics.water_ml,
        sleep_hours: metrics.sleep_hours,
        exercise_minutes: metrics.exercise_minutes,
        learning_minutes: metrics.learning_minutes,
        breakfast_logged: metrics.meals.breakfast,
        lunch_logged: metrics.meals.lunch,
        snacks_logged: metrics.meals.snacks,
        dinner_logged: metrics.meals.dinner,
        score: score.total
      };

      let response;
      if (logId) {
        response = await supabase
          .from("daily_logs")
          .update(payload)
          .eq("id", logId)
          .select("id")
          .single();
      } else {
        response = await supabase
          .from("daily_logs")
          .insert(payload)
          .select("id")
          .single();
      }

      const { data, error } = response;
      if (error) {
        console.error(error);
        setSaveMessage("Could not save today’s log. Please try again.");
      } else {
        setLogId(data.id);
        setSaveMessage("Saved! You lived intentionally today.");
      }
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  if (authLoading && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 shadow-xl shadow-slate-900/50">
          <p className="text-sm text-slate-300">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <header className="space-y-1 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">
              Lifescore
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Did you live a good life today?
            </h1>
            <p className="text-xs text-slate-300">
              Log your day. Watch your Life Score rise, one choice at a time.
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                placeholder="At least 6 characters"
                autoComplete={
                  isSignUpMode ? "new-password" : "current-password"
                }
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authLoading
                ? "Working..."
                : isSignUpMode
                ? "Sign up and start tracking"
                : "Log in to your LifeScore"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-300">
            {isSignUpMode ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode((v) => !v);
                setAuthError(null);
              }}
              className="font-medium text-brand-300 underline-offset-4 hover:underline"
            >
              {isSignUpMode ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-300">
              Lifescore
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Did you live a good life today?
            </h1>
            <p className="text-xs text-slate-300">{today}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-800/90"
          >
            Sign out
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Today&apos;s Life Score
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Aim for 100 by hitting the essentials.
                  </p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 via-emerald-400 to-amber-300 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (score.total / 100) * 100)
                        )}%`
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-300">
                    Your score updates as you log today.
                  </p>
                </div>
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-950/80 text-center shadow-inner shadow-slate-950/70">
                  <span className="text-[10px] font-medium text-slate-300">
                    Score
                  </span>
                  <span className="mt-1 text-3xl font-semibold tabular-nums">
                    {score.total}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
              <p className="text-xs font-semibold text-slate-200">
                Score breakdown
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-3">
                <BreakdownItem
                  label="Water"
                  value={score.water}
                  max={15}
                  detail={`${metrics.water_ml || 0} ml`}
                />
                <BreakdownItem
                  label="Sleep"
                  value={score.sleep}
                  max={20}
                  detail={`${metrics.sleep_hours || 0} hrs`}
                />
                <BreakdownItem
                  label="Exercise"
                  value={score.exercise}
                  max={25}
                  detail={`${metrics.exercise_minutes || 0} min`}
                />
                <BreakdownItem
                  label="Learning"
                  value={score.learning}
                  max={15}
                  detail={`${metrics.learning_minutes || 0} min`}
                />
                <BreakdownItem
                  label="Meals"
                  value={score.food}
                  max={25}
                  detail={`${[metrics.meals.breakfast && "B", metrics.meals.lunch && "L", metrics.meals.snacks && "S", metrics.meals.dinner && "D"].filter(Boolean).join(", ") || "None logged"}`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-200">
                  Log today&apos;s inputs
                </p>
                {metricsLoading && (
                  <p className="text-[10px] text-slate-400">
                    Loading today&apos;s log...
                  </p>
                )}
              </div>

              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <FieldCard
                  label="Water"
                  description="Aim for 3000 ml"
                  suffix="ml"
                >
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={metrics.water_ml}
                    onChange={(e) =>
                      handleMetricChange("water_ml", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/40"
                  />
                </FieldCard>

                <FieldCard
                  label="Sleep"
                  description="7–8 hours for full points"
                  suffix="hrs"
                >
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={metrics.sleep_hours}
                    onChange={(e) =>
                      handleMetricChange("sleep_hours", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/40"
                  />
                </FieldCard>

                <FieldCard
                  label="Exercise"
                  description="Move your body"
                  suffix="min"
                >
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={metrics.exercise_minutes}
                    onChange={(e) =>
                      handleMetricChange(
                        "exercise_minutes",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/40"
                  />
                </FieldCard>

                <FieldCard
                  label="Learning"
                  description="Invest in your mind"
                  suffix="min"
                >
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={metrics.learning_minutes}
                    onChange={(e) =>
                      handleMetricChange(
                        "learning_minutes",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/40"
                  />
                </FieldCard>

                <div className="col-span-1 sm:col-span-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs font-medium text-slate-200">
                      Meals logged
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Log each meal for up to 25 pts (B 7, L 6, S 5, D 7).
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MealToggle
                        label="Breakfast"
                        checked={metrics.meals.breakfast}
                        onChange={(v) => handleMealChange("breakfast", v)}
                      />
                      <MealToggle
                        label="Lunch"
                        checked={metrics.meals.lunch}
                        onChange={(v) => handleMealChange("lunch", v)}
                      />
                      <MealToggle
                        label="Snacks"
                        checked={metrics.meals.snacks}
                        onChange={(v) => handleMealChange("snacks", v)}
                      />
                      <MealToggle
                        label="Dinner"
                        checked={metrics.meals.dinner}
                        onChange={(v) => handleMealChange("dinner", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save today’s log"}
                </button>
                {saveMessage && (
                  <p className="text-[11px] text-emerald-300">{saveMessage}</p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              LifeScore focuses on a few keystone habits: hydration, sleep,
              movement, learning, and mindful eating. Perfect days are rare;
              consistency is what counts.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BreakdownItem(props: {
  label: string;
  value: number;
  max: number;
  detail: string;
}) {
  const pct = (props.value / props.max) * 100;
  return (
    <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-slate-200">
          {props.label}
        </p>
        <span className="text-[10px] tabular-nums text-slate-300">
          {props.value} / {props.max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 via-emerald-400 to-amber-300"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400">{props.detail}</p>
    </div>
  );
}

function FieldCard(props: {
  label: string;
  description: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-slate-200">
            {props.label}
          </p>
          <p className="text-[10px] text-slate-400">{props.description}</p>
        </div>
        {props.suffix && (
          <span className="text-[10px] text-slate-400">{props.suffix}</span>
        )}
      </div>
      {props.children}
    </div>
  );
}

function MealToggle(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
      <span className="text-[11px] font-medium text-slate-200">{props.label}</span>
      <button
        type="button"
        onClick={() => props.onChange(!props.checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border text-[10px] font-medium transition ${
          props.checked
            ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
            : "border-slate-700 bg-slate-900/80 text-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
            props.checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

