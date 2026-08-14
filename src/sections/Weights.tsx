import { motion } from 'framer-motion'
import { Reveal, Section } from '../components/Reveal'
import { useCopy, useFormat, type Copy } from '../i18n'

// Real production weights from home-mixer/params/param.rs (Aug 2026 snapshot)
const WEIGHTS: [keyof Copy['actions'], number][] = [
  ['video', 0.05],
  ['click', 0.4],
  ['like', 0.5],
  ['repost', 1.0],
  ['share', 2.0],
  ['follow', 4.0],
  ['reply', 5.0],
  ['quote', 5.0],
  ['shareDm', 5.0],
  ['copyLink', 20.0],
  ['replyMutual', 20.0],
  ['block', -31.2],
  ['notInterested', -43.2],
  ['mute', -58.8],
  ['report', -234.0],
]

const MAX = Math.sqrt(234)

export function Weights() {
  const copy = useCopy()
  const { signed } = useFormat()
  return (
    <Section id="weights" theme="light">
      <Reveal>
        <h2 className="display">
          {copy.weights.title} <span className="dim">{copy.weights.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.weights.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48, maxWidth: 820 }}>
        {WEIGHTS.map(([action, w], i) => (
          <div className="weight-row" key={action}>
            <span className="weight-label">{copy.actions[action]}</span>
            <div className="bar-track">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(Math.sqrt(Math.abs(w)) / MAX) * 100}%` }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.7, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  backgroundColor: w >= 0 ? 'var(--ink)' : 'transparent',
                  backgroundImage:
                    w < 0
                      ? 'repeating-linear-gradient(45deg, var(--ink) 0 6px, transparent 6px 12px)'
                      : undefined,
                }}
              />
            </div>
            <span className="weight-value">{signed(w)}</span>
          </div>
        ))}
      </div>
      <Reveal delay={0.2}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.weights.note}
        </p>
      </Reveal>
    </Section>
  )
}
