// The source dictionary. Every other locale is typed against this object, so a
// missing or extra key is a compile error.
export const en = {
  nav: {
    brand: 'insidetheforyou',
    scoring: 'Scoring',
    feed: 'Feed',
    playground: 'Playground',
    deepDive: 'Deep dive',
    devin: 'Built with Devin',
    language: 'Language',
  },
  footer: {
    brand: 'INSIDETHEFORYOU',
    sourceCode: 'Source code ↗',
    deepWiki: 'DeepWiki ↗',
    devin: 'Built with Devin ↗',
    note: 'The weights and behaviors on this page come from the open-source X algorithm repository (August 2026 snapshot). The values change over time as X runs experiments.',
  },
}

export type Copy = typeof en
