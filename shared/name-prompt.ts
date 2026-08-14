// Single source of truth for the POST /api/name request, shared by the Cloudflare
// Worker (worker/index.ts, production) and the dev-server emulator (vite.config.ts).
// The locale list itself lives in ./locales.ts, which the app reads too.

import { isLocale, type Locale } from './locales.ts'

export { isLocale, type Locale }

const LANGUAGES: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Brazilian Portuguese',
}

const DEFAULTS: Record<string, number> = {
  like: 0.5,
  reply: 5,
  repost: 1,
  quote: 5,
  share: 2,
  copyLink: 20,
  follow: 4,
  click: 0.4,
  video: 0.05,
  notInterested: -43.2,
  block: -31.2,
  mute: -58.8,
  report: -234,
}

const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    like: 'like',
    reply: 'reply',
    repost: 'repost',
    quote: 'quote',
    share: 'share',
    copyLink: 'copy link',
    follow: 'follow author',
    click: 'open post',
    video: 'watch video',
    notInterested: 'not interested',
    block: 'block',
    mute: 'mute',
    report: 'report',
  },
  'pt-BR': {
    like: 'curtir',
    reply: 'responder',
    repost: 'repostar',
    quote: 'citar',
    share: 'compartilhar',
    copyLink: 'copiar link',
    follow: 'seguir o autor',
    click: 'abrir o post',
    video: 'assistir ao vídeo',
    notInterested: 'não tenho interesse',
    block: 'bloquear',
    mute: 'silenciar',
    report: 'denunciar',
  },
}

/** Only the known knobs, as numbers, within sane bounds. Returns the offending id instead. */
export function describeWeights(
  weights: unknown,
  locale: Locale
): { description: string } | { invalid: string } {
  const given = (weights ?? {}) as Record<string, unknown>
  const parts: string[] = []
  for (const id of Object.keys(DEFAULTS)) {
    const value = given[id]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < -600 || value > 60) {
      return { invalid: id }
    }
    parts.push(`${LABELS[locale][id]} ${value} (default ${DEFAULTS[id]})`)
  }
  return { description: parts.join(', ') }
}

/** The xAI request body, so both callers ask Grok the exact same thing. */
export function nameRequestBody(description: string, locale: Locale): string {
  return JSON.stringify({
    model: 'grok-4.20-0309-non-reasoning',
    temperature: 1.0,
    max_tokens: 20,
    messages: [
      {
        role: 'system',
        content: `You name custom social feed ranking algorithms based on their engagement weights. Respond with ONLY a short, funny, memorable name of 2 to 4 words, written in ${LANGUAGES[locale]}. No quotes, no punctuation at the end, no explanation.`,
      },
      {
        role: 'user',
        content: `The user tuned these engagement weights for their feed ranking algorithm (defaults in parens): ${description}. Name the algorithm based on the personality a feed ranked with these weights has.`,
      },
    ],
  })
}

/** Pulls the name out of an xAI chat completion response. */
export function nameFromResponse(data: unknown): string | undefined {
  const { choices } = (data ?? {}) as { choices?: { message?: { content?: string } }[] }
  return choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '')
}
