import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { headTags } from './src/i18n/head.ts'
import { DEFAULT_LOCALE, LOCALES, pathForLocale } from './shared/locales.ts'
import {
  describeWeights,
  isLocale,
  nameFromResponse,
  nameRequestBody,
  type Locale,
} from './shared/name-prompt.ts'

// In production the Cloudflare Worker (worker/index.ts) serves /api/name; this plugin
// emulates it during `npm run dev` with the local .env key. Both build the request from
// shared/name-prompt.ts, so the dev prompt cannot drift from the production one.

function devNameApi(): Plugin {
  return {
    name: 'dev-name-api',
    configureServer(server) {
      server.middlewares.use('/api/name', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let apiKey = process.env.XAI_API_KEY
        if (!apiKey) {
          try {
            const env = readFileSync('.env', 'utf8')
            apiKey = env.match(/^XAI_API_KEY\s*=\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim()
          } catch {
            /* no .env file */
          }
        }
        if (!apiKey) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'XAI_API_KEY not found' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        const json = (payload: unknown, status: number) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }

        let weights: unknown
        let locale: Locale = 'en'
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
            weights?: unknown
            locale?: unknown
          }
          weights = body.weights
          if (body.locale !== undefined) {
            if (!isLocale(body.locale)) return json({ error: 'invalid locale' }, 400)
            locale = body.locale
          }
        } catch {
          return json({ error: 'invalid JSON body' }, 400)
        }

        const described = describeWeights(weights, locale)
        if ('invalid' in described) {
          return json({ error: `invalid weight: ${described.invalid}` }, 400)
        }

        try {
          const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: nameRequestBody(described.description, locale),
          })
          if (!upstream.ok) {
            return json({ error: `upstream error ${upstream.status}` }, 502)
          }
          const name = nameFromResponse(await upstream.json())
          return json(name ? { name } : { error: 'no name in response' }, name ? 200 : 502)
        } catch (err) {
          return json({ error: String(err) }, 500)
        }
      })
    },
  }
}

// Unfurlers and crawlers that do not run JS see only the served HTML, so each locale
// needs its own file with its own title/description/canonical: `/pt-br` must not be
// answered with the English baseline. The Worker's SPA fallback still covers every
// other path.
function localeHtml(): Plugin {
  const block = /<!--locale-head(?::[\w-]+)?-->(?:[\s\S]*?<!--\/locale-head-->)?/
  return {
    name: 'locale-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(block, () => headTags(DEFAULT_LOCALE)),
    },
    // The default locale's file is already written at this point, hashed asset tags
    // included, so the other locales are that same file with their head swapped.
    writeBundle(options) {
      const outDir = options.dir
      if (!outDir) return
      const base = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) continue
        const html = base
          .replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
          .replace(block, () => headTags(locale))
        // `pt-br.html`, not `pt-br/index.html`: with Cloudflare's auto-trailing-slash
        // handling the folder form makes `/pt-br` redirect to `/pt-br/`, and the
        // canonical URL must be served directly, not through a hop.
        const file = join(outDir, `${pathForLocale(locale).replace(/^\//, '')}.html`)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devNameApi(), localeHtml()],
})
