import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_OG_TAGS,
  SITE_URL,
  absoluteUrlForLocale,
  type Locale,
} from '../../shared/locales.ts'
import { DICTIONARIES } from './dictionaries.ts'

export const OG_IMAGE = `${SITE_URL}/og-card.png`
export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

// The generated block is delimited so the build can swap one locale's head for
// another's without re-running Vite.
export const HEAD_END = '<!--/locale-head-->'
const headStart = (locale: Locale) => `<!--locale-head:${locale}-->`

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Everything a crawler that does not run JS needs to index and unfurl the page it
// was served. `metadata.ts` rewrites the same tags on every locale switch, so the
// two must describe the same set.
export function headTags(locale: Locale): string {
  const { meta } = DICTIONARIES[locale]
  const url = absoluteUrlForLocale(locale)
  const tags: string[] = [
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escape(meta.siteName)}" />`,
    `<meta property="og:locale" content="${LOCALE_OG_TAGS[locale]}" />`,
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_SIZE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_SIZE.height}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(meta.title)}" />`,
    `<meta name="twitter:description" content="${escape(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ]
  // Marked like the runtime ones, so the client writer removes these instead of
  // appending a second set next to them.
  for (const alternate of LOCALES) {
    tags.push(
      `<link rel="alternate" hreflang="${alternate}" href="${absoluteUrlForLocale(alternate)}" data-locale-alternate />`
    )
  }
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrlForLocale(DEFAULT_LOCALE)}" data-locale-alternate />`
  )
  return [headStart(locale), ...tags, HEAD_END].join('\n    ')
}
