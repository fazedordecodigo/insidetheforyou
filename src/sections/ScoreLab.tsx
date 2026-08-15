import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal, Section } from '../components/Reveal'
import { useCopy, useFormat, type Copy } from '../i18n'

type ActionId = keyof Copy['actions']

type Action = {
  id: ActionId
  weight: number
}

// Real production weights from home-mixer/params/param.rs (Aug 2026 snapshot)
const ACTIONS: Action[] = [
  { id: 'like', weight: 0.5 },
  { id: 'reply', weight: 5.0 },
  { id: 'replyMutual', weight: 20.0 },
  { id: 'repost', weight: 1.0 },
  { id: 'quote', weight: 5.0 },
  { id: 'share', weight: 2.0 },
  { id: 'shareDm', weight: 5.0 },
  { id: 'copyLink', weight: 20.0 },
  { id: 'follow', weight: 4.0 },
  { id: 'click', weight: 0.4 },
  { id: 'video', weight: 0.05 },
  { id: 'notInterested', weight: -43.2 },
  { id: 'block', weight: -31.2 },
  { id: 'mute', weight: -58.8 },
  { id: 'report', weight: -234.0 },
]

const MAX_ABS = 234

function weightOf(id: ActionId): number {
  const action = ACTIONS.find((a) => a.id === id)
  if (!action) throw new Error(`no weight for ${id}`)
  return action.weight
}

export function ScoreLab() {
  const copy = useCopy()
  const { num, signed } = useFormat()
  const [on, setOn] = useState<Set<string>>(new Set(['like', 'reply']))
  const [aura, setAura] = useState<'good' | 'bad' | null>(null)
  const [auraKey, setAuraKey] = useState(0)

  const toggle = (id: ActionId) => {
    setOn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const maxAura = () => {
    setOn(new Set(ACTIONS.filter((a) => a.weight > 0).map((a) => a.id)))
    setAura('good')
    setAuraKey((k) => k + 1)
  }
  const negativeAura = () => {
    setOn(new Set(ACTIONS.filter((a) => a.weight < 0).map((a) => a.id)))
    setAura('bad')
    setAuraKey((k) => k + 1)
  }

  useEffect(() => {
    if (!aura) return
    const t = setTimeout(() => setAura(null), 1200)
    return () => clearTimeout(t)
  }, [aura, auraKey])

  const selected = ACTIONS.filter((a) => on.has(a.id))
  const score = selected.reduce((s, a) => s + a.weight, 0)

  // The asymmetry the note describes is read off the weights above, signs
  // included, so the sentence cannot drift from the pills next to it.
  const report = weightOf('report')
  const like = weightOf('like')

  return (
    <Section id="scoring" theme="light">
      <Reveal>
        <h2 className="display">
          {copy.scoreLab.title} <span className="dim">{copy.scoreLab.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.scoreLab.lede}</p>
      </Reveal>

      <div className="aura-row" style={{ marginTop: 48 }}>
        <button className="aura-btn good" onClick={maxAura}>
          {copy.scoreLab.maxAura} <span style={{ opacity: 0.6 }}>↑</span>
        </button>
        <button className="aura-btn bad" onClick={negativeAura}>
          {copy.scoreLab.negativeAura} <span style={{ opacity: 0.6 }}>↓</span>
        </button>
        <button className="aura-btn neutral" onClick={() => setOn(new Set(['like', 'reply']))}>
          {copy.scoreLab.reset} <span style={{ opacity: 0.6 }}>↺</span>
        </button>
      </div>

      <div className="pill-grid" style={{ marginTop: 16 }}>
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            className={`pill-toggle ${on.has(a.id) ? 'on' : ''} ${a.weight < 0 ? 'negative' : ''}`}
            onClick={() => toggle(a.id)}
          >
            {copy.actions[a.id]}
            <span style={{ opacity: 0.55 }}>{signed(a.weight)}</span>
          </button>
        ))}
      </div>

      {aura && <div key={`flash-${auraKey}`} className={`aura-flash ${aura}`} />}

      <div
        key={`card-${auraKey}`}
        className={aura ? `score-card aura-${aura}` : 'score-card'}
        style={{ marginTop: 40, maxWidth: 820 }}
      >
        <span className="tag mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>
          {copy.scoreLab.postScore}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8 }}>
          <motion.span
            key={score}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="display score-value"
          >
            {signed(Number(score.toFixed(2)))}
          </motion.span>
          <span className="small">
            {score >= 20
              ? copy.scoreLab.verdictTop
              : score > 0
                ? copy.scoreLab.verdictCompetes
                : score === 0
                  ? copy.scoreLab.verdictInvisible
                  : copy.scoreLab.verdictBuried}
          </span>
        </div>
        <div className="bar-track" style={{ marginTop: 20, height: 14 }}>
          <motion.div
            animate={{
              width: `${Math.min(Math.abs(score) / MAX_ABS, 1) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{
              height: '100%',
              backgroundColor: score >= 0 ? 'var(--ink)' : 'transparent',
              backgroundImage:
                score < 0
                  ? 'repeating-linear-gradient(45deg, var(--ink) 0 6px, transparent 6px 12px)'
                  : undefined,
            }}
          />
        </div>
        <p className="small" style={{ marginTop: 20 }}>
          {copy.scoreLab.note({
            report: signed(report),
            like: signed(like),
            likes: num(Math.abs(report / like)),
          })}
        </p>
      </div>
    </Section>
  )
}
