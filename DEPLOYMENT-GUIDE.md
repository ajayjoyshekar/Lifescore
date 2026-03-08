# LifeScore — Simple Deployment Guide for Beginners

This guide explains what we did and what you need to do next. No technical knowledge required!

---

## ✅ What Is Already Done (by the assistant)

### 1. Your code is saved in Git
Think of Git like "Save" for your whole project. Every change is recorded so you can go back or share it.

### 2. Your code is on GitHub
Your LifeScore app is now on: **https://github.com/ajayjoyshekar/Lifescore**

Anyone with the link can see your code. You can open that link in your browser to confirm.

### 3. Git knows who you are
Your Git is set up with:
- Name: `ajayjoyshekar`
- Email: `ajayjoyshekar@users.noreply.github.com` (a private GitHub email)

You can change this later if you want.

---

## 🚀 What You Need To Do Next: Put Your App Online (Vercel)

Right now your app works only on your computer. To let other people use it on the internet, you need to "deploy" it. We use a free service called **Vercel** for this.

---

## Step-by-Step: Deploy on Vercel

### Step 1 — Open Vercel
1. Open your web browser (Chrome, Edge, etc.).
2. Go to: **https://vercel.com**
3. Click **"Sign Up"** or **"Log In"**.
4. Choose **"Continue with GitHub"** (the easiest option).
5. Sign in with your GitHub account (ajayjoyshekar).
6. Allow Vercel to access your GitHub when it asks.

---

### Step 2 — Import Your Project
1. On Vercel’s main page, click **"Add New..."** (top right).
2. Click **"Project"**.
3. You should see a list of your GitHub repos.
4. Find **"Lifescore"** (or "ajayjoyshekar/Lifescore").
5. Click **"Import"** next to it.

---

### Step 3 — Add Your Supabase Keys (important)
On the import screen, before clicking **Deploy**:

1. Scroll down to the section **"Environment Variables"** or **"Configure"**.
2. You need to add 2 pieces of information. These are in your file `.env.local` on your computer:
   - Open the project folder: `Did you live a good life today`
   - Open the file `.env.local` (use Notepad or Cursor)
   - You will see 2 lines that look like:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://something.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
     ```

3. Back on Vercel:
   - **Variable 1**
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
     - Value: Copy the URL from your `.env.local` (everything after the `=`)
   - **Variable 2**
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Value: Copy the long key from your `.env.local`

4. Make sure both variables are set for **Production** (check the box).
5. Click **"Deploy"** (or "Continue" then "Deploy").

---

### Step 4 — Wait for the Build
1. Vercel will build your app. This usually takes 1–2 minutes.
2. When you see **"Congratulations"** or **"Your project has been deployed"**, you’re done.
3. Click **"Visit"** or the link shown. That is your app’s live URL (for example: `https://lifescore-abc123.vercel.app`).

---

### Step 5 — Tell Supabase About Your New Website
Supabase needs to know your Vercel URL before login works on the live site.

1. Open **https://supabase.com** and sign in.
2. Open your LifeScore project.
3. Go to **Authentication** (left menu) → **URL Configuration**.
4. Find **"Site URL"**.
5. Paste your Vercel URL (the link from Step 4), for example: `https://lifescore-abc123.vercel.app`
6. Find **"Redirect URLs"**.
7. Add this URL (use your real Vercel URL):
   ```
   https://lifescore-abc123.vercel.app/**
   ```
   Replace `lifescore-abc123` with your actual Vercel subdomain.
8. Click **Save**.

---

## What You Have Now

- **Code on GitHub** — https://github.com/ajayjoyshekar/Lifescore  
- **Live app on Vercel** — Your own URL (from Step 4)  
- **Database and auth on Supabase** — Already configured

---

## If Something Goes Wrong

- **Vercel build fails** — Make sure both environment variables are set correctly and try again.
- **Login doesn’t work on the live site** — Check that your Vercel URL is added in Supabase (Step 5).
- **"Repo is empty" error** — Your code is now on GitHub, so this should be fixed. Try importing the project again on Vercel.

---

## Words You Might Hear

| Word    | Simple meaning                                   |
|---------|---------------------------------------------------|
| Deploy  | Put your app on the internet so others can use it |
| Repo    | Short for "repository" — your project on GitHub  |
| Branch  | A version of your project (we use "main")        |
| Commit  | A saved snapshot of your project in Git           |
| Push    | Send your commits from your computer to GitHub    |

---

You can always come back to this guide. If a step is unclear, ask for help with that step.
