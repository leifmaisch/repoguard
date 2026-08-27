export type LicenseCategory = "permissive" | "weak-copyleft" | "copyleft" | "proprietary" | "unknown"

export type Severity = "critical" | "high" | "medium" | "low"

export type DependencyLicense = {
  name: string
  version: string
  license: string | null
  category: LicenseCategory
  compliant: boolean
}

export type LicenseScanResult = {
  repoLicense: string | null
  repoLicenseCompliant: boolean
  manifestFiles: string[]
  dependencies: DependencyLicense[]
  summary: {
    total: number
    compliant: number
    nonCompliant: number
    unknown: number
  }
  issues: string[]
}

export type SecretFinding = {
  id: string
  rule: string
  severity: Severity
  commitSha: string
  commitMessage: string
  commitDate: string
  file: string
  line: number
  match: string
  redacted: string
}

export type SecretScanResult = {
  commitsScanned: number
  filesScanned: number
  findings: SecretFinding[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export type ScanProgressUpdate = {
  progress: number
  message: string
}

export type ScanResult = {
  repo: string
  owner: string
  name: string
  scannedAt: string
  license: LicenseScanResult | null
  secrets: SecretScanResult | null
  errors: string[]
}
