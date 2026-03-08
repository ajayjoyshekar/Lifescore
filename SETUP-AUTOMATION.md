# LifeScore — Setup for Less Manual Work

This guide walks you through one-time setup so the assistant can do more for you automatically (especially database changes). Do each section in order.

---

## Part 1: Install Node.js (if needed)

The Supabase CLI needs Node.js. You likely have it already since the app runs.

**Check:**
1. Open PowerShell.
2. Run: `node --version`
3. If you see a version (e.g. `v20.10.0`), skip to Part 2.
4. If you see "not recognized", install from: https://nodejs.org (choose the LTS version).

---

## Part 2: Install Supabase CLI

1. Open PowerShell.
2. Go to your project folder:
   ```powershell
   cd "C:\Users\ajayj\OneDrive\Desktop\Did you live a good life today"
   ```
3. Install the Supabase CLI into *this project* (recommended on Windows):
   ```powershell
   npm install -D supabase
   ```
4. Wait for it to finish (may take 1–2 minutes).
5. Check it worked:
   ```powershell
   npm exec -- supabase --version
   ```
   You should see a version number.

---

## Part 3: Log in to Supabase (one time)

1. In PowerShell, run:
   ```powershell
   npm exec -- supabase login
   ```
2. Your browser will open.
3. Sign in to Supabase (or create an account).
4. Click **Authorize** to allow the CLI.
5. Return to PowerShell — you should see "Logged in."

---

## Part 4: Get Your Supabase Project Reference

1. Go to https://supabase.com and sign in.
2. Open your **LifeScore** project.
3. Click the **Settings** icon (gear) in the left sidebar.
4. Click **General**.
5. Find **Reference ID** or **Project ID** — it looks like `abcdefghijklmnop` (about 20 letters).
6. Copy it and keep it handy (e.g. in Notepad).

---

## Part 5: Link Supabase to Your Project

1. Open PowerShell.
2. Go to your project folder:
   ```powershell
   cd "C:\Users\ajayj\OneDrive\Desktop\Did you live a good life today"
   ```
3. Initialize Supabase in the project:
   ```powershell
   npm exec -- supabase init
   ```
   This creates a `supabase` folder. You can ignore it for now.
4. Link to your Supabase project (replace `YOUR_PROJECT_REF` with the ID from Part 4):
   ```powershell
   npm exec -- supabase link --project-ref YOUR_PROJECT_REF
   ```
   Example: `supabase link --project-ref abcdefghijklmnop`
5. When asked for the database password, enter the password you set when creating the Supabase project.
   - If you don’t remember it: Supabase Dashboard → Project Settings → Database → Reset database password.
6. When it says "Linked successfully," you're done.

---

## Part 6: Verify Git Is Working

1. In PowerShell, in your project folder:
   ```powershell
   cd "C:\Users\ajayj\OneDrive\Desktop\Did you live a good life today"
   git status
   ```
2. If you see "On branch main" and no errors, Git is fine.
3. Test push (optional):
   ```powershell
   git push
   ```
   If it pushes without asking for a password, you're set. If it asks for login, see Part 7.

---

## Part 7: Git Credentials (only if push asks for login)

If `git push` asks for username/password:

**Option A — GitHub Desktop (easiest):**
1. Install GitHub Desktop: https://desktop.github.com
2. Sign in with your GitHub account.
3. Git will use that login for pushes.

**Option B — Personal Access Token:**
1. Go to https://github.com → Settings → Developer settings → Personal access tokens.
2. Generate a new token (classic).
3. Give it `repo` scope.
4. Copy the token.
5. When Git asks for a password, paste the token (not your GitHub password).

---

## Part 8: Add Supabase Folder to Git (optional)

The `supabase` folder created by `supabase init` contains config. You can commit it so it's backed up:

```powershell
cd "C:\Users\ajayj\OneDrive\Desktop\Did you live a good life today"
git add supabase/
git commit -m "Add Supabase config"
git push
```

---

## What You Can Do After This

| You set up | Assistant can do |
|------------|-------------------|
| Supabase CLI + link | Create and apply database migrations (no more copy-pasting SQL) |
| Git working | Push code changes to GitHub for you |
| Both | Handle most code and database changes with minimal manual steps |

---

## Quick Reference — Commands You Might Need

| Task | Command |
|------|---------|
| Go to project folder | `cd "C:\Users\ajayj\OneDrive\Desktop\Did you live a good life today"` |
| Check Supabase link | `npm exec -- supabase status` |
| Apply new migrations (after assistant creates them) | `npm exec -- supabase db push` |

---

## If Something Fails

- **"supabase: command not found"** — Use `npm exec -- supabase ...` (this guide installs Supabase CLI into the project).
- **"Invalid project ref"** — Double-check the Reference ID from Part 4. No spaces, no extra characters.
- **Database password wrong** — Reset it in Supabase Dashboard → Settings → Database.
- **Git push rejected** — Make sure you're logged into GitHub (Desktop or token).

---

Once you finish Parts 1–5 (and 6–7 if needed), tell the assistant "Setup complete" and they can start using these tools for you.
