import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal, Section } from '../components/Reveal'
import realTweets from '../data/tweets.json'
import { entriesOf, useCopy, useFormat, type Copy } from '../i18n'

type PostId = keyof Copy['demoFeed']['posts']

// Every note key of every post, so the table below has to name all of them.
type NoteId = { [Id in PostId]: keyof Copy['demoFeed']['posts'][Id]['notes'] }[PostId]

const NOTE_KINDS: Record<NoteId, 'good' | 'bad' | 'info'> = {
  saraReply: 'good',
  saraAffinity: 'good',
  saraOrigin: 'info',
  priyaCopyLink: 'good',
  priyaDiscount: 'bad',
  priyaOrigin: 'info',
  octoAffinity: 'good',
  octoWatch: 'info',
  sara2Decay: 'bad',
  sara2Outscored: 'info',
}

type FeedPost = {
  id: PostId
  name: string
  handle: string
  time: string
  initials: string
  color: string
  video?: boolean
  stats: [string, string, string, string]
}

const FEED: FeedPost[] = [
  {
    id: 'sara',
    name: 'Sara Chen',
    handle: '@sarabuilds',
    time: '2h',
    initials: 'SC',
    color: '#6b5b95',
    stats: ['214', '186', '2.4K', '148K'],
  },
  {
    id: 'priya',
    name: 'Priya Raman',
    handle: '@priyaraman',
    time: '5h',
    initials: 'PR',
    color: '#2a9d8f',
    stats: ['96', '412', '3.1K', '512K'],
  },
  {
    id: 'octo',
    name: 'Deep Sea Daily',
    handle: '@deepseadaily',
    time: '7h',
    initials: 'DS',
    color: '#1d6fa3',
    video: true,
    stats: ['1.1K', '8.7K', '54K', '2.1M'],
  },
  {
    id: 'sara2',
    name: 'Sara Chen',
    handle: '@sarabuilds',
    time: '1h',
    initials: 'SC',
    color: '#6b5b95',
    stats: ['58', '44', '890', '61K'],
  },
]

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tweet-icon" aria-hidden="true">
      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tweet-icon" aria-hidden="true">
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55v6.34c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v6.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
  )
}

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tweet-icon" aria-hidden="true">
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    </svg>
  )
}

function ViewsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tweet-icon" aria-hidden="true">
      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
    </svg>
  )
}

export function DemoFeed() {
  const copy = useCopy()
  return (
    <Section id="feed" theme="dark">
      <Reveal>
        <h2 className="display">
          {copy.demoFeed.title} <span className="dim">{copy.demoFeed.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.demoFeed.lede}</p>
      </Reveal>
      <div style={{ marginTop: 48, maxWidth: 720 }}>
        {FEED.map((p, i) => (
          <motion.article
            key={p.id}
            className="feed-item"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <div className="tweet">
              <div className="tweet-avatar" style={{ background: p.color }}>
                {p.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tweet-head">
                  <span className="tweet-name">{p.name}</span>
                  <span className="tweet-meta">
                    {p.handle} {p.time}
                  </span>
                </div>
                <p className="tweet-body">{copy.demoFeed.posts[p.id].body}</p>
                {p.video && (
                  <div className="tweet-media">
                    <div className="tweet-play">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff" aria-hidden="true">
                        <path d="M8 5.14v13.72L19 12 8 5.14z" />
                      </svg>
                    </div>
                    <span className="tweet-media-time">1:30</span>
                  </div>
                )}
                <div className="tweet-actions">
                  <span className="tweet-action reply">
                    <ReplyIcon /> {p.stats[0]}
                  </span>
                  <span className="tweet-action repost">
                    <RepostIcon /> {p.stats[1]}
                  </span>
                  <span className="tweet-action like">
                    <LikeIcon /> {p.stats[2]}
                  </span>
                  <span className="tweet-action views">
                    <ViewsIcon /> {p.stats[3]}
                  </span>
                </div>
              </div>
            </div>
            <div className="feed-notes">
              {entriesOf(copy.demoFeed.posts[p.id].notes).map(([id, text]) => (
                <div key={id} className={`feed-note ${NOTE_KINDS[id]}`}>
                  <span className="feed-note-arrow">↳</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
      <Reveal delay={0.2}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.demoFeed.note}
        </p>
      </Reveal>
    </Section>
  )
}

type SimActionId = keyof Copy['actionEffects']['shortActions']

const SIM_ACTIONS: { id: SimActionId; weight: number; kind: 'good' | 'bad' }[] = [
  { id: 'like', weight: 0.5, kind: 'good' },
  { id: 'reply', weight: 5, kind: 'good' },
  { id: 'copyLink', weight: 20, kind: 'good' },
  { id: 'notInterested', weight: -43.2, kind: 'bad' },
  { id: 'mute', weight: -58.8, kind: 'bad' },
  { id: 'report', weight: -234, kind: 'bad' },
]

type TopicId = keyof Copy['actionEffects']['topics']

// Muting an author also costs every other post on the same topic.
const MUTED_ADJACENT = -5

const TOPIC_RULES: [TopicId, RegExp][] = [
  ['rust', /\brust\b|rustlang|cargo|borrow checker/i],
  ['ai', /\bai\b|vibe.?cod|agent|llm|prompt|grok|claude|chatgpt|copilot|inference|coding is solved/i],
  ['careers', /hiring|interview|junior|senior|resume|leetcode|faang|career|salary|recruiter|job/i],
  ['systems', /c\+\+|kernel|compiler|llvm|mojo|segfault|tcp|assembly|\bzig\b|\bgit\b|low.?level/i],
  ['infra', /kubernetes|k8s|vps|docker|devops|server|database|sql|redis|postgres|grpc|scalab|cloudflare/i],
  ['webdev', /react|javascript|typescript|css|frontend|next\.?js|tailwind|node\b|fullstack|full.?stack/i],
]

function topicOf(text: string): TopicId {
  for (const [topic, re] of TOPIC_RULES) if (re.test(text)) return topic
  return 'hotTakes'
}

function truncate(s: string, n: number): string {
  const flat = s.replace(/\s+/g, ' ').trim()
  return flat.length > n ? `${flat.slice(0, n - 1).trimEnd()}…` : flat
}

type RealTweet = {
  name: string
  handle: string
  text: string
  date: string
  likes: number
  replies: number
  reposts: number
  views: number
  url?: string
  avatar?: string
}

const FALLBACK_TWEET: RealTweet = {
  name: 'Tech Takes',
  handle: '@techtakes',
  text: 'Hot take: standups are just meetings where everyone lies for 15 minutes.',
  date: '',
  likes: 4200,
  replies: 310,
  reposts: 180,
  views: 291000,
  url: '',
}

const REAL_TWEETS: RealTweet[] =
  (realTweets as RealTweet[]).length > 0 ? (realTweets as RealTweet[]) : [FALLBACK_TWEET]

const AVATAR_COLORS = ['#6b5b95', '#2a9d8f', '#1d6fa3', '#b5651d', '#7d5ba6', '#3a7d44', '#a34a6f']

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function colorOf(handle: string): string {
  let h = 0
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function Avatar({
  name,
  handle,
  src,
  size = 40,
}: {
  name: string
  handle: string
  src?: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const dim = { width: size, height: size, fontSize: size * 0.36 }
  if (!src || failed) {
    return (
      <div className="tweet-avatar" style={{ background: colorOf(handle), ...dim }}>
        {initialsOf(name)}
      </div>
    )
  }
  return (
    <img
      className="tweet-avatar"
      src={src}
      alt={name}
      style={dim}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  )
}

type SimPost = RealTweet & { topic: TopicId }

const CLASSIFIED: SimPost[] = REAL_TWEETS.map((t) => ({ ...t, topic: topicOf(t.text) }))

function keyOf(p: SimPost): string {
  return p.url || `${p.handle}-${p.text.slice(0, 24)}`
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A fresh random draw on every page load: 4 today posts with distinct topics
// and authors, plus a candidate pool of at most 4 posts per topic.
function drawSim(): { today: SimPost[]; pool: SimPost[] } {
  const deck = shuffled(CLASSIFIED)
  const today: SimPost[] = []
  const topics = new Set<string>()
  const authors = new Set<string>()
  for (const t of deck) {
    if (today.length >= 4) break
    if (topics.has(t.topic) || authors.has(t.handle)) continue
    topics.add(t.topic)
    authors.add(t.handle)
    today.push(t)
  }

  const todayKeys = new Set(today.map(keyOf))
  const perTopic: Record<string, number> = {}
  const pool: SimPost[] = []
  for (const t of deck) {
    if (todayKeys.has(keyOf(t))) continue
    perTopic[t.topic] = (perTopic[t.topic] ?? 0) + 1
    if (perTopic[t.topic] > 4) continue
    pool.push(t)
  }
  return { today, pool }
}

export function ActionEffects() {
  const copy = useCopy()
  const { num, signed } = useFormat()
  const [acts, setActs] = useState<Record<string, SimActionId[]>>({})
  const [{ today, pool }] = useState(drawSim)

  // Preload all avatars once so re-ranking is instant.
  useEffect(() => {
    for (const t of CLASSIFIED) {
      if (!t.avatar) continue
      const img = new Image()
      img.src = t.avatar
    }
  }, [])

  const toggle = (postKey: string, action: SimActionId) => {
    setActs((prev) => {
      const current = prev[postKey] ?? []
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action]
      return { ...prev, [postKey]: next }
    })
  }

  const sim = useMemo(() => {
    const topicSum: Partial<Record<TopicId, number>> = {}
    const topicChips: Partial<Record<TopicId, { label: string; w: number }[]>> = {}
    const mutedAuthors = new Set<string>()
    const dimTopics = new Set<TopicId>()
    const reportedTopics = new Set<TopicId>()

    for (const post of today) {
      const taken = acts[keyOf(post)] ?? []
      for (const id of taken) {
        const def = SIM_ACTIONS.find((a) => a.id === id)!
        if (id === 'mute') {
          mutedAuthors.add(post.handle)
          dimTopics.add(post.topic)
        } else if (id === 'report') {
          reportedTopics.add(post.topic)
        } else {
          topicSum[post.topic] = (topicSum[post.topic] ?? 0) + def.weight
          topicChips[post.topic] = [
            ...(topicChips[post.topic] ?? []),
            { label: copy.actionEffects.shortActions[def.id].toLowerCase(), w: def.weight },
          ]
        }
      }
    }

    const ranked = pool.filter(
      (p) => !mutedAuthors.has(p.handle) && !reportedTopics.has(p.topic)
    )
      .map((p) => ({
        ...p,
        dimmed: dimTopics.has(p.topic),
        chips: topicChips[p.topic] ?? [],
        score:
          Math.log10(p.likes + 1) +
          (topicSum[p.topic] ?? 0) +
          (dimTopics.has(p.topic) ? MUTED_ADJACENT : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)

    const interests = entriesOf<TopicId, number>(topicSum)
      .filter(([t, s]) => s !== 0 && !reportedTopics.has(t))
      .map(([t, s]) => {
        const label = copy.actionEffects.topics[t]
        return s >= 20 ? `${label} ↑↑` : s > 0 ? `${label} ↑` : s <= -40 ? `${label} ↓↓` : `${label} ↓`
      })

    const parts: string[] = []
    if (interests.length > 0) parts.push(copy.actionEffects.summary.interests(interests.join(', ')))
    if (mutedAuthors.size > 0) parts.push(copy.actionEffects.summary.muted(mutedAuthors.size))
    if (reportedTopics.size > 0)
      parts.push(
        copy.actionEffects.summary.reported(
          [...reportedTopics].map((t) => copy.actionEffects.topics[t]).join(', '),
        ),
      )
    const summary = parts.join(', ') || copy.actionEffects.summary.idle

    return { ranked, summary }
  }, [acts, today, pool, copy])

  return (
    <Section theme="light">
      <Reveal>
        <h2 className="display">
          {copy.actionEffects.title} <span className="dim">{copy.actionEffects.titleDim}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lede">{copy.actionEffects.lede}</p>
      </Reveal>

      <div className="sim-grid" style={{ marginTop: 48 }}>
        <div>
          <span className="sim-heading mono">{copy.actionEffects.today}</span>
          {today.map((post) => {
            const taken = acts[keyOf(post)] ?? []
            return (
              <div className="sim-card" key={keyOf(post)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Avatar name={post.name} handle={post.handle} src={post.avatar} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      className="tweet-link"
                      href={post.url || undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{post.name}</span>
                        <span className="mono" style={{ fontSize: 11, opacity: 0.45 }}>
                          {post.handle}
                        </span>
                        <span className="sim-topic mono">
                          {copy.actionEffects.topics[post.topic]}
                        </span>
                      </div>
                      <p style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.45 }}>
                        {truncate(post.text, 140)}
                      </p>
                    </a>
                  </div>
                </div>
                <div className="sim-actions">
                  {SIM_ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      className={`fx-btn ${a.kind} ${taken.includes(a.id) ? 'active' : ''}`}
                      onClick={() => toggle(keyOf(post), a.id)}
                    >
                      {copy.actionEffects.shortActions[a.id]}{' '}
                      <span style={{ opacity: 0.55 }}>{signed(a.weight)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div>
          <span className="sim-heading mono">{copy.actionEffects.tomorrow}</span>
          <div className="sim-feed">
            <AnimatePresence initial={false}>
              {sim.ranked.map((p, i) => (
                <motion.div
                  layout
                  key={keyOf(p)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: p.dimmed ? 0.45 : 1, scale: 1 }}
                  exit={{ opacity: 0, x: 56, scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="sim-row"
                >
                  <span className="mono" style={{ opacity: 0.35, fontSize: 11, width: 14 }}>
                    {i + 1}
                  </span>
                  <Avatar name={p.name} handle={p.handle} src={p.avatar} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      className="tweet-link"
                      href={p.url || undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</span>
                        <span className="sim-topic mono">{copy.actionEffects.topics[p.topic]}</span>
                      </div>
                      <p style={{ fontSize: 12.5, lineHeight: 1.4, opacity: 0.75, marginTop: 2 }}>
                        {truncate(p.text, 80)}
                      </p>
                    </a>
                    {(p.chips.length > 0 || p.dimmed) && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                        {p.chips.map((c, ci) => (
                          <span key={ci} className={`sim-chip ${c.w > 0 ? 'good' : 'bad'}`}>
                            {signed(c.w)} {c.label}
                          </span>
                        ))}
                        {p.dimmed && (
                          <span className="sim-chip bad">
                            {signed(MUTED_ADJACENT)} {copy.actionEffects.mutedAdjacent}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 11.5, opacity: p.score >= 0 ? 0.8 : 0.5, whiteSpace: 'nowrap' }}
                  >
                    {p.score >= 0 ? '+' : ''}
                    {num(p.score, { digits: 1 })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {sim.ranked.length === 0 && (
              <p className="small mono" style={{ padding: 24, opacity: 0.5 }}>
                {copy.actionEffects.emptyFeed}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sim-summary">
        <span className="sim-heading mono" style={{ marginBottom: 0 }}>
          {copy.actionEffects.learned}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={sim.summary}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mono"
            style={{ fontSize: 13, marginTop: 8 }}
          >
            {sim.summary}
          </motion.p>
        </AnimatePresence>
      </div>

      <Reveal delay={0.2}>
        <p className="small" style={{ marginTop: 24 }}>
          {copy.actionEffects.note}
        </p>
      </Reveal>
    </Section>
  )
}
