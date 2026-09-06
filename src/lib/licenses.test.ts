import { describe, it, expect } from 'vitest'
import {
  generateLicenseKey,
  isValidLicenseFormat,
  normalizeLicenseKey,
} from './licenses'

describe('license key generation', () => {
  it('produces the DS-XXXXX-XXXXX-XXXXX format', () => {
    const key = generateLicenseKey()
    expect(key).toMatch(/^DS-[A-HJKMNP-Z2-9]{5}-[A-HJKMNP-Z2-9]{5}-[A-HJKMNP-Z2-9]{5}$/)
  })

  it('produces a different key each time', () => {
    expect(generateLicenseKey()).not.toBe(generateLicenseKey())
    expect(generateLicenseKey()).not.toBe(generateLicenseKey())
  })

  it('never collides across 1000 generations', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const key = generateLicenseKey()
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})

describe('isValidLicenseFormat', () => {
  it('accepts valid keys in mixed case', () => {
    expect(isValidLicenseFormat('DS-ABCDE-FGHJK-MNPQR')).toBe(true)
    expect(isValidLicenseFormat('ds-abcde-fghjk-mnpqr')).toBe(true)
  })

  it('rejects malformed keys', () => {
    expect(isValidLicenseFormat('ABC-12345-12345-12345')).toBe(false)
    expect(isValidLicenseFormat('DS-1234-12345-12345')).toBe(false)
    expect(isValidLicenseFormat('DS-12345-12345-1234')).toBe(false)
    expect(isValidLicenseFormat('')).toBe(false)
  })
})

describe('normalizeLicenseKey', () => {
  it('trims and uppercases', () => {
    expect(normalizeLicenseKey('  ds-abcde-fghjk-mnpqr  ')).toBe(
      'DS-ABCDE-FGHJK-MNPQR',
    )
  })
})