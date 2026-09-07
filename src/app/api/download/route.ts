import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { findLicenseByKey, isValidLicenseFormat } from '@/lib/licenses'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Serves the buyer deliverable (a tarball of the product source) only after
// a valid license key is presented. Reads the tarball the build produced in
// .deliverable/, which is excluded from the public static tree.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const licenseKey = (searchParams.get('key') ?? '').trim()

  if (!isValidLicenseFormat(licenseKey)) {
    return NextResponse.json(
      { error: 'That does not look like a license key. Format: DS-XXXXX-XXXXX-XXXXX' },
      { status: 400 },
    )
  }

  const license = await findLicenseByKey(licenseKey)
  if (!license) {
    return NextResponse.json(
      { error: 'No license found for that key. Check you copied it from your payment receipt.' },
      { status: 404 },
    )
  }

  let tarball: Buffer
  try {
    tarball = await readFile(join(process.cwd(), '.deliverable/starter.tar.gz'))
  } catch {
    return NextResponse.json(
      { error: 'The package is not ready yet. Try again in a minute.' },
      { status: 503 },
    )
  }

  return new NextResponse(tarball.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename="devsecops-starter.tar.gz"',
      'Cache-Control': 'private, no-store',
    },
  })
}