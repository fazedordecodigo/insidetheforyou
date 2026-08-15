# insidetheforyou

An interactive website that explains how the X "For You" feed decides what you see. All weights and behaviors come from the open-source [X algorithm repository](https://github.com/xai-org/x-algorithm) (August 2026 snapshot).

Built with [Devin](https://devin.ai).

## What the site shows

The site has five interactive sections and a slideshow:

- **Scoring lab**. Tap the actions that you take on a post and watch its score move. The section uses the real production weights.
- **Annotated demo feed**. A mock feed where each post shows the reasons for its rank.
- **Action effects**. A real post from X with the standard action buttons. Hover over an action to see its effect on your future feed.
- **Weight playground**. Sliders for the real ranking weights. Drag them and watch six posts re-rank in real time.
- **Deep dive**. A slideshow that covers the full pipeline: candidate sources, user signals, predictions, weights, adjustments, and the visibility gate.

## Run the project locally

1. Make sure that Node.js 18 or later is installed.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the URL that Vite prints, usually `http://localhost:5173`.

## Build for production

Run `npm run build`. The output goes to the `dist/` directory. The build runs the TypeScript compiler first, then Vite.

## Refresh the example posts

The "Action effects" section cycles through real posts from X. The posts live in `src/data/tweets.json`. A script fetches them at build time with the xAI API, so no API key ships to the browser.

To fetch a new set of posts:

1. Create a `.env` file in the project root.
2. Add one line: `XAI_API_KEY=your-key-here`. You can get a key at [console.x.ai](https://console.x.ai).
3. Run `npm run fetch:tweets`.

The script asks Grok to search X for popular programming posts with at least 100 likes. It validates the results and writes them to `src/data/tweets.json`. Profile pictures load from [unavatar.io](https://unavatar.io) at run time.

Note: do not commit the `.env` file. The `.gitignore` file already excludes it.

## Languages

The site ships in English at `/` and in Brazilian Portuguese at `/pt-br`. There is no i18n library: the
copy lives in typed dictionaries under `src/i18n/`, and `en` is the source of truth for the shape.
`src/i18n/en.ts` exports `type Copy = typeof en`, so every other dictionary is declared as `Copy` and
`npm run build` fails on a missing or extra key.

How the active language is resolved, in order:

1. The path, when it names a language (`/pt-br`). A link to `/pt-br` always opens in Portuguese, whatever
   the visitor's browser or stored preference says. The root path names no language, so `/` falls through
   to the steps below and can render Portuguese.
2. The visitor's explicit choice, stored in `localStorage` under `insidetheforyou.locale`.
3. `navigator.languages`. A visitor whose browser prefers Portuguese lands on `/pt-br`.

The URL always ends up naming the rendered language: the first resolution rewrites it with
`replaceState` (no reload, no extra history entry) and the language switcher uses `pushState`, so the
back button walks through the languages you actually visited.

### Add a language

1. Create `src/i18n/<locale>.ts` that copies the structure of `en.ts` and declares the type:
   `export const es: Copy = { ... }`. The compiler lists every key you still owe.
2. Register the locale in `shared/locales.ts`: add the tag to `LOCALES`, the path to `LOCALE_PATHS`
   (e.g. `es: '/es'`), and the Open Graph tag to `LOCALE_OG_TAGS`. This module holds no DOM code, so it
   is the one the app, the Worker and the Vite build all import.
3. Register the locale in `src/i18n/locale.ts` and `src/i18n/dictionaries.ts`: the short button label in
   `LOCALE_LABELS`, the language's own name in `LOCALE_NAMES`, the language prefix in `detectLocale`, and
   the dictionary in `DICTIONARIES`.
4. Register the locale in `shared/name-prompt.ts`, so `POST /api/name` asks Grok for an algorithm name in
   that language: add the language name Grok is told to write in to `LANGUAGES` (e.g. `es: 'Spanish'`),
   and a table of signal labels to `LABELS`. That module builds the whole xAI
   request and is imported by both the production Worker (`worker/index.ts`) and the dev-server
   emulator (`vite.config.ts`), so there is a single place to edit and `npm run dev` matches production.

Nothing else needs a change: the switcher, the `hreflang` alternates, the metadata, the number
formatting and the build all iterate over `LOCALES`.

### What a crawler sees

A link unfurler does not run JavaScript, so each language needs its metadata in the HTML it is served.
The `locale-html` plugin in `vite.config.ts` renders the `<head>` block from the dictionaries at build
time — title, description, `canonical`, `og:url`, `og:image`, `hreflang` — and writes one file per
non-default language (`dist/pt-br.html`), so `/pt-br` is served with `lang="pt-BR"` and Portuguese tags
before the app boots. `src/i18n/metadata.ts` then rewrites the same tags on every in-page switch.

Those URLs are absolute and cannot be derived from the request, so the deployed origin is a constant:
`SITE_URL` in `shared/locales.ts`. The card is `public/og-card.png` (1200×630), generated from
`scripts/og-card.html`; `npm run og:card` takes the screenshot (headless Chrome, `CHROME_PATH` if the
binary is somewhere unusual), so editing the card's markup and re-running it keeps the committed PNG
in step with its source.

`/pt-br` is a file rather than `pt-br/index.html` because `wrangler.jsonc` sets
`html_handling: auto-trailing-slash`, which would redirect `/pt-br` to `/pt-br/` if it were a folder.
Under `wrangler dev`, `/pt-br` answers 200 with `lang="pt-BR"` while `/pt-br.html` and `/pt-br/` answer
307 to `/pt-br`; any path with no file at all still falls through to
`not_found_handling: single-page-application`, which serves the English `index.html`.

### What stays untranslated on purpose

- The example posts in `src/data/tweets.json`. They are real posts from X, in their author's language.
- The X action labels use the official label of the X app in each language, so a reader recognizes the
  button they tap every day.
- Internal system names stay in English (`Home Mixer`, `Thunder`, `Phoenix`, `SimClusters`), and jargon
  with no official label (`ranker`, `transformer`, `dwell`) is glossed on first use instead of translated.
- Numbers are never formatted by hand. `useFormat()` from `src/i18n/format.ts` formats them for the
  active locale, so Portuguese gets `+0,5` and English gets `+0.5`.

## Project structure

| Path | Content |
|---|---|
| `src/App.tsx` | Page layout, navigation, hero, deep-dive slideshow, and footer |
| `src/i18n/en.ts` | The English dictionary, and the `Copy` type every language follows |
| `src/i18n/pt-BR.ts` | The Brazilian Portuguese dictionary |
| `shared/locales.ts` | Locale list, paths and SEO origin, free of DOM code so the build can import it |
| `shared/name-prompt.ts` | The whole `/api/name` request, shared by the Worker and the dev emulator |
| `src/i18n/locale.ts` | Labels, storage, and browser detection, on top of `shared/locales.ts` |
| `src/i18n/dictionaries.ts` | The `DICTIONARIES` map, imported by the app and by the build |
| `src/i18n/head.ts` | The static per-language `<head>` the build writes into each HTML file |
| `src/i18n/LocaleProvider.tsx` | The provider with `useLocale()` and `useCopy()`, plus history handling |
| `src/i18n/format.ts` | `useFormat()`, locale-aware number formatting |
| `src/i18n/metadata.ts` | Per-language `<html lang>`, title, description, Open Graph, canonical, hreflang |
| `src/components/LanguageSwitcher.tsx` | The language switcher in the navigation |
| `src/components/Reveal.tsx` | Shared section and scroll-reveal components |
| `src/sections/ScoreLab.tsx` | The scoring lab with the aura buttons |
| `src/sections/DemoFeed.tsx` | The annotated demo feed and the action-effects post |
| `src/sections/WeightLab.tsx` | The weight playground with sliders and presets |
| `src/sections/Weights.tsx` | The weight bar chart |
| `src/sections/Adjustments.tsx` | The score adjustment cards |
| `src/data/tweets.json` | The fetched example posts |
| `scripts/fetch-tweets.mjs` | The post-fetch script |

## Tech stack

- [React](https://react.dev) with TypeScript
- [Vite](https://vite.dev) for development and builds
- [Framer Motion](https://motion.dev) for animations
- [Oxlint](https://oxc.rs) for linting

## Data sources

The weights come from `home-mixer/params/param.rs` in the X algorithm repository. The scoring formula comes from `home-mixer/scorers/ranking_scorer.rs`. The values change over time as X runs experiments, so treat them as a snapshot, not a specification.

This project is not affiliated with X or xAI.
