// Cloudflare Worker: serves the static site and the /api/name endpoint.
// The XAI_API_KEY secret is set in the Worker settings (Variables and Secrets)
// or with: npx wrangler secret put XAI_API_KEY

import {
  describeWeights,
  isLocale,
  nameFromResponse,
  nameRequestBody,
  type Locale,
} from '../shared/name-prompt.ts'

type RateLimiter = { limit: (options: { key: string }) => Promise<{ success: boolean }> }

type Env = {
  XAI_API_KEY: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  NAME_RATE_LIMITER?: RateLimiter
  NAME_GLOBAL_LIMITER?: RateLimiter
}

async function handleName(request: Request, env: Env): Promise<Response> {
  if (!env.XAI_API_KEY) {
    return Response.json({ error: 'XAI_API_KEY is not configured' }, { status: 500 })
  }

  // Rate limits: 10/minute per visitor, 100/minute across all visitors.
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const checks = await Promise.all([
    env.NAME_RATE_LIMITER?.limit({ key: ip }) ?? { success: true },
    env.NAME_GLOBAL_LIMITER?.limit({ key: 'global' }) ?? { success: true },
  ])
  if (checks.some((c) => !c.success)) {
    return Response.json({ error: 'rate limited, slow down' }, { status: 429 })
  }

  let weights: Record<string, unknown>
  let locale: Locale = 'en'
  try {
    const body = (await request.json()) as {
      weights?: Record<string, unknown>
      locale?: unknown
    }
    weights = body.weights ?? {}
    if (body.locale !== undefined) {
      if (!isLocale(body.locale)) {
        return Response.json({ error: 'invalid locale' }, { status: 400 })
      }
      locale = body.locale
    }
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const described = describeWeights(weights, locale)
  if ('invalid' in described) {
    return Response.json({ error: `invalid weight: ${described.invalid}` }, { status: 400 })
  }

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: nameRequestBody(described.description, locale),
  })

  if (!res.ok) {
    return Response.json({ error: `upstream error ${res.status}` }, { status: 502 })
  }

  const name = nameFromResponse(await res.json())
  if (!name) {
    return Response.json({ error: 'no name in response' }, { status: 502 })
  }

  return Response.json({ name })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/name' && request.method === 'POST') {
      return handleName(request, env)
    }
    return env.ASSETS.fetch(request)
  },
}
