// Renders scripts/og-card.html into public/og-card.png, the image every locale's
// og:image points at (src/i18n/head.ts). Run it after editing the card's markup,
// so the committed PNG cannot drift from its source:
//
//   npm run og:card
//
// Chrome is not a dependency of this project; set CHROME_PATH if the binary is not
// in one of the usual places.
import { execFileSync } from 'node:child_process'
import { accessSync, copyFileSync, mkdtempSync, rmSync, constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const SIZE = '1200,630'
const SOURCE = resolve('scripts/og-card.html')
const TARGET = resolve('public/og-card.png')

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

function findChrome() {
  for (const candidate of CANDIDATES) {
    if (!candidate) continue
    try {
      accessSync(candidate, constants.X_OK)
      return candidate
    } catch {
      /* try the next one */
    }
  }
  throw new Error(`no Chrome binary found; set CHROME_PATH (tried: ${CANDIDATES.filter(Boolean).join(', ')})`)
}

// Chrome writes the screenshot to the current directory when given a bare name and
// overwrites nothing else, so it renders into a scratch directory first.
const chrome = findChrome()
const scratch = mkdtempSync(join(tmpdir(), 'og-card-'))
const shot = join(scratch, 'og-card.png')

try {
  execFileSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${SIZE}`,
      `--screenshot=${shot}`,
      // The card loads Google Fonts, so give the network time to answer before the
      // frame is captured; without it the screenshot can land on fallback fonts.
      '--virtual-time-budget=5000',
      `file://${SOURCE}`,
    ],
    { stdio: 'inherit' }
  )
  copyFileSync(shot, TARGET)
  console.log(`wrote ${TARGET} (${SIZE.replace(',', '×')})`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
