import { useLocale } from './LocaleProvider'

type Options = { digits?: number }

export function useFormat() {
  const { locale } = useLocale()

  const num = (value: number, { digits }: Options = {}) =>
    value.toLocaleString(
      locale,
      digits === undefined
        ? { maximumFractionDigits: 20 }
        : { minimumFractionDigits: digits, maximumFractionDigits: digits },
    )

  const signed = (value: number, options?: Options) =>
    `${value > 0 ? '+' : ''}${num(value, options)}`

  return { num, signed }
}
