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
2. Register the locale in `src/i18n/locale.ts`: add the tag to `LOCALES`, the path to `LOCALE_PATHS`
   (e.g. `es: '/es'`), the short button label to `LOCALE_LABELS`, the language's own name to
   `LOCALE_NAMES`, the Open Graph tag to `LOCALE_OG_TAGS`, the dictionary to `DICTIONARIES`, and the
   language prefix to `detectLocale`.
3. Register the locale in `worker/index.ts`, so `POST /api/name` asks Grok for an algorithm name in that
   language: add the tag to `LOCALES`, the language name Grok is told to write in to `LANGUAGES` (e.g.
   `es: 'Spanish'`), and a new `LABELS_<LOCALE>` table of signal labels wired into the `LABELS` map.

Nothing else needs a change: the switcher, the `hreflang` alternates, the metadata, and the number
formatting all iterate over `LOCALES`. The new path also works with no server change, because
`wrangler.jsonc` sets `not_found_handling: single-page-application`.

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
| `src/i18n/locale.ts` | The locale list, paths, labels, storage, and browser detection |
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
