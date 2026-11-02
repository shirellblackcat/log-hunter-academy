<p align="center">
  <img src="public/cyber-neko.png" alt="Cyber-Neko" width="96" />
</p>

<h1 align="center">Log Hunter Academy</h1>

<p align="center">A SOC log-investigation game. Read the logs, flag the evidence, make the call.</p>

<p align="center"><sub>Built by SHIRELL | Tech Meets Purpose.</sub></p>

## How it plays

1. Pick a mission and read the log lines (use the filter box to search).
2. Flag the lines you think are evidence.
3. Ask for a hint if you're stuck (costs 5 XP each).
4. Submit a verdict: **Benign**, **Suspicious**, or **Confirmed incident**.
5. Get your score, rank (S/A/B/C) and a debrief explaining why.

**Scoring:** 50 points for the right verdict, up to 50 for evidence found. Each wrong flag costs 5 XP. Only your best score per mission counts toward XP, and every 100 XP is a level. Progress and theme are saved in your browser (localStorage).

## Run

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Install as an app

After `npm run build`, host the `dist` folder on any static host (GitHub Pages, Netlify, Cloudflare Pages). Open it in Chrome or Edge and use **Install** in the address bar. It works offline after the first visit. The service worker only runs in production builds, and it is cache-first, so bump `CACHE` in `public/sw.js` when you ship changes.

## Android (Google Play)

Live site: https://shirellblackcat.github.io/log-hunter-academy/

1. Go to [pwabuilder.com](https://www.pwabuilder.com), paste the live URL, and run the check.
2. Choose **Package for stores > Android** and generate the package. Keep the signing key it gives you safe and backed up.
3. Upload the `.aab` to the Play Console (one-time $25 developer account). Add the `assetlinks.json` PWABuilder provides to `public/.well-known/` so the app opens without a browser bar.

Pushing to `main` redeploys the site automatically via GitHub Actions.

## Project layout

- `src/data/missions.js` holds missions, logs, answer keys, hints and debriefs. Add a mission by adding an object here.
- `src/game/` holds the scoring rules and the progress hook.
- `src/components/` holds the UI.
- `public/` holds the brand assets (Cyber-Neko icon, Shirell signature wordmark).

## Adding a mission

Each log needs `id`, `time`, `source`, `event`, `message` and `evidence: true|false`. Evidence lines also take a `why` note shown in the debrief. Set `correctVerdict` to `benign`, `suspicious` or `incident`, and give 3 `hints`.
