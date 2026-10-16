// PBKDF2 password hashing using the Web Crypto API.
// Web Crypto based and dependency-free: no bcrypt/argon2 native modules,
// so this boilerplate still runs on any free-tier runtime.
//
// Format: pbkdf2$<iterations>$<saltB64>$<hashB64>

const ITERATIONS = 210_000

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function hashPassword(
  password: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(password, salt)
  const hash = await crypto.subtle.exportKey('raw', key)
  return `pbkdf2$${ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(
    new Uint8Array(hash),
  )}`
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  const salt = base64ToBytes(parts[2])
  const expected = base64ToBytes(parts[3])

  const key = await deriveKey(password, salt, iterations)
  const hash = new Uint8Array(await crypto.subtle.exportKey('raw', key))

  if (hash.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < hash.length; i++) {
    mismatch |= hash[i] ^ expected[i]
  }
  return mismatch === 0
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = ITERATIONS,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    material,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  )
}
