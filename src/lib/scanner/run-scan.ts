import { z } from "zod"

import { createGitHubClient } from "@/lib/github/client"
import { parseGitHubRepo } from "@/lib/github/parse-repo"
import { scanLicenses } from "@/lib/scanner/license-scanner"
import { DEFAULT_ALLOWED_LICENSES } from "@/lib/scanner/licenses"
import { scanSecrets } from "@/lib/scanner/secret-scanner"
import type { ScanProgressUpdate, ScanResult } from "@/lib/scanner/types"

export const scanRequestSchema = z.object({
  repo: z.string().min(1, "Repository is required"),
  token: z.string().optional(),
  scanLicense: z.boolean().default(true),
  scanSecrets: z.boolean().default(true),
  commitLimit: z.number().int().min(1).max(100).default(30),
  allowedLicenses: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
})

export type ScanRequest = z.infer<typeof scanRequestSchema>

export async function runScan(
  input: ScanRequest,
  onProgress?: (update: ScanProgressUpdate) => void
): Promise<ScanResult> {
  const parsed = scanRequestSchema.parse(input)
  const repoInfo = parseGitHubRepo(parsed.repo)

  if (!repoInfo) {
    throw new Error("Invalid repository. Use owner/repo or a GitHub URL.")
  }

  onProgress?.({ progress: 5, message: "Validating repository..." })

  const { owner, repo } = repoInfo
  const octokit = createGitHubClient(parsed.token)
  const errors: string[] = []

  onProgress?.({ progress: 10, message: "Connecting to GitHub..." })

  try {
    await octokit.repos.get({ owner, repo })
  } catch {
    throw new Error(
      "Repository not found or inaccessible. Check the URL and provide a token for private repos."
    )
  }

  onProgress?.({ progress: 15, message: "Repository found" })

  const allowedLicenses = parsed.allowedLicenses ?? DEFAULT_ALLOWED_LICENSES

  let license = null
  let secrets = null

  if (parsed.scanLicense) {
    try {
      onProgress?.({ progress: 20, message: "Reading dependency manifests..." })
      license = await scanLicenses(octokit, owner, repo, allowedLicenses, (progress, message) => {
        onProgress?.({ progress, message })
      })
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "License scan failed unexpectedly."
      )
    }
  }

  if (parsed.scanSecrets) {
    try {
      onProgress?.({ progress: 60, message: "Fetching commit history..." })
      secrets = await scanSecrets(octokit, owner, repo, parsed.commitLimit, (progress, message) => {
        onProgress?.({ progress, message })
      })
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Secret scan failed unexpectedly."
      )
    }
  }

  onProgress?.({ progress: 100, message: "Scan complete" })

  return {
    repo: `${owner}/${repo}`,
    owner,
    name: repo,
    scannedAt: new Date().toISOString(),
    license,
    secrets,
    errors,
  }
}
