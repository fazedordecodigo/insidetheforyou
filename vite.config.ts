import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// In production, the Cloudflare Worker (worker/index.ts) serves /api/name.
// This plugin emulates that endpoint during `npm run dev` with the local .env key.
// Keep the locales, language names and weight bounds in step with worker/index.ts.
const LANGUAGES = new Map([
  ['en', 'English'],
  ['pt-BR', 'Brazilian Portuguese'],
])

const DEFAULTS = new Map([
  ['like', 0.5],
  ['reply', 5],
  ['repost', 1],
  ['quote', 5],
  ['share', 2],
  ['copyLink', 20],
  ['follow', 4],
  ['click', 0.4],
  ['video', 0.05],
  ['notInterested', -43.2],
  ['block', -31.2],
  ['mute', -58.8],
  ['report', -234],
])

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

        try {
          const { weights, locale } = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (locale !== undefined && !LANGUAGES.has(locale as string)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'invalid locale' }))
            return
          }
          const language = LANGUAGES.get(locale as string) ?? 'English'

          // Only the known knobs, as numbers, within sane bounds.
          const clean = new Map<string, number>()
          for (const id of DEFAULTS.keys()) {
            const v = (weights as Record<string, unknown> | undefined)?.[id]
            if (typeof v !== 'number' || !Number.isFinite(v) || v < -600 || v > 60) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `invalid weight: ${id}` }))
              return
            }
            clean.set(id, v)
          }

          const description = [...clean].map(([id, v]) => `${id} ${v}`).join(', ')
          const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'grok-4.20-0309-non-reasoning',
              temperature: 1.0,
              max_tokens: 20,
              messages: [
                {
                  role: 'system',
                  content: `You name custom social feed ranking algorithms based on their engagement weights. Respond with ONLY a short, funny, memorable name of 2 to 4 words, written in ${language}. No quotes, no punctuation at the end, no explanation.`,
                },
                {
                  role: 'user',
                  content: `The user tuned these engagement weights for their feed ranking algorithm (defaults: like 0.5, reply 5, repost 1, quote 5, copy link 20, share 2, follow 4, click 0.4, video 0.05, not interested -43.2, block -31.2, mute -58.8, report -234): ${description}. Name the algorithm based on the personality a feed ranked with these weights has.`,
                },
              ],
            }),
          })
          const data = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[]
          }
          const name = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '')
          res.statusCode = name ? 200 : 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(name ? { name } : { error: 'no name in response' }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devNameApi()],
})
