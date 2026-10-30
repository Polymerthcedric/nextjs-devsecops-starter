// Builds the buyer deliverable: a tarball of every git-tracked file.
//
// The tracked set is exactly the product (source, schema, deploy pipeline) and
// by construction contains no secrets: .env.* are not tracked except the
// example, and build artifacts / node_modules / .github? are omitted.
//
// Output: .deliverable/starter.tar.gz, kept out of the public static tree so
// it can only ever be served by the license-checked /api/download route.

import { execSync } from 'node:child_process'
import { mkdirSync, statSync, readFileSync, copyFileSync, existsSync } from 'node:fs'
import { createWriteStream } from 'node:fs'
import { spawn } from 'node:child_process'

const root = process.cwd()
const outDir = `${root}/.deliverable`
const outFile = `${outDir}/starter.tar.gz`

mkdirSync(outDir, { recursive: true })

// Vercel CLI deployments ship no .git, so `git ls-files` is unavailable mid
// build. Try it first (local builds); fall back to the vendored output of the
// same command committed at scripts/deliverable-files.txt.
const FALLBACK_LIST = `${root}/scripts/deliverable-files.txt`

function trackedFiles() {
  let files = []
  try {
    files = execSync('git ls-files', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
      .split('\n')
  } catch {
    // Use the explicit product manifest in deploy environments without .git.
  }
  const manifestFiles = readFileSync(FALLBACK_LIST, 'utf8').trim().split('\n')
  // Include manifest entries in local builds too, so newly added deliverable
  // files are packaged before their changes have been committed.
  return [...new Set([...files, ...manifestFiles])]
    .filter(Boolean)
    .filter((f) => f !== 'scripts/deliverable-files.txt')
}

// Vercel CLI uploads strip `.env*` files, so the tracked .env.example is
// missing in deploy builds. Restore it from the vendored sample so the
// shipped tarball keeps `cp .env.example .env.local` working for buyers.
const ENV_SAMPLE = `${root}/scripts/env.example.sample`
if (!existsSync(`${root}/.env.example`) && existsSync(ENV_SAMPLE)) {
  copyFileSync(ENV_SAMPLE, `${root}/.env.example`)
}

// git ls-files lists exactly the tracked deliverable, with relative paths.
// Upload-stripped files (e.g. .env*) may not exist on disk; skip them so tar
// never exits nonzero over a missing member.
const files = trackedFiles().filter((f) => existsSync(`${root}/${f}`))

if (files.length === 0) {
  console.error('[deliverable] no tracked files; aborting')
  process.exit(1)
}

const listFile = `${outDir}/filelist.txt`
const writeStream = createWriteStream(listFile)
for (const f of files) writeStream.write(`${f}\n`)
writeStream.end()
await new Promise((resolve) => writeStream.on('close', resolve))

const tar = spawn('tar', ['-czf', outFile, '-T', listFile], { cwd: root })
await new Promise((resolve, reject) => {
  tar.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`tar exited ${code}`))))
  tar.on('error', reject)
})

const size = statSync(outFile).size
console.log(`[deliverable] ${files.length} files -> ${outFile} (${(size / 1024).toFixed(0)} KiB)`)
