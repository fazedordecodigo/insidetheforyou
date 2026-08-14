import { en, type Copy } from './en'
import { ptBR } from './pt-BR'

export const LOCALES = ['en', 'pt-BR'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const DICTIONARIES: Record<Locale, Copy> = {
  en,
  'pt-BR': ptBR,
}

// The path that serves each locale. The default locale lives at the root.
export const LOCALE_PATHS: Record<Locale, string> = {
  en: '/',
  'pt-BR': '/pt-br',
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  'pt-BR': 'PT',
}

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
}

// Open Graph wants an underscore territory tag, not the BCP 47 one.
export const LOCALE_OG_TAGS: Record<Locale, string> = {
  en: 'en_US',
  'pt-BR': 'pt_BR',
}

const STORAGE_KEY = 'insidetheforyou.locale'

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '').toLowerCase()
  return trimmed === '' ? '/' : trimmed
}

// A locale is explicit in the URL only when the path names it. The root path is
// ambiguous, so it defers to the stored preference and then to the browser.
export function localeFromPath(pathname: string): Locale | null {
  const path = normalize(pathname)
  const match = LOCALES.find((locale) => locale !== DEFAULT_LOCALE && LOCALE_PATHS[locale] === path)
  return match ?? null
}

export function pathForLocale(locale: Locale): string {
  return LOCALE_PATHS[locale]
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
