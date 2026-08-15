import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_PATHS,
  isLocale,
  type Locale,
} from '../../shared/locales.ts'

// The locale list, paths and SEO origin are shared with the Worker and the build,
// and re-exported so the app has a single import for everything locale-related.
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_OG_TAGS,
  LOCALE_PATHS,
  SITE_URL,
  absoluteUrlForLocale,
  pathForLocale,
  type Locale,
} from '../../shared/locales.ts'
export { DICTIONARIES } from './dictionaries.ts'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  'pt-BR': 'PT',
}

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
}

const STORAGE_KEY = 'insidetheforyou.locale'

// The `.html` suffix is dropped because the build writes each locale to a file
// (`pt-br.html`): production redirects that URL to the extensionless one, but
// `vite preview` serves it as is, and both must resolve to the same locale.
function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\.html$/i, '').replace(/\/+$/, '').toLowerCase()
  return trimmed === '' ? '/' : trimmed
}

// A locale is explicit in the URL only when the path names it. The root path is
// ambiguous, so it defers to the stored preference and then to the browser.
export function localeFromPath(pathname: string): Locale | null {
  const path = normalize(pathname)
  const match = LOCALES.find((locale) => locale !== DEFAULT_LOCALE && LOCALE_PATHS[locale] === path)
  return match ?? null
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // A blocked storage must not break language switching.
  }
}

export function detectLocale(): Locale {
  const languages = window.navigator.languages ?? [window.navigator.language]
  for (const language of languages) {
    if (!language) continue
    const tag = language.toLowerCase()
    if (tag === 'pt' || tag.startsWith('pt-')) return 'pt-BR'
    if (tag === 'en' || tag.startsWith('en-')) return 'en'
  }
  return DEFAULT_LOCALE
}

// Runs once before the app renders: the URL wins when it names a locale,
// otherwise the stored choice, otherwise the browser's languages.
export function resolveInitialLocale(): Locale {
  return localeFromPath(window.location.pathname) ?? readStoredLocale() ?? detectLocale()
}
