import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const envPath = '.env.local'
const examplePath = '.env.example'

if (existsSync(envPath)) {
  const current = readFileSync(envPath, 'utf8')
  const sessionSecret = current.match(/^SESSION_SECRET=(.*)$/m)?.[1]?.trim()
  if (sessionSecret && !sessionSecret.includes('generate-a-secure-random-string-here')) {
    console.log(`${envPath} already exists and has a SESSION_SECRET; leaving it unchanged.`)
  } else {
    console.error(`${envPath} already exists but SESSION_SECRET is missing or still a placeholder.`)
    console.error('Set SESSION_SECRET manually. The existing file was not changed.')
    process.exit(1)
  }
} else {
  if (!existsSync(examplePath)) {
    console.error(`${examplePath} is missing. Restore it before initializing the project.`)
    process.exit(1)
  }

  const secret = randomBytes(32).toString('base64url')
  const example = readFileSync(examplePath, 'utf8')
  if (!/^SESSION_SECRET=.*$/m.test(example)) {
    console.error(`${examplePath} does not define SESSION_SECRET; cannot create local config.`)
    process.exit(1)
  }

  writeFileSync(envPath, example.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`), {
    flag: 'wx',
    mode: 0o600,
  })
  console.log(`Created ${envPath} with a fresh SESSION_SECRET.`)
}

console.log('Review the Supabase, Upstash, Paddle, and APP_HOST settings before enabling those services.')
console.log('Start the app with: npm run dev')
