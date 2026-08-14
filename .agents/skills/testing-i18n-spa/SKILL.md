---
name: testing-i18n-spa
description: End-to-end browser testing of the insidetheforyou React/Vite SPA, with recipes for locale/path routing, browser-language detection, narrow-viewport checks and interactive-section regression. Use when verifying i18n, routing, or responsive behaviour in this repo.
---

# Testing the insidetheforyou SPA (i18n / routing / responsive)

## Running the app
- `npm install` then `npm run dev` → Vite on `http://localhost:5173`.
- Production-build verification: `npm run build` (tsc + vite build) then `npm run preview` → Vite serves
  `dist/` on `http://localhost:4173`. The preview server **does** answer `/pt-br` with HTTP 200
  (check with `curl -o /dev/null -w '%{http_code}' http://localhost:4173/pt-br`), so locale URLs can be
  loaded directly. If a future config change breaks that (SPA fallback for the deployed site is the
  Cloudflare Worker's job, not the preview server's), fall back to loading `/` and using the EN|PT
  toggle, and report the missing fallback as a finding.
- Prefer running the final both-languages check against the preview build at least once: everything else
  (dev server) does not exercise minified/chunked production output.
- `POST /api/name` (the "Ask Grok" button in the Weight Playground) is a Cloudflare Worker route and
  does **not** exist under `npm run dev`. A failing request there is expected locally, not a bug —
  it needs `wrangler dev` plus `XAI_API_KEY`.

## Locale model (as of the first i18n slice)
- `/` = English, `/pt-br` = Portuguese. Preference persisted in `localStorage` under
  `insidetheforyou.locale`; fallback order is stored preference → `navigator.languages`.
- Switching locale uses `pushState`; first-visit resolution uses `replaceState` (no reload).
- To assert "no reload happened", set a sentinel in the console (`window.__marker = 1`) before
  clicking the switcher and re-read it afterwards.
- Reset state between cases with `localStorage.clear()` in the console, then navigate to `/`.
- Known risk area: `popstate`. Browser Back from `/pt-br` to `/` may leave the UI in the previous
  locale if the persisted preference is re-applied instead of the history path. The handler should
  resolve strictly from `window.location.pathname` (falling back to the default locale). Always test
  Back **and** Forward explicitly, and do two cycles to catch state drift.
- Expected/accepted asymmetry: after Back to `/` (English), a **reload** of `/` returns to the stored
  preference (Portuguese) and rewrites to `/pt-br`, because on initial load the stored preference wins
  the ambiguous path. That is by design — do not report it as a bug.

## Testing browser-language detection (`navigator.languages`)
Overriding `navigator.languages` from the console does not work, because locale resolution runs at
module init and the override is lost across reloads. Launch a **second, throwaway Chrome profile**
with the language flags instead, then drive it with screenshots/clicks:

```bash
rm -rf /tmp/chrome-pt-profile
nohup /opt/.devin/chrome/chrome/linux-*/chrome-linux64/chrome \
  --no-sandbox --disable-gpu --lang=pt-BR --accept-lang=pt-BR,pt \
  --user-data-dir=/tmp/chrome-pt-profile --no-first-run \
  --window-size=1000,900 --window-position=20,20 \
  http://localhost:5173/ >/tmp/chrome-pt.log 2>&1 &
```

This profile starts with empty `localStorage`, so it exercises the detection path. It is a separate
process from the automated Chrome, so the DOM/console tools won't see it — verify visually and clean
up with `pkill -f chrome-pt-profile`.

## Narrow-viewport (~375px) checks
`wmctrl -e` cannot shrink Chrome below roughly 500px wide, and `ctrl+plus` zoom shortcuts are often
swallowed. Use DevTools device mode instead:
1. `F12`, then `ctrl+shift+m` to enable the device toolbar.
2. Type the target width (e.g. `375`) into the Dimensions width field and press Enter.
3. Keep DevTools **open** — closing it drops the emulation and restores the real viewport.
4. Confirm no horizontal overflow from the console:
   `document.documentElement.scrollWidth === window.innerWidth`.

## Locale-aware number formatting
`src/i18n/format.ts` (`useFormat()` → `num`/`signed`) wraps `toLocaleString(locale)`, so in pt-BR every
number it renders must show a **comma** decimal separator (`+0,5`, `-58,8`, `+2,59`, `×0,75`).
Check visually (zoom) in: Score Lab pills + post score, annotated feed annotations, Weight Playground
sliders + ranked scores, and the Adjustments slide marks (those marks live as literal strings in the
dictionaries, e.g. `diversityMarks: ['×1,0','×0,5','×0,25','×0,25']`).
Known gap to re-check on every slice: any component that formats numbers with raw `toFixed()` instead
of `useFormat()` will keep a **dot** in pt-BR. Past instance (already fixed with
`num(p * 100, { digits: 1 })`): the Deep Dive "Predictions" / "Previsões" slide in `src/App.tsx` used to
render `31.0%` in pt-BR. Grep for `toFixed(` / `%` templates in `src/App.tsx` and `src/sections/*` and
eyeball those surfaces in **both** locales — checking only pt-BR would miss a formatter pinned to a
fixed locale.

## Grok name cache and locale
The Weight Playground default algorithm name comes from `copy.weightLab.defaultName` (EN
`Just Regular X` / pt-BR `X Comum Mesmo`). The generated-name cache key must include the locale, or a
name generated in one language leaks into the other. Test by switching locale with no name requested:
the default name must switch and the "Ask Grok" / "Perguntar ao Grok" button must reappear.

## History hygiene
Clicking the **already active** locale must not `pushState` (no duplicate entries). Verify by reading
`history.length` before/after 3 clicks and confirming a single Back leaves the page.

## Per-locale `<head>` metadata (SEO slice)
`src/i18n/metadata.ts` (`applyMetadata(locale)`, called from a `useEffect` in `LocaleProvider`) rewrites
`documentElement.lang`, `document.title`, `meta[name=description]`, the `og:*` / `twitter:*` tags,
`link[rel=canonical]` and three `link[rel=alternate][hreflang]` (`en`, `pt-BR`, `x-default`, all tagged
with `data-locale-alternate`). `index.html` ships an English baseline for non-JS crawlers.
None of this is visible on screen, so measure it from the DevTools console. Define a snapshot helper
once per page load (it is lost on reload) and call it after each navigation/switch:

```js
window.snap = () => {
  const g = (s, a='content') => document.head.querySelector(s)?.[a] ?? null
  const dup = k => document.head.querySelectorAll(k).length
  return {
    lang: document.documentElement.lang, title: document.title, url: location.href,
    description: g('meta[name=description]'),
    ogLocale: g('meta[property="og:locale"]'), ogUrl: g('meta[property="og:url"]'),
    canonical: g('link[rel=canonical]', 'href'),
    alternates: [...document.head.querySelectorAll('link[rel=alternate]')]
      .map(l => `${l.hreflang} -> ${l.href} [marked=${l.hasAttribute('data-locale-alternate')}]`),
    counts: { ogTitle: dup('meta[property="og:title"]'), desc: dup('meta[name=description]'),
      canonical: dup('link[rel=canonical]'), alternate: dup('link[rel=alternate]'),
      titleTag: document.head.querySelectorAll('title').length },
  }
}
window.show = () => console.log(JSON.stringify(window.snap(), null, 1))
```

Checklist per slice: `/` → `en` / `en_US` / canonical `<origin>/`; `/pt-br` → `pt-BR` / `pt_BR` /
canonical `<origin>/pt-br`; the same after switching with the toggle (no reload) and after Back/Forward;
and after 4–5 switches every `counts` value must stay `1` with `alternate: 3` (the writer must reuse the
static `index.html` tags instead of appending duplicates). Absolute URLs derive from
`window.location.origin`, so in dev they read `http://localhost:5173/...` — that is expected, not a bug.

Tooling notes: typing in the console only works while the console prompt has focus — after clicking a
page element (e.g. the EN/PT toggle) click the prompt again before typing. DevTools device mode
persists across sessions; press `ctrl+shift+m` to leave 375px emulation before desktop-width runs.
Console noise from `pbs.twimg.com` avatar 404s is external content, not an app error.

## Persistence and detection precedence (needs real reloads)
`resolveInitialLocale()` = path locale → stored preference → `navigator.languages` → `en`. Cases worth
running with a **real F5** (switcher-only tests do not cover them):
1. Choose PT, F5 → still `/pt-br` in Portuguese; switch to EN, F5 → still `/` in English.
2. Empty `localStorage` + pt-BR browser profile loading `/` → `replaceState` redirect to `/pt-br`.
3. Empty `localStorage` + en-US browser (the automated Chrome reports `["en-US","en"]`) → stays on `/`.
4. pt-BR browser profile with `localStorage.setItem('insidetheforyou.locale','en')` + reload `/` → stays
   English, proving the stored preference beats `navigator.languages`.

## Classifying console noise quickly
The page loads real X avatars from `pbs.twimg.com`, which 404 in bulk and drown the console. To prove
there is no app-level JS error, type `-404` in the DevTools console filter box: if every message is
hidden ("N hidden", empty list), the only errors are those external 404s.

## Interactive-section regression checklist
Scroll through and touch each: Score Lab (action buttons change the post score), annotated feed,
Action Effects (Like on a "today" post re-ranks the "tomorrow" list), Weight Playground (drag a
slider → ranked list reorders and score labels change), Deep Dive slideshow (tab strip
"The pipeline" / "Two worlds" / ... swaps the slide).

## Devin Secrets Needed
- `XAI_API_KEY` — only if you need the `POST /api/name` Worker route; not required for UI testing.
