## LifeScore

LifeScore is a small daily check‑in app built with Next.js, Supabase, and TailwindCSS. It helps you answer one question: **Did you live a good life today?**

### Tech stack

- Next.js (App Router, TypeScript)
- TailwindCSS
- Supabase (PostgreSQL + Auth)

### Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**

   - Go to the Supabase dashboard and create a new project.
   - Under **Project Settings → API**, copy:
     - `Project URL`
     - `anon` public key

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
   ```

4. **Create the `daily_logs` table**

   In the Supabase SQL editor, run:

   ```sql
   create table if not exists public.daily_logs (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references auth.users(id) on delete cascade,
     date date not null,
     water_ml integer not null default 0,
     sleep_hours numeric not null default 0,
     exercise_minutes integer not null default 0,
     learning_minutes integer not null default 0,
     food_logged boolean not null default false,
     score integer not null default 0,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now(),
     unique (user_id, date)
   );

   create index if not exists daily_logs_user_date_idx
     on public.daily_logs (user_id, date);
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Then open `http://localhost:3000` in your browser.

### Life Score model

The dashboard computes a score out of 100 using:

- **Water**
  - `>= 3000 ml` → 15 points
  - `>= 2000 ml` → 10 points
  - `>= 1000 ml` → 5 points
- **Sleep**
  - `7–8 hours` → 20 points
  - `6 hours` → 10 points
- **Exercise**
  - `>= 60 min` → 25 points
  - `>= 30 min` → 15 points
- **Learning**
  - `>= 60 min` → 15 points
  - `>= 30 min` → 10 points
- **Food logged**
  - `true` → 25 points

The dashboard shows both the total score and a category‑by‑category breakdown.

---

### Host on GitHub

1. **Install Git** (if needed): [git-scm.com/download/win](https://git-scm.com/download/win)

2. **Create a new repo on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Name it `lifescore` (or any name)
   - Leave it empty (no README, .gitignore, or license)
   - Copy the repo URL (e.g. `https://github.com/yourname/lifescore.git`)

3. **Run the deploy script**
   - Open `deploy-to-github.ps1` and set `$repoUrl` to your repo URL
   - In PowerShell, run: `.\deploy-to-github.ps1`
   - Or run these commands manually:

   ```powershell
   git init
   git branch -M main
   git add .
   git commit -m "Initial LifeScore app"
   git remote add origin https://github.com/YOUR_USERNAME/lifescore.git
   git push -u origin main
   ```

4. **Deploy the app (optional)**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy — others can use the live URL

