export type { Copy } from './en'
export {
  DEFAULT_LOCALE,
  DICTIONARIES,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_NAMES,
  LOCALE_PATHS,
  detectLocale,
  localeFromPath,
  pathForLocale,
  type Locale,
} from './locale'
export { LocaleProvider, useCopy, useLocale } from './LocaleProvider'
export { useFormat } from './format'
export { entriesOf, texts } from './pairing'
