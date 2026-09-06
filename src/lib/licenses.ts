import { createClient } from '@supabase/supabase-js'

export interface LicenseRecord {
  licenseKey: string
  email: string
  plan: string
  sessionId: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// License repository.
//
// Held a buyer actually gave money for, so this deliberately fails CLOSED:
// no Supabase configured -> no license. Unlike the user store, a license that
// evaporates on restart is worthless.
// ---------------------------------------------------------------------------

const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

// Unambiguous alphabet: no 0/O/1/I, no punctuation. Readable out loud over
// a support call. Format: DS-XXXXX-XXXXX-XXXXX
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomChars(count: number): string {
  const bytes = new Uint8Array(count)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < count; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

export function generateLicenseKey(): string {
  const g = (n: number) => randomChars(n)
  return `DS-${g(5)}-${g(5)}-${g(5)}`
}

export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase()
}

// Creates a license, idempotently for a given checkout id (Paddle transaction
// id). Returns the license record, or null if unavailable.
export async function createLicense(input: {
  email: string
  sessionId: string
  plan?: string
}): Promise<LicenseRecord | null> {
  if (!isSupabaseConfigured) {
    console.error('License create failed: Supabase not configured')
    return null
  }

  const existing = await findLicenseBySession(input.sessionId)
  if (existing) return existing

  const record: LicenseRecord = {
    licenseKey: generateLicenseKey(),
    email: input.email.trim().toLowerCase(),
    plan: input.plan ?? 'lifetime',
    sessionId: input.sessionId,
    createdAt: new Date().toISOString(),
  }

  const { error } = await getSupabaseClient()
    .from('licenses')
    .insert({
      license_key: record.licenseKey,
      email: record.email,
      plan: record.plan,
      session_id: record.sessionId,
    })

  if (error) {
    console.error('License create error:', error)
    return null
  }
  return record
}

export async function findLicenseBySession(
  sessionId: string,
): Promise<LicenseRecord | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await getSupabaseClient()
    .from('licenses')
    .select('license_key, email, plan, session_id, created_at')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error || !data) return null
  return {
    licenseKey: data.license_key,
    email: data.email,
    plan: data.plan,
    sessionId: data.session_id,
    createdAt: data.created_at,
  }
}

// Validates a raw license key string (format only). Used for buyer support:
// 'DS-XXXXX-XXXXX-XXXXX'
export function isValidLicenseFormat(key: string): boolean {
  return /^DS-[A-HJKMNP-Z2-9]{5}-[A-HJKMNP-Z2-9]{5}-[A-HJKMNP-Z2-9]{5}$/.test(
    normalizeLicenseKey(key),
  )
}