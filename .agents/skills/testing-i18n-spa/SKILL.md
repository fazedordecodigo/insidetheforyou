---
name: testing-i18n-spa
description: End-to-end testing recipes for this Vite/React SPA (insidetheforyou) — running dev/preview servers, exercising the EN|PT locale switch, verifying per-locale <head> metadata, checking number formatting, and stubbing the `/api/name` (Ask Grok) endpoint from outside the repo when `XAI_API_KEY` is missing.
---

# Testing insidetheforyou (i18n SPA)

## Servers
- Dev: `npm install && npm run dev` → http://localhost:5173. The `/api/name` emulator only exists here (`vite.config.ts` `configureServer`, dev only) and answers **500 without `XAI_API_KEY`**.
- Production check: `npm run build && npm run preview` → http://localhost:4173. A `200` on `/pt-br` there proves nothing about routing: Vite's static server does not complete extensions, so the request lands on the SPA fallback (`index.html`, English head). To exercise the real mapping use `npx wrangler dev --port 8788`, which serves `dist` the way production does: `/pt-br` → 200 with `lang="pt-BR"` from `dist/pt-br.html`, `/pt-br.html` and `/pt-br/` → 307 to `/pt-br`, and any unknown path → 200 with the English `index.html`.

## Locale surface
- EN at `/`, pt-BR at `/pt-br`; toggle `EN | PT` in the top nav (no page reload — assert with a `window.__marker` sentinel).
- Preference persists in `localStorage['insidetheforyou.locale']` and beats `navigator.languages`. To test browser-language auto-redirect, launch a second Chrome with a throwaway profile and `--lang=pt-BR --accept-lang=pt-BR,pt` (overriding languages in the already-running automated Chrome is unreliable).
- Number formatting is locale-driven (`useFormat()`): pt-BR uses comma decimals. Trap: raw `toFixed()` bypasses it — always compare the **same number in both locales**.
- Per-locale `<head>` is written by `src/i18n/metadata.ts`; read values from the DevTools console (they are invisible on screen) and check counts stay at 1 plus exactly 3 `link[rel=alternate]` after repeated switches.

## Stubbing `/api/name` ("Ask Grok") without a key
`XAI_API_KEY` is usually absent. Do **not** patch `vite.config.ts` or app source. Instead attach to the already-running Chrome over CDP from **outside the repo**:

```bash
mkdir -p /home/ubuntu/name-stub && cd /home/ubuntu/name-stub
npm i playwright-core          # Playwright is not preinstalled in the environment
```
`stub.mjs`: `chromium.connectOverCDP('http://localhost:29229')`, iterate existing + new pages, `page.route('**/api/name', ...)` and fulfill JSON. Return a **different name per call** (`Ranker do Caos 1`, `2`, …) and append `locale` + `weights` from the request body to `calls.log` — that log is the only reliable way to distinguish a cached name from a fresh call. Keep the process alive while driving the UI with native clicks/drags; routes survive SPA navigation and locale switches.

## WeightLab (`#playground`) name box gotchas
- The `Ask Grok` / `Perguntar ao Grok` button renders only when weights are **neither the defaults nor one of the 3 presets** and the current `locale + weights` combo has no name yet. Default names: EN `Just Regular X`, pt-BR `X Comum Mesmo`.
- Names are cached per `${locale}:${JSON.stringify(weights)}`; the "last name" fallback only applies to custom configs in the same locale. So after naming in pt-BR, an EN custom config shows the EN default until you name something in EN — that is expected, not a bug.
- To return to a previously named configuration **exactly**, click the range input once (or after a drag it keeps focus) and use `Left`/`Right` arrow keys — they move in exact `step` increments, unlike pixel drags. Slider steps are in `WEIGHT_DEFS` (`src/sections/WeightLab.tsx`).
- The component has a client-side cooldown after 3 calls (`wait Ns` / `espere Ns` on the button) — plan scenarios so you do not need 4+ calls back-to-back.

## Noise to ignore
`404` errors from `pbs.twimg.com/profile_images/...` are external X avatars. Filter the console with `-404` to see whether any real app error exists.

## Devin Secrets Needed
- `XAI_API_KEY` — only needed to exercise the real `/api/name`; otherwise use the CDP stub above.
