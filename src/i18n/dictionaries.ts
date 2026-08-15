import type { Locale } from '../../shared/locales.ts'
import { en, type Copy } from './en.ts'
import { ptBR } from './pt-BR.ts'

// Separate from locale.ts so the Vite build can read the copy without pulling in
// the browser-only helpers (localStorage, navigator, history).
export const DICTIONARIES: Record<Locale, Copy> = {
  en,
  'pt-BR': ptBR,
}
