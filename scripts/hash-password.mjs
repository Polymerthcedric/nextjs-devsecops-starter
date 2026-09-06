// CLI: generate a PBKDF2 password hash for a user record.
//   node scripts/hash-password.mjs <password>
// Output the hash, then put it in DEMO_USERS or seed your Supabase users table.

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 210_000,
      hash: 'SHA-256',
    },
    material,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  )
  const hash = new Uint8Array(await crypto.subtle.exportKey('raw', key))

  const b64 = (bytes) => {
    let binary = ''
    bytes.forEach((b) => {
      binary += String.fromCharCode(b)
    })
    return btoa(binary)
  }

  return `pbkdf2$210000$${b64(salt)}$${b64(hash)}`
}

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>')
  process.exit(1)
}

console.log(await hashPassword(password))
