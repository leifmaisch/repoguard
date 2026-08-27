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
])

const WEAK_COPYLEFT = new Set(["LGPL-2.0", "LGPL-2.1", "LGPL-3.0", "MPL-2.0", "EPL-2.0"])

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
]

function normalizeLicense(license: string): string {
  return license
    .replace(/[()]/g, "")
    .split(/\s+OR\s+|\s+AND\s+/i)[0]
    .trim()
    .toUpperCase()
}

export function categorizeLicense(license: string | null): LicenseCategory {
  if (!license || license === "UNKNOWN" || license === "UNLICENSED") {
    return license === "UNLICENSED" ? "proprietary" : "unknown"
  }

  const normalized = normalizeLicense(license)

  if (PERMISSIVE.has(normalized)) {
    return "permissive"
  }
  if (WEAK_COPYLEFT.has(normalized)) {
    return "weak-copyleft"
  }
  if (COPYLEFT.has(normalized)) {
    return "copyleft"
  }
  if (normalized.includes("GPL") || normalized.includes("AGPL")) {
    return "copyleft"
  }
  if (normalized.includes("LGPL") || normalized.includes("MPL")) {
    return "weak-copyleft"
  }

  return "unknown"
}

export function isLicenseCompliant(
  license: string | null,
  allowed: string[] = DEFAULT_ALLOWED_LICENSES
): boolean {
  if (!license) {
    return false
  }

  const normalized = normalizeLicense(license)
  const allowedSet = new Set(allowed.map((item) => normalizeLicense(item)))

  if (allowedSet.has(normalized)) {
    return true
  }

  const category = categorizeLicense(license)
  return category === "permissive"
}
