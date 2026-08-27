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
import { fetchNpmLicense, mapWithConcurrency } from "@/lib/scanner/npm-registry"
import { detectRepositoryLicense } from "@/lib/scanner/repo-license"
import type { DependencyLicense, LicenseScanResult } from "@/lib/scanner/types"

const NPM_MANIFESTS = new Set(["package.json", "pnpm-lock.yaml", "package-lock.json"])

async function resolveDependencies(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ dependencies: ParsedDependency[]; manifestFiles: string[]; usesNpm: boolean }> {
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
    usesNpm: manifestFiles.some((file) => NPM_MANIFESTS.has(file)),
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
    repoLicense = await detectRepositoryLicense(octokit, owner, repo)
  } catch {
    issues.push("Could not fetch repository license metadata from GitHub.")
  }

  const { dependencies, manifestFiles, usesNpm } = await resolveDependencies(octokit, owner, repo)

  if (manifestFiles.length === 0) {
    issues.push("No supported manifest or lock files found in the repository root.")
  }

  onProgress?.(25, `Checking ${dependencies.length} dependencies...`)

  const licenseResults = await mapWithConcurrency(
    dependencies,
    async (dep, index) => {
      let license: string | null = null

      if (usesNpm) {
        license = await fetchNpmLicense(dep.name, dep.version)
      }

      const category = categorizeLicense(license)
      const compliant = isLicenseCompliant(license, allowedLicenses)

      const licenseProgress = 25 + Math.round(((index + 1) / dependencies.length) * 35)
      onProgress?.(licenseProgress, `Checked ${dep.name}`)

      return {
        name: dep.name,
        version: dep.version,
        license,
        category,
        compliant,
      } satisfies DependencyLicense
    },
    20
  )

  licenseResults.sort((a, b) => {
    if (a.compliant !== b.compliant) {
      return a.compliant ? 1 : -1
    }
    return a.name.localeCompare(b.name)
  })

  const unknown = licenseResults.filter((dep) => !dep.license)
  const nonCompliant = licenseResults.filter((dep) => dep.license && !dep.compliant)

  if (nonCompliant.length > 0) {
    issues.push(
      `${nonCompliant.length} dependenc${nonCompliant.length === 1 ? "y uses" : "ies use"} non-compliant or restrictive licenses.`
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
