---
name: testing-i18n-spa
description: End-to-end browser testing of the insidetheforyou React/Vite SPA, with recipes for locale/path routing, browser-language detection, narrow-viewport checks and interactive-section regression. Use when verifying i18n, routing, or responsive behaviour in this repo.
---

# Testing the insidetheforyou SPA (i18n / routing / responsive)

## Prerequisite: the i18n layer must be in the working tree
Everything below describes the bilingual site (`src/i18n/`, `LocaleProvider`, the EN|PT toggle, `/pt-br`,
the `hreflang` tags). That layer arrives with the i18n stack, whose PRs are still open, so on `main` it
does not exist yet — `src/` has only `App.tsx`, `main.tsx`, `components/` and `sections/`, and
`index.html` has no `canonical`/`hreflang`, which makes the recipes below unexecutable there. Check that
`src/i18n/locale.ts` exists before starting; if it does not, test the branch carrying the i18n slice.

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
- `POST /api/name` (the "Ask Grok" button in the Weight Playground) is served in production by the
  Cloudflare Worker, and under `npm run dev` it is emulated by the `devNameApi` plugin in
  `vite.config.ts`, which needs `XAI_API_KEY` (env var or `.env`) — so with the key present the button
  works on the dev server, and a failure there is a real finding. Under `npm run preview` the route does
  not exist at all (the plugin is dev-server only), so a failing request there is expected, not a bug.
  Non-POST requests to `/api/name` answer 405 by design (the Worker does the same), so a 405 in the
  console after poking the URL by hand is not a finding.

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
pt-BR dictionary, e.g. `diversityMarks: ['×1,0','×0,5','×0,25','×0,25']` — the repeated `×0,25` is not
a typo, it is the floor: the same author's posts halve to `×0,25` and stay there; the dotted
`['×1.0','×0.5','×0.25','×0.25']` you see hardcoded in `Adjustments.tsx` on pre-i18n `main` is the same
list before the extraction).
Known gap to re-check on every slice: any component that formats numbers with raw `toFixed()` instead
of `useFormat()` will keep a **dot** in pt-BR. Start from `git grep -n 'toFixed(' src/` and verify every
hit renders through `num`/`signed`. Pre-i18n `main` has four raw call sites, and they are exactly the
surfaces to eyeball in **both** locales once the i18n slice is applied (checking only pt-BR would miss a
formatter pinned to a fixed locale):

| Call site on `main`                | Surface                                | pt-BR must show |
| ---------------------------------- | -------------------------------------- | --------------- |
| `src/App.tsx` `(p * 100).toFixed(1)` | Deep Dive "Predictions" / "Previsões" | `31,0%`         |
| `src/sections/DemoFeed.tsx` `p.score.toFixed(1)` | annotated feed scores     | `+2,6`          |
| `src/sections/ScoreLab.tsx` `score.toFixed(2)` | Score Lab post score        | `+2,59`         |
| `src/sections/WeightLab.tsx` `p.score.toFixed(2)` | ranked list scores       | `+2,59`         |

One surviving `toFixed` is fine: `signed(Number(score.toFixed(2)))` in Score Lab only rounds before
`signed()` localises. A `toFixed` result rendered directly is the bug.

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
`link[rel=canonical]` and three `link[rel=alternate][hreflang]` (`en`, `pt-BR`, `x-default`).
`index.html` ships an English baseline of `title`/`description`/`og:*` for non-JS crawlers, which the
writer **reuses** (it queries before creating), but it ships **no** `canonical` and **no** `alternate`.
The alternates are a special case: `applyMetadata` deletes every `link[data-locale-alternate]` and
recreates the three, marked, on each call — so all three carrying the marker is the invariant to assert,
and an unmarked `link[rel=alternate]` in the `<head>` means someone else put it there. That reading of
the writer comes from the SEO branch while it was still unmerged, so re-read `metadata.ts` before
trusting it — if the implementation landed differently, fix this section instead of the app.
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
      canonical: dup('link[rel=canonical]'),
      alternate: dup('link[rel=alternate][data-locale-alternate]'),
      alternateAny: dup('link[rel=alternate]'),
      titleTag: document.head.querySelectorAll('title').length },
  }
}
window.show = () => console.log(JSON.stringify(window.snap(), null, 1))
```

Checklist per slice: `/` → `en` / `en_US` / canonical `<origin>/`; `/pt-br` → `pt-BR` / `pt_BR` /
canonical `<origin>/pt-br`; the same after switching with the toggle (no reload) and after Back/Forward;
and after 4–5 switches the counters must read `ogTitle: 1`, `desc: 1`, `titleTag: 1`, `canonical: 1`,
`alternate: 3` and `alternateAny: >= 3` — anything higher on the singletons means the writer is
appending instead of reusing. `alternate` counts only the writer's own tags
(`[data-locale-alternate]`), so an unrelated `link[rel=alternate]` — an RSS feed, say — moves only
`alternateAny`, which is why it has no exact expected value; a gap between the two numbers is
information, not a failure. `alternate: 0` with `alternateAny: 3` is a real failure, though: it means
the writer stopped marking its tags, and the marker is what it uses to clean up stale ones between
locale switches.
Absolute URLs derive from `window.location.origin`, so in dev they read `http://localhost:5173/...` —
that is expected, not a bug.

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
- `XAI_API_KEY` — only if you need `POST /api/name` (dev server or Worker); not required for UI testing.
