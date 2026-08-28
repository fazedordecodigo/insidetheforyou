import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  LOCALES,
  LOCALE_OG_TAGS,
  absoluteUrlForLocale,
  type Locale,
} from './locale'

const ALTERNATE_MARK = 'data-locale-alternate'

function meta(attribute: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attribute}="${key}"]`
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function canonical(href: string): void {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }
  tag.href = href
}

// The static block in index.html already carries this set; it is marked the same
// way so it is replaced here rather than duplicated.
function alternates(): void {
  for (const stale of document.head.querySelectorAll(`link[${ALTERNATE_MARK}]`)) {
    stale.remove()
  }
  const add = (hreflang: string, locale: Locale) => {
    const tag = document.createElement('link')
    tag.rel = 'alternate'
    tag.hreflang = hreflang
    tag.href = absoluteUrlForLocale(locale)
    tag.setAttribute(ALTERNATE_MARK, '')
    document.head.appendChild(tag)
  }
  for (const locale of LOCALES) add(locale, locale)
  add('x-default', DEFAULT_LOCALE)
}

// Everything a crawler or a shared link reads has to name the locale being
// rendered, and the switch happens without a reload, so this runs on each change.
export function applyMetadata(locale: Locale): void {
  const { meta: copy } = DICTIONARIES[locale]
  const url = absoluteUrlForLocale(locale)

  document.documentElement.lang = locale
  document.title = copy.title

  meta('name', 'description', copy.description)
  meta('property', 'og:title', copy.title)
  meta('property', 'og:description', copy.description)
  meta('property', 'og:site_name', copy.siteName)
  meta('property', 'og:locale', LOCALE_OG_TAGS[locale])
  meta('property', 'og:url', url)
  meta('name', 'twitter:title', copy.title)
  meta('name', 'twitter:description', copy.description)

  canonical(url)
  alternates()
}
