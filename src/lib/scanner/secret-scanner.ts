import type { Octokit } from "@octokit/rest"

import {
  isLikelyFalsePositive,
  redactSecret,
  SECRET_RULES,
} from "@/lib/scanner/patterns"
import type { SecretFinding, SecretScanResult, Severity } from "@/lib/scanner/types"

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".zip",
  ".gz",
  ".tar",
  ".pdf",
  ".lock",
])

const SKIP_PATHS = [
  /node_modules\//,
  /vendor\//,
  /\.min\.js$/,
  /pnpm-lock\.yaml$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
]

function shouldSkipFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  if (SKIP_EXTENSIONS.has(lower.slice(lower.lastIndexOf(".")))) {
    return true
  }
  return SKIP_PATHS.some((pattern) => pattern.test(filename))
}

function scanLine(
  line: string,
  lineNumber: number,
  file: string,
  commitSha: string,
  commitMessage: string,
  commitDate: string
): SecretFinding[] {
  const findings: SecretFinding[] = []

  for (const rule of SECRET_RULES) {
    rule.pattern.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = rule.pattern.exec(line)) !== null) {
      const raw = match[1] ?? match[0]
      if (isLikelyFalsePositive(raw)) {
        continue
      }

      findings.push({
        id: `${commitSha}:${file}:${lineNumber}:${rule.id}`,
        rule: rule.name,
        severity: rule.severity,
        commitSha,
        commitMessage,
        commitDate,
        file,
        line: lineNumber,
        match: raw,
        redacted: redactSecret(raw),
      })
    }
  }

  return findings
}

function scanPatch(
  patch: string,
  file: string,
  commitSha: string,
  commitMessage: string,
  commitDate: string
): SecretFinding[] {
  const findings: SecretFinding[] = []
  let currentLine = 0

  for (const patchLine of patch.split("\n")) {
    if (patchLine.startsWith("@@")) {
      const match = patchLine.match(/\+(\d+)/)
      if (match) {
        currentLine = Number.parseInt(match[1], 10) - 1
      }
      continue
    }

    if (patchLine.startsWith("+") && !patchLine.startsWith("+++")) {
      currentLine += 1
      const content = patchLine.slice(1)
      findings.push(
        ...scanLine(content, currentLine, file, commitSha, commitMessage, commitDate)
      )
      continue
    }

    if (!patchLine.startsWith("-")) {
      currentLine += 1
    }
  }

  return findings
}

function countBySeverity(findings: SecretFinding[]): Record<Severity, number> {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  )
}

export async function scanSecrets(
  octokit: Octokit,
  owner: string,
  repo: string,
  commitLimit = 30,
  onProgress?: (progress: number, message: string) => void
): Promise<SecretScanResult> {
  const findings: SecretFinding[] = []
  let filesScanned = 0

  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: Math.min(commitLimit, 100),
  })

  const commitsToScan = commits.slice(0, commitLimit)

  onProgress?.(65, `Scanning ${commitsToScan.length} commits for secrets...`)

  for (let index = 0; index < commitsToScan.length; index++) {
    const commit = commitsToScan[index]
    const { data: detail } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: commit.sha,
    })

    const commitMessage = detail.commit.message.split("\n")[0]
    const commitDate = detail.commit.committer?.date ?? detail.commit.author?.date ?? ""

    for (const file of detail.files ?? []) {
      if (!file.patch || shouldSkipFile(file.filename)) {
        continue
      }

      filesScanned += 1
      findings.push(
        ...scanPatch(file.patch, file.filename, commit.sha, commitMessage, commitDate)
      )
    }

    if (commitsToScan.length > 0) {
      const secretProgress = 65 + Math.round(((index + 1) / commitsToScan.length) * 30)
      onProgress?.(secretProgress, `Scanned commit ${commit.sha.slice(0, 7)}`)
    }
  }

  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  findings.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) {
      return severityDiff
    }
    return b.commitDate.localeCompare(a.commitDate)
  })

  return {
    commitsScanned: commitsToScan.length,
    filesScanned,
    findings,
    summary: countBySeverity(findings),
  }
}
