import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('hashPassword', () => {
  it('hashes a password with the expected prefix', async () => {
    const hash = await hashPassword('p@ssword-123')
    expect(hash).toMatch(/^pbkdf2\$210000\$/)
  })

  it('produces a different hash each time (random salt)', async () => {
    const a = await hashPassword('same-password')
    const b = await hashPassword('same-password')
    expect(a).not.toBe(b)
  })
})

describe('verifyPassword', () => {
  it('accepts the correct password', async () => {
    const hash = await hashPassword('correct-horse')
    expect(await verifyPassword('correct-horse', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct-horse')
    expect(await verifyPassword('wrong-horse', hash)).toBe(false)
  })

  it('rejects a malformed stored hash', async () => {
    expect(await verifyPassword('x', 'not-a-valid-format')).toBe(false)
    expect(await verifyPassword('x', 'bcrypt$foo$bar$baz$qux')).toBe(false)
  })
})
