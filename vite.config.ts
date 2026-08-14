import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devNameApi()],
})
