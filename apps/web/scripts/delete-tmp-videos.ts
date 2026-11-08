import { execFileSync } from 'node:child_process'

const BUCKET = 'slogodle-videos-tmp'
const keys = process.argv.slice(2)

if (keys.length === 0) {
  console.error('Usage: pnpm delete:tmp:videos <key> [<key> …]')
  process.exit(1)
}

let failed = 0
for (const key of keys) {
  try {
    execFileSync(
      'npx',
      ['wrangler', 'r2', 'object', 'delete', `${BUCKET}/${key}`, '--remote'],
      { stdio: 'inherit' },
    )
  } catch {
    failed++
    console.error(`Failed to delete ${key}`)
  }
}

if (failed > 0) process.exit(1)
