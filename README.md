# Escape the Brokerage — betterhomes

An interactive recruitment experience. The player thinks they're escaping a room.
By the end they realise they were escaping the *wrong brokerage*. Each puzzle solved
restores a betterhomes advantage, and the room itself transforms from a dead, cold
office into a warm, premium environment overlooking Dubai.

**Platform line:** TRUST BETTER. GET BETTER.

---

## What's in here

| File | Purpose |
|------|---------|
| `index.html` | The entire experience — self-contained, no dependencies, no build step. Open it directly in any browser. |
| `api/leaderboard.js` | Optional global leaderboard (zero-dependency Vercel serverless function). |
| `vercel.json` / `package.json` | Deploy config. No build required. |

The game runs perfectly as a **single file** (`index.html`). Everything below is only
needed if you want it hosted on a URL with a *global* leaderboard.

---

## Deploy to Vercel (≈2 minutes)

**Option A — drag & drop (fastest):**
1. Go to <https://vercel.com/new>.
2. Drag this whole folder onto the page.
3. Click **Deploy**. You get a live `…vercel.app` link to share.

**Option B — via GitHub (recommended for a permanent project):**
```bash
# from inside this folder
git init && git add . && git commit -m "Escape the Brokerage"
git branch -M main
git remote add origin https://github.com/<your-account>/escape-the-brokerage.git
git push -u origin main
```
Then on Vercel: **New Project → Import** this repo → **Deploy**.

The site works immediately. The leaderboard uses each visitor's own device until
you turn on the global board ↓.

---

## Turn on the GLOBAL leaderboard (3 clicks, free)

The leaderboard works on-device out of the box. To make it shared across everyone:

1. In your Vercel project → **Storage** → **Create Database** → **KV** (Upstash) → connect it to this project.
2. Vercel automatically adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables.
3. **Redeploy** (Deployments → ⋯ → Redeploy).

That's it — `api/leaderboard.js` detects the store and the global board goes live.
No code change. If the store isn't connected, the game silently falls back to the
per-device board, so nothing ever breaks.

---

## Things you'll likely want to change

- **CTA link** — the final "Continue Your Journey →" button in `index.html`
  (search for `id="ctaBtn"`) currently points to `https://www.bhomes.com`.
  Swap it for the real careers/apply URL.
- **Brand** — search `--brand` and `--brand-font` in `index.html` to drop in the
  official betterhomes colour and font (add the font as a `@font-face` data-URI to
  keep the file self-contained).
- **Scoring** — search `const POINTS` in `index.html` to tune the point values.
