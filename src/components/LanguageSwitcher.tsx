import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, useCopy, useLocale } from '../i18n'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const copy = useCopy()

  return (
    <div className="lang-switch mono" role="group" aria-label={copy.nav.language}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          className={`lang-option ${option === locale ? 'active' : ''}`}
          aria-current={option === locale}
          title={LOCALE_NAMES[option]}
          onClick={() => setLocale(option)}
        >
          {LOCALE_LABELS[option]}
        </button>
      ))}
    </div>
  )
}
