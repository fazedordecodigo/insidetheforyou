// Locale routing and SEO facts, shared by three graphs that cannot share DOM code:
// the app (src/i18n), the Cloudflare Worker, and the Vite build that writes the
// static <head> of each locale's HTML file.

export const LOCALES = ['en', 'pt-BR'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

// Canonical and Open Graph URLs must name the deployed site, not the host that
// happens to serve the page (a preview build, localhost), so the origin is fixed
// here instead of read from `window.location`.
export const SITE_URL = 'https://insidetheforyou.com'

// The path that serves each locale. The default locale lives at the root.
export const LOCALE_PATHS: Record<Locale, string> = {
  en: '/',
  'pt-BR': '/pt-br',
}

// Open Graph wants an underscore territory tag, not the BCP 47 one.
export const LOCALE_OG_TAGS: Record<Locale, string> = {
  en: 'en_US',
  'pt-BR': 'pt_BR',
}

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function pathForLocale(locale: Locale): string {
  return LOCALE_PATHS[locale]
}

export function absoluteUrlForLocale(locale: Locale): string {
  return `${SITE_URL}${pathForLocale(locale)}`
}
