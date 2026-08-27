import type { Octokit } from "@octokit/rest"

import { fetchRepoFile } from "@/lib/github/client"
import {
  getManifestFileNames,
  parsePackageJson,
  parsePackageLock,
  parsePnpmLock,
  parseRequirementsTxt,
  type ParsedDependency,
} from "@/lib/scanner/dependency-parser"
import {
  categorizeLicense,
  DEFAULT_ALLOWED_LICENSES,
  isLicenseCompliant,
} from "@/lib/scanner/licenses"
import type { DependencyLicense, LicenseScanResult } from "@/lib/scanner/types"

async function fetchNpmLicense(name: string, version: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(name)
    const url =
      version && version !== "*"
        ? `https://registry.npmjs.org/${encoded}/${version}`
        : `https://registry.npmjs.org/${encoded}/latest`

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      license?: string | { type?: string }
      licenses?: Array<string | { type?: string }>
    }

    if (typeof data.license === "string") {
      return data.license
    }
    if (data.license && typeof data.license === "object" && data.license.type) {
      return data.license.type
    }
    if (Array.isArray(data.licenses) && data.licenses.length > 0) {
      const first = data.licenses[0]
      return typeof first === "string" ? first : (first.type ?? null)
    }

    return null
  } catch {
    return null
  }
}

async function resolveDependencies(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ dependencies: ParsedDependency[]; manifestFiles: string[] }> {
  const manifestFiles: string[] = []
  const dependencies = new Map<string, string>()

  for (const file of getManifestFileNames()) {
    const content = await fetchRepoFile(octokit, owner, repo, file)
    if (!content) continue

    manifestFiles.push(file)

    let parsed: ParsedDependency[] = []
    if (file === "package.json") {
      parsed = parsePackageJson(content)
    } else if (file === "pnpm-lock.yaml") {
      parsed = parsePnpmLock(content)
    } else if (file === "package-lock.json") {
      parsed = parsePackageLock(content)
    } else if (file === "requirements.txt") {
      parsed = parseRequirementsTxt(content)
    }

    for (const dep of parsed) {
      dependencies.set(dep.name, dep.version)
    }
  }

  return {
    manifestFiles,
    dependencies: Array.from(dependencies.entries()).map(([name, version]) => ({
      name,
      version,
    })),
  }
}

export async function scanLicenses(
  octokit: Octokit,
  owner: string,
  repo: string,
  allowedLicenses: string[] = DEFAULT_ALLOWED_LICENSES,
  onProgress?: (progress: number, message: string) => void
): Promise<LicenseScanResult> {
  const issues: string[] = []

  let repoLicense: string | null = null
  try {
    const { data } = await octokit.repos.get({ owner, repo })
    repoLicense = data.license?.spdx_id ?? null
  } catch {
    issues.push("Could not fetch repository license metadata from GitHub.")
  }

  const { dependencies, manifestFiles } = await resolveDependencies(octokit, owner, repo)

  if (manifestFiles.length === 0) {
    issues.push("No supported manifest or lock files found in the repository root.")
  }

  onProgress?.(25, `Checking ${dependencies.length} dependencies...`)

  const licenseResults: DependencyLicense[] = []

  for (let index = 0; index < dependencies.length; index++) {
    const dep = dependencies[index]
    let license: string | null = null

    if (!dep.name.startsWith("@") && !dep.name.includes("/")) {
      license = await fetchNpmLicense(dep.name, dep.version)
    }

    const category = categorizeLicense(license)
    const compliant = isLicenseCompliant(license, allowedLicenses)

    licenseResults.push({
      name: dep.name,
      version: dep.version,
      license,
      category,
      compliant,
    })

    if (dependencies.length > 0) {
      const licenseProgress = 25 + Math.round(((index + 1) / dependencies.length) * 35)
      onProgress?.(licenseProgress, `Checked ${dep.name}`)
    }
  }

  licenseResults.sort((a, b) => {
    if (a.compliant !== b.compliant) {
      return a.compliant ? 1 : -1
    }
    return a.name.localeCompare(b.name)
  })

  const nonCompliant = licenseResults.filter((dep) => !dep.compliant)
  const unknown = licenseResults.filter((dep) => dep.category === "unknown")

  if (nonCompliant.length > 0) {
    issues.push(
      `${nonCompliant.length} dependenc${nonCompliant.length === 1 ? "y" : "ies"} use non-compliant or restrictive licenses.`
    )
  }

  if (unknown.length > 0) {
    issues.push(
      `${unknown.length} dependenc${unknown.length === 1 ? "y has" : "ies have"} unknown license metadata.`
    )
  }

  return {
    repoLicense,
    repoLicenseCompliant: isLicenseCompliant(repoLicense, allowedLicenses),
    manifestFiles,
    dependencies: licenseResults,
    summary: {
      total: licenseResults.length,
      compliant: licenseResults.filter((dep) => dep.compliant).length,
      nonCompliant: nonCompliant.length,
      unknown: unknown.length,
    },
    issues,
  }
}
