import { motion } from 'framer-motion'
import { Reveal, Section } from '../components/Reveal'
import { useCopy } from '../i18n'

// The value of each bar is a constant of the code and its label comes from the
// dictionary, so the two are paired by position: this signature is what makes the
// compiler require one value per label.
function Bars<T extends readonly string[]>({
  values,
  labels,
  marks,
}: {
  values: { [K in keyof T]: number }
  labels: T
  marks?: T
}) {
  return (
    <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
      {values.map((v: number, i: number) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: marks ? '70px 1fr 48px' : '90px 1fr',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>
            {labels[i]}
          </span>
          <div className="bar-track">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${v * 100}%` }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', background: 'currentColor' }}
            />
          </div>
          {marks && (
            <span className="mono" style={{ fontSize: 11, opacity: 0.6, textAlign: 'right' }}>
              {marks[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function Adjustments() {
  const copy = useCopy()
  return (
    <Section theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.adjustments.title} <span className="dim">{copy.adjustments.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.adjustments.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48 }} className="cellgrid cols-3">
        <div className="cell" style={{ padding: 28 }}>
          <span className="tag">{copy.adjustments.diversityTag}</span>
          <h3 className="cell-title">{copy.adjustments.diversityTitle}</h3>
          <p className="small">{copy.adjustments.diversityBody}</p>
          <Bars
            values={[1, 0.5, 0.25, 0.25]}
            labels={copy.adjustments.diversityLabels}
            marks={copy.adjustments.diversityMarks}
          />
        </div>
        <div className="cell" style={{ padding: 28 }}>
          <span className="tag">{copy.adjustments.discountTag}</span>
          <h3 className="cell-title">{copy.adjustments.discountTitle}</h3>
          <p className="small">{copy.adjustments.discountBody}</p>
          <Bars
            values={[1, 0.75]}
            labels={copy.adjustments.discountLabels}
            marks={copy.adjustments.discountMarks}
          />
        </div>
        <div className="cell" style={{ padding: 28 }}>
          <span className="tag">{copy.adjustments.boostTag}</span>
          <h3 className="cell-title">{copy.adjustments.boostTitle}</h3>
          <p className="small">{copy.adjustments.boostBody}</p>
          <Bars values={[0.4, 0.75]} labels={copy.adjustments.boostLabels} />
        </div>
      </div>
    </Section>
  )
}
