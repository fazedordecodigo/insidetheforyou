// Renders scripts/og-card.html into public/og-card.png, the image every locale's
// og:image points at (src/i18n/head.ts). Run it after editing the card's markup,
// so the committed PNG cannot drift from its source:
//
//   npm run og:card
//
// The render is offline and deterministic: the card's fonts are vendored in
// scripts/fonts/, so the same markup always produces the same bytes.
//
// Chrome is not a dependency of this project; set CHROME_PATH if the binary is not
// in one of the usual places.
import { execFileSync } from 'node:child_process'
import { accessSync, copyFileSync, mkdtempSync, rmSync, constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SIZE = '1200,630'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'scripts/og-card.html')
const TARGET = join(ROOT, 'public/og-card.png')

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
      // The fonts are local, but `font-display: block` still needs a frame or two to
      // swap them in; without this the capture can land on the fallback face.
      '--virtual-time-budget=5000',
      pathToFileURL(SOURCE).href,
    ],
    { stdio: 'inherit' }
  )
  copyFileSync(shot, TARGET)
  console.log(`wrote ${TARGET} (${SIZE.replace(',', '×')})`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
