import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Copy } from './en'
import { applyMetadata } from './metadata'
import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  localeFromPath,
  pathForLocale,
  resolveInitialLocale,
  storeLocale,
  type Locale,
} from './locale'

type LocaleContextValue = {
  locale: Locale
  copy: Copy
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// Keeps the hash and the query string, so section anchors survive a switch.
function urlForLocale(locale: Locale): string {
  const url = new URL(window.location.href)
  url.pathname = pathForLocale(locale)
  return `${url.pathname}${url.search}${url.hash}`
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale)

  // The URL always names the locale being rendered, even when the locale came
  // from the stored preference or from the browser's languages.
  useEffect(() => {
    if (window.location.pathname !== pathForLocale(locale)) {
      window.history.replaceState(null, '', urlForLocale(locale))
    }
  }, [locale])

  // Title, description, canonical and hreflang follow the rendered locale, not
  // the static English ones from index.html.
  useEffect(() => {
    applyMetadata(locale)
  }, [locale])

  // History entries carry their own locale: going back to the root means the
  // default locale, not the preference stored by a later switch.
  useEffect(() => {
    const onPopState = () => {
      setLocaleState(localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Only a real change pushes history, so clicking the active locale is a no-op
  // for the back button.
  const setLocale = useCallback((next: Locale) => {
    storeLocale(next)
    if (window.location.pathname !== pathForLocale(next)) {
      window.history.pushState(null, '', urlForLocale(next))
    }
    setLocaleState(next)
  }, [])

  return (
    <LocaleContext value={{ locale, copy: DICTIONARIES[locale], setLocale }}>{children}</LocaleContext>
  )
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used inside a LocaleProvider')
  return value
}

export function useCopy(): Copy {
  return useLocale().copy
}
