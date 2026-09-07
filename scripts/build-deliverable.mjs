// Builds the buyer deliverable: a tarball of every git-tracked file.
//
// The tracked set is exactly the product (source, schema, deploy pipeline) and
// by construction contains no secrets: .env.* are not tracked except the
// example, and build artifacts / node_modules / .github? are omitted.
//
// Output: .deliverable/starter.tar.gz, kept out of the public static tree so
// it can only ever be served by the license-checked /api/download route.

import { execSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { createWriteStream } from 'node:fs'
import { spawn } from 'node:child_process'

const root = process.cwd()
const outDir = `${root}/.deliverable`
const outFile = `${outDir}/starter.tar.gz`

mkdirSync(outDir, { recursive: true })

// git ls-files lists exactly the tracked deliverable, with relative paths.
const files = execSync('git ls-files', { cwd: root })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

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