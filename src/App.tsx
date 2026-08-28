import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Reveal, Section } from './components/Reveal'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { entriesOf, useCopy, useFormat, type Copy } from './i18n'
import { ScoreLab } from './sections/ScoreLab'
import { Adjustments } from './sections/Adjustments'
import { Weights } from './sections/Weights'
import { WeightLab } from './sections/WeightLab'
import { DemoFeed, ActionEffects } from './sections/DemoFeed'

function Nav() {
  const copy = useCopy()
  const links: [string, string][] = [
    [copy.nav.scoring, '#scoring'],
    [copy.nav.feed, '#feed'],
    [copy.nav.playground, '#playground'],
    [copy.nav.deepDive, '#deepdive'],
  ]
  return (
    <div className="nav-bar">
      <div className="nav-inner">
        <a href="#top" className="mono nav-brand">
          {copy.nav.brand}
        </a>
        <div className="nav-spacer" />
        {links.map(([label, href]) => (
          <a key={href} href={href} className="mono nav-link">
            {label}
          </a>
        ))}
        <LanguageSwitcher />
        <a
          href="https://devin.ai"
          target="_blank"
          rel="noreferrer"
          className="nav-devin"
          title={copy.nav.devin}
        >
          <img src="/devin.png" alt="Devin" width={18} height={18} />
        </a>
      </div>
    </div>
  )
}

function Hero() {
  const copy = useCopy()
  return (
    <section id="top" className="section dark">
      <div
        className="section-inner"
        style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <Reveal delay={0.1}>
          <h1 className="display" style={{ maxWidth: 900, fontSize: 'clamp(42px, 6.5vw, 84px)' }}>
            {copy.hero.title}
            <br />
            <span className="dim">{copy.hero.titleDim}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lede">{copy.hero.lede}</p>
        </Reveal>
        <Reveal delay={0.35}>
          <div style={{ marginTop: 48, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a className="boxlink" href="#scoring">
              {copy.hero.start}
            </a>
            <a
              className="boxlink"
              href="https://deepwiki.com/xai-org/x-algorithm"
              target="_blank"
              rel="noreferrer"
            >
              {copy.hero.source}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Fresh() {
  const copy = useCopy()
  return (
    <Section id="fresh" theme="light">
      <Reveal>
        <h2 className="display">
          {copy.fresh.title} <span className="dim">{copy.fresh.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">
          {copy.fresh.ledeBefore}
          <span className="mono">Home Mixer</span>
          {copy.fresh.ledeAfter}
        </p>
      </Reveal>
      <div style={{ marginTop: 56 }}>
        <div className="cellgrid cols-3">
          {copy.fresh.stats.map(({ big, title, sub }, i) => (
            <motion.div
              key={title}
              className="cell"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div className="display" style={{ fontSize: 44 }}>
                {big}
              </div>
              <div className="cell-title" style={{ marginTop: 12 }}>
                {title}
              </div>
              <p className="small">{sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Sources() {
  const copy = useCopy()
  const { num } = useFormat()
  return (
    <Section id="sources" theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.sources.title} <span className="dim">{copy.sources.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.sources.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48, maxWidth: 760 }}>
        {(
          [
            [copy.sources.thunder, 1200],
            [copy.sources.phoenix, 1000],
            [copy.sources.simClusters, 800],
          ] as [string, number][]
        ).map(([label, n], i) => (
          <div className="weight-row" key={label}>
            <span className="weight-label">{label}</span>
            <div className="bar-track">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(n / 1200) * 100}%` }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
                style={{ height: '100%', background: '#fff' }}
              />
            </div>
            <span className="weight-value">{num(n)}</span>
          </div>
        ))}
        <p className="small" style={{ marginTop: 16 }}>
          {copy.sources.caps}
        </p>
      </div>
      <div style={{ marginTop: 40 }} className="cellgrid cols-2">
        <motion.div
          className="cell"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ padding: 32 }}
        >
          <span className="tag">{copy.sources.inNetworkTag}</span>
          <h3 className="cell-title" style={{ fontSize: 24 }}>
            {copy.sources.inNetworkTitle}
          </h3>
          <p className="small" style={{ marginTop: 8 }}>
            {copy.sources.inNetworkBody}
          </p>
        </motion.div>
        <motion.div
          className="cell filled"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ padding: 32 }}
        >
          <span className="tag">{copy.sources.outNetworkTag}</span>
          <h3 className="cell-title" style={{ fontSize: 24 }}>
            {copy.sources.outNetworkTitle}
          </h3>
          <p className="small" style={{ marginTop: 8, color: 'inherit', opacity: 0.7 }}>
            {copy.sources.outNetworkBody}
          </p>
        </motion.div>
      </div>
      <Reveal delay={0.2}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.sources.note}
        </p>
      </Reveal>
    </Section>
  )
}

function Signals() {
  const copy = useCopy()
  const actions = copy.signals.items
  return (
    <Section id="signals" theme="light">
      <Reveal>
        <h2 className="display">
          {copy.signals.title} <span className="dim">{copy.signals.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.signals.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48, maxWidth: 720 }}>
        {actions.map((a, i) => (
          <motion.div
            key={a}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
            className="mono"
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'baseline',
              padding: '12px 16px',
              borderBottom: '1px solid var(--line-light)',
              fontSize: 13,
            }}
          >
            <span style={{ opacity: 0.4 }}>
              {actions.length - i === 1
                ? copy.signals.justNow
                : copy.signals.ago(actions.length - i)}
            </span>
            <span>{a}</span>
          </motion.div>
        ))}
        <Reveal delay={0.4}>
          <p className="small" style={{ marginTop: 24 }}>
            {copy.signals.note}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}

// Keyed, so the dictionary label of each action is the one the odds belong to.
const PREDICTION_ODDS: Record<keyof Copy['predictions']['probs'], number> = {
  like: 0.31,
  reply: 0.04,
  repost: 0.07,
  watch: 0.42,
  follow: 0.01,
  notInterested: 0.002,
}

function Predictions() {
  const copy = useCopy()
  const { num } = useFormat()
  const probs = entriesOf(PREDICTION_ODDS)
  return (
    <Section theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.predictions.title} <span className="dim">{copy.predictions.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.predictions.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48, maxWidth: 760 }}>
        {probs.map(([id, p], i) => (
          <div className="weight-row" key={id}>
            <span className="weight-label">P({copy.predictions.probs[id]})</span>
            <div className="bar-track">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${p * 100}%` }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: '#fff' }}
              />
            </div>
            <span className="weight-value">{num(p * 100, { digits: 1 })}%</span>
          </div>
        ))}
      </div>
      <Reveal delay={0.3}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.predictions.note}
        </p>
      </Reveal>
    </Section>
  )
}

function Visibility() {
  const copy = useCopy()
  return (
    <Section theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.visibility.title} <span className="dim">{copy.visibility.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.visibility.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48 }} className="cellgrid cols-3">
        {entriesOf(copy.visibility.rows).map(([id, { verdict, what, why }], i) => (
          <motion.div
            key={id}
            // The filled card is the drop verdict, not whichever row comes last.
            className={`cell ${id === 'drop' ? 'filled' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
          >
            <h3 className="cell-title" style={{ fontSize: 22 }}>
              {verdict}
            </h3>
            <p className="small" style={{ color: 'inherit', opacity: 0.75 }}>
              {what}
            </p>
            <p className="small" style={{ marginTop: 8, color: 'inherit', opacity: 0.55 }}>
              {why}
            </p>
          </motion.div>
        ))}
      </div>
      <Reveal delay={0.25}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.visibility.note}
        </p>
      </Reveal>
    </Section>
  )
}

function Takeaways() {
  const copy = useCopy()
  return (
    <Section id="takeaways" theme="light" eyebrow={copy.takeaways.eyebrow}>
      <Reveal>
        <h2 className="display">
          {copy.takeaways.title} <span className="dim">{copy.takeaways.titleDim}</span>
        </h2>
      </Reveal>
      <div style={{ marginTop: 56 }} className="cellgrid cols-2">
        {copy.takeaways.items.map(({ title, body }, i) => (
          <motion.div
            key={title}
            className="cell"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: (i % 2) * 0.1, duration: 0.5 }}
          >
            <h3 className="cell-title">{title}</h3>
            <p className="small">{body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

const SLIDES: [keyof Copy['deepDive']['slides'], ComponentType][] = [
  ['pipeline', Fresh],
  ['worlds', Sources],
  ['habits', Signals],
  ['predictions', Predictions],
  ['prices', Weights],
  ['adjustments', Adjustments],
  ['gate', Visibility],
  ['takeaways', Takeaways],
]

function DeepDive() {
  const copy = useCopy()
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const count = SLIDES.length

  const go = (n: number) => {
    const next = ((n % count) + count) % count
    setDir(next > index || (index === count - 1 && next === 0) ? 1 : -1)
    setIndex(next)
    document.getElementById('deepdive')?.scrollIntoView({ behavior: 'smooth' })
  }

  const ActiveSlide = SLIDES[index][1]
  const nextLabel =
    index === count - 1
      ? copy.deepDive.restart
      : copy.deepDive.slides[SLIDES[index + 1][0]]

  return (
    <div id="deepdive">
      <div className="slide-bar">
        <div className="slide-bar-inner">
          {SLIDES.map(([slide], n) => (
            <button
              key={slide}
              className={`slide-tab ${n === index ? 'active' : ''}`}
              onClick={() => go(n)}
            >
              {copy.deepDive.slides[slide]}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 48 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48 * dir }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ActiveSlide />
        </motion.div>
      </AnimatePresence>
      <button className="slide-next" onClick={() => go(index + 1)}>
        <div className="slide-next-inner">
          <span
            className="mono"
            style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5 }}
          >
            {copy.deepDive.nextUp}
          </span>
          <span className="display" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
            {nextLabel} {index === count - 1 ? '↺' : '→'}
          </span>
        </div>
      </button>
    </div>
  )
}

function Footer() {
  const copy = useCopy()
  return (
    <footer className="section dark" style={{ borderBottom: 'none' }}>
      <div className="section-inner footer-inner">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'baseline',
          }}
        >
          <span className="mono" style={{ fontSize: 12, letterSpacing: '0.14em' }}>
            {copy.footer.brand}
          </span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="small mono">
            <a href="https://github.com/dabit3/insidetheforyou" target="_blank" rel="noreferrer">
              {copy.footer.sourceCode}
            </a>
            <a href="https://deepwiki.com/xai-org/x-algorithm/" target="_blank" rel="noreferrer">
              {copy.footer.deepWiki}
            </a>
            <a
              href="https://devin.ai"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <img
                src="/devin.png"
                alt="Devin"
                width={16}
                height={16}
                style={{ filter: 'invert(1)', display: 'block' }}
              />
              {copy.footer.devin}
            </a>
          </div>
        </div>
        <p className="small" style={{ marginTop: 24, maxWidth: 640 }}>
          {copy.footer.note}
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--ink)',
          mixBlendMode: 'difference',
          transformOrigin: '0 50%',
          scaleX,
          zIndex: 100,
        }}
      />
      <Nav />
      <Hero />
      <ScoreLab />
      <DemoFeed />
      <ActionEffects />
      <WeightLab />
      <DeepDive />
      <Footer />
    </>
  )
}
