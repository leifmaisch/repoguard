import type { LicenseCategory } from "@/lib/scanner/types"

const PERMISSIVE = new Set([
  "MIT",
  "APACHE-2.0",
  "BSD-2-CLAUSE",
  "BSD-3-CLAUSE",
  "ISC",
  "0BSD",
  "UNLICENSE",
  "CC0-1.0",
  "CC-BY-4.0",
  "WTFPL",
  "ZLIB",
  "BSL-1.0",
  "BLUEOAK-1.0.0",
  "PYTHON-2.0",
])

const WEAK_COPYLEFT = new Set([
  "LGPL-2.0",
  "LGPL-2.1",
  "LGPL-3.0",
  "MPL-2.0",
  "EPL-2.0",
  "EPL-1.0",
])

const COPYLEFT = new Set([
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "AGPL-1.0",
  "SSPL-1.0",
  "OSL-3.0",
])

export const DEFAULT_ALLOWED_LICENSES = [
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "Unlicense",
  "CC0-1.0",
  "MPL-2.0",
]

export function splitLicenseExpression(license: string): string[] {
  return license
    .replace(/[()]/g, "")
    .split(/\s+(?:AND|OR)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function normalizeSingleLicense(license: string): string {
  return license
    .trim()
    .toUpperCase()
    .replace(/-OR-LATER$/, "")
}

function categorizeSingleLicense(license: string): LicenseCategory {
  const normalized = normalizeSingleLicense(license)

  if (PERMISSIVE.has(normalized)) {
    return "permissive"
  }
  if (WEAK_COPYLEFT.has(normalized)) {
    return "weak-copyleft"
  }
  if (COPYLEFT.has(normalized)) {
    return "copyleft"
  }
  if (normalized.includes("AGPL") || normalized.includes("GPL")) {
    return "copyleft"
  }
  if (normalized.includes("LGPL") || normalized.includes("MPL")) {
    return "weak-copyleft"
  }

  return "unknown"
}

const CATEGORY_RANK: Record<LicenseCategory, number> = {
  permissive: 0,
  unknown: 1,
  "weak-copyleft": 2,
  copyleft: 3,
  proprietary: 4,
}

export function categorizeLicense(license: string | null): LicenseCategory {
  if (!license || license === "UNKNOWN") {
    return "unknown"
  }
  if (license === "UNLICENSED") {
    return "proprietary"
  }

  const parts = splitLicenseExpression(license)
  let strictest: LicenseCategory = "permissive"

  for (const part of parts) {
    const category = categorizeSingleLicense(part)
    if (CATEGORY_RANK[category] > CATEGORY_RANK[strictest]) {
      strictest = category
    }
  }

  return strictest
}

function isSingleLicenseCompliant(
  license: string,
  allowed: string[]
): boolean {
  const normalized = normalizeSingleLicense(license)
  const allowedSet = new Set(allowed.map((item) => normalizeSingleLicense(item)))

  if (allowedSet.has(normalized)) {
    return true
  }

  return categorizeSingleLicense(license) === "permissive"
}

export function isLicenseCompliant(
  license: string | null,
  allowed: string[] = DEFAULT_ALLOWED_LICENSES
): boolean {
  if (!license) {
    return false
  }

  if (/\s+AND\s+/i.test(license)) {
    return license
      .split(/\s+AND\s+/i)
      .every((part) => isSingleLicenseCompliant(part.trim(), allowed))
  }

  if (/\s+OR\s+/i.test(license)) {
    return license
      .split(/\s+OR\s+/i)
      .some((part) => isSingleLicenseCompliant(part.trim(), allowed))
  }

  return isSingleLicenseCompliant(license, allowed)
}

export function isOptionalPlatformPackage(name: string): boolean {
  const patterns = [
    /^@img\/sharp-libvips-/,
    /^@img\/sharp-(darwin|linux|win32|freebsd|wasm32|webcontainers)/,
    /^lightningcss-(android|darwin|freebsd|linux|win32)/,
    /^@next\/swc-/,
    /^@esbuild\//,
    /^@tailwindcss\/oxide-/,
    /^@unrs\/resolver-binding-/,
  ]

  return patterns.some((pattern) => pattern.test(name))
}
