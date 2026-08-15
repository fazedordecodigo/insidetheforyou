import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal, Section } from '../components/Reveal'
import { useCopy, useFormat, useLocale, type Copy, type Locale } from '../i18n'

type WeightDef = {
  id: keyof Copy['actions']
  def: number
  min: number
  max: number
  step: number
}

// Defaults are the real production values from home-mixer/params/param.rs (Aug 2026 snapshot)
const WEIGHT_DEFS: WeightDef[] = [
  { id: 'like', def: 0.5, min: 0, max: 10, step: 0.1 },
  { id: 'reply', def: 5, min: 0, max: 30, step: 0.5 },
  { id: 'repost', def: 1, min: 0, max: 10, step: 0.5 },
  { id: 'quote', def: 5, min: 0, max: 30, step: 0.5 },
  { id: 'share', def: 2, min: 0, max: 20, step: 0.5 },
  { id: 'copyLink', def: 20, min: 0, max: 60, step: 1 },
  { id: 'follow', def: 4, min: 0, max: 30, step: 0.5 },
  { id: 'click', def: 0.4, min: 0, max: 5, step: 0.1 },
  { id: 'video', def: 0.05, min: 0, max: 5, step: 0.05 },
  { id: 'notInterested', def: -43.2, min: -300, max: 0, step: 1 },
  { id: 'block', def: -31.2, min: -300, max: 0, step: 1 },
  { id: 'mute', def: -58.8, min: -300, max: 0, step: 1 },
  { id: 'report', def: -234, min: -600, max: 0, step: 1 },
]

type Post = {
  id: keyof Copy['weightLab']['posts']
  probs: Record<string, number>
}

// Illustrative per-post action probabilities (what the Phoenix model predicts)
const POSTS: Post[] = [
  {
    id: 'friend',
    probs: {
      like: 0.25, reply: 0.12, repost: 0.02, quote: 0.01, share: 0.02, copyLink: 0.005,
      follow: 0, click: 0.08, video: 0, notInterested: 0.001, block: 0.0001, mute: 0.0002, report: 0.0001,
    },
  },
  {
    id: 'thread',
    probs: {
      like: 0.12, reply: 0.02, repost: 0.05, quote: 0.02, share: 0.04, copyLink: 0.03,
      follow: 0.04, click: 0.3, video: 0, notInterested: 0.005, block: 0.0003, mute: 0.002, report: 0.0005,
    },
  },
  {
    id: 'dog',
    probs: {
      like: 0.3, reply: 0.01, repost: 0.04, quote: 0.005, share: 0.03, copyLink: 0.002,
      follow: 0.01, click: 0.05, video: 0.6, notInterested: 0.002, block: 0.0002, mute: 0.0005, report: 0.0001,
    },
  },
  {
    id: 'news',
    probs: {
      like: 0.15, reply: 0.04, repost: 0.1, quote: 0.03, share: 0.06, copyLink: 0.01,
      follow: 0.01, click: 0.1, video: 0.35, notInterested: 0.01, block: 0.001, mute: 0.002, report: 0.001,
    },
  },
  {
    id: 'ragebait',
    probs: {
      like: 0.18, reply: 0.15, repost: 0.06, quote: 0.1, share: 0.01, copyLink: 0.004,
      follow: 0.005, click: 0.12, video: 0, notInterested: 0.05, block: 0.01, mute: 0.015, report: 0.008,
    },
  },
  {
    id: 'spam',
    probs: {
      like: 0.02, reply: 0.005, repost: 0.003, quote: 0.002, share: 0.001, copyLink: 0.0005,
      follow: 0.001, click: 0.02, video: 0, notInterested: 0.09, block: 0.04, mute: 0.05, report: 0.03,
    },
  },
]

const DEFAULTS: Record<string, number> = Object.fromEntries(WEIGHT_DEFS.map((w) => [w.id, w.def]))

const PRESETS: [keyof Copy['weightLab']['presets'], Record<string, number>][] = [
  ['factory', DEFAULTS],
  [
    'rage',
    { ...DEFAULTS, reply: 30, quote: 30, notInterested: 0, block: 0, mute: 0, report: 0 },
  ],
  [
    'zen',
    { ...DEFAULTS, video: 3, like: 2, notInterested: -300, block: -300, mute: -300, report: -600 },
  ],
]

export function WeightLab() {
  const copy = useCopy()
  const { locale } = useLocale()
  const { num, signed } = useFormat()
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULTS)

  const setWeight = (id: string, v: number) => setWeights((prev) => ({ ...prev, [id]: v }))

  const ranked = useMemo(() => {
    const scored = POSTS.map((p) => ({
      ...p,
      score: WEIGHT_DEFS.reduce((s, w) => s + (p.probs[w.id] ?? 0) * weights[w.id], 0),
    }))
    return scored.sort((a, b) => b.score - a.score)
  }, [weights])

  const maxAbs = Math.max(...ranked.map((p) => Math.abs(p.score)), 0.001)

  // Naming: the name only changes when the user asks Grok. Moving the knobs
  // never renames on its own. Client-side exponential backoff after the first
  // few calls, and the Worker enforces real rate limits on top of this.
  // The locale is part of the key: the same knobs get a different name per language.
  const configKey = useMemo(() => `${locale}:${JSON.stringify(weights)}`, [locale, weights])
  const [names, setNames] = useState<Record<string, string>>({})
  const [last, setLast] = useState<{ locale: Locale; name: string } | null>(null)
  const [naming, setNaming] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const callCount = useRef(0)
  const isDefault = WEIGHT_DEFS.every((d) => weights[d.id] === d.def)
  const isPreset = PRESETS.some(([, preset]) =>
    WEIGHT_DEFS.every((d) => weights[d.id] === preset[d.id])
  )

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const interval = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= cooldownUntil) clearInterval(interval)
    }, 500)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  // A named configuration shows its own name again; any other custom one keeps the
  // last name the user earned, so moving a knob does not erase it. The default
  // configuration and the presets are nobody's creation, and a name written in the
  // previous language does not survive a language switch.
  const alreadyNamed = configKey in names
  const displayName =
    names[configKey] ??
    (!isDefault && !isPreset && last?.locale === locale ? last.name : null) ??
    copy.weightLab.defaultName

  const nameIt = async () => {
    if (naming || cooldownLeft > 0 || isDefault || isPreset || alreadyNamed) return
    setNaming(true)
    try {
      const res = await fetch('/api/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights, locale }),
      })
      if (res.status === 429) {
        setCooldownUntil(Date.now() + 30_000)
        return
      }
      if (!res.ok) throw new Error(`status ${res.status}`)
      const { name } = (await res.json()) as { name?: string }
      if (name) {
        setNames((prev) => ({ ...prev, [configKey]: name }))
        setLast({ locale, name })
      }
      // First 3 calls are free; after that the wait doubles: 2s, 4s, 8s... up to 60s.
      callCount.current += 1
      if (callCount.current >= 3) {
        const delay = Math.min(2 ** (callCount.current - 3) * 2, 60)
        setCooldownUntil(Date.now() + delay * 1000)
        setNow(Date.now())
      }
    } catch {
      /* keep the previous name */
    } finally {
      setNaming(false)
    }
  }

  return (
    <Section id="playground" theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.weightLab.title} <span className="dim">{copy.weightLab.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.weightLab.lede}</p>
      </Reveal>

      <div style={{ marginTop: 40, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {PRESETS.map(([presetId, preset]) => (
          <button
            key={presetId}
            className="preset-btn"
            onClick={() => setWeights(preset)}
            title={copy.weightLab.presets[presetId].desc}
          >
            {copy.weightLab.presets[presetId].name}
          </button>
        ))}
      </div>

      <div className="algo-name">
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5 }}>
            {copy.weightLab.youBuilt}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={displayName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="display"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginTop: 4 }}
            >
              {displayName}
            </motion.div>
          </AnimatePresence>
        </div>
        {!isDefault && !isPreset && !alreadyNamed && (
          <button
            className="preset-btn"
            onClick={nameIt}
            disabled={naming || cooldownLeft > 0}
            style={naming || cooldownLeft > 0 ? { opacity: 0.5, cursor: 'default' } : undefined}
          >
            {naming
              ? copy.weightLab.naming
              : cooldownLeft > 0
                ? copy.weightLab.wait(cooldownLeft)
                : copy.weightLab.askGrok}
          </button>
        )}
      </div>

      <div className="playground-grid" style={{ marginTop: 40 }}>
        <div>
          <span className="tag mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>
            {copy.weightLab.knobs}
          </span>
          <div style={{ marginTop: 16 }}>
            {WEIGHT_DEFS.map((w) => (
              <div key={w.id} className="slider-row">
                <span className="slider-label">{copy.actions[w.id]}</span>
                <input
                  type="range"
                  className={`wslider ${w.def < 0 || w.max === 0 ? 'neg' : 'pos'}`}
                  min={w.min}
                  max={w.max}
                  step={w.step}
                  value={weights[w.id]}
                  onChange={(e) => setWeight(w.id, Number(e.target.value))}
                />
                <span className="slider-value">{signed(weights[w.id])}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="tag mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>
            {copy.weightLab.ranked}
          </span>
          <div style={{ marginTop: 16 }}>
            {ranked.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="rank-row"
              >
                <span className="mono" style={{ opacity: 0.4, fontSize: 12, width: 20 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {copy.weightLab.posts[p.id].title}
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.45, marginTop: 2 }}>
                    {copy.weightLab.posts[p.id].trait}
                  </div>
                  <div className="bar-track" style={{ marginTop: 8, height: 4 }}>
                    <motion.div
                      animate={{ width: `${(Math.abs(p.score) / maxAbs) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      style={{
                        height: '100%',
                        backgroundColor: p.score >= 0 ? '#fff' : 'transparent',
                        backgroundImage:
                          p.score < 0
                            ? 'repeating-linear-gradient(45deg, #fff 0 4px, transparent 4px 8px)'
                            : undefined,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 13,
                    width: 64,
                    textAlign: 'right',
                    opacity: p.score >= 0 ? 1 : 0.6,
                  }}
                >
                  {p.score >= 0 ? '+' : ''}
                  {num(p.score, { digits: 2 })}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Reveal delay={0.2}>
        <p className="small" style={{ marginTop: 32 }}>
          {copy.weightLab.note}
        </p>
      </Reveal>
    </Section>
  )
}
