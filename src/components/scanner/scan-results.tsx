"use client"

import {
  CheckCircleIcon,
  ShieldWarningIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

import { iconWeight } from "@/components/shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ScanResult, Severity } from "@/lib/scanner/types"

const severityStyles: Record<Severity, string> = {
  critical: "text-destructive",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-muted-foreground",
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number | string
  tone?: "default" | "danger" | "success"
}) {
  const valueClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "success"
        ? "text-primary"
        : "text-foreground"

  return (
    <div className="surface-panel flex flex-col gap-1 p-4">
      <span className="text-label">{label}</span>
      <span className={`text-heading text-2xl ${valueClass}`}>{value}</span>
    </div>
  )
}

export function ScanResults({ result }: { result: ScanResult }) {
  const secretCount = result.secrets?.findings.length ?? 0
  const licenseIssues = result.license?.summary.nonCompliant ?? 0
  const hasProblems = secretCount > 0 || licenseIssues > 0 || result.errors.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-heading-lg">Results for {result.repo}</h2>
        <p className="text-caption">
          Scanned at {new Date(result.scannedAt).toLocaleString()}
        </p>
      </div>

      {result.errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Partial scan errors</AlertTitle>
          <AlertDescription>{result.errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Secrets found"
          value={secretCount}
          tone={secretCount > 0 ? "danger" : "success"}
        />
        <SummaryCard
          label="License issues"
          value={licenseIssues}
          tone={licenseIssues > 0 ? "danger" : "success"}
        />
        <SummaryCard
          label="Dependencies"
          value={result.license?.summary.total ?? 0}
        />
        <SummaryCard
          label="Commits scanned"
          value={result.secrets?.commitsScanned ?? 0}
        />
      </div>

      {!hasProblems ? (
        <Alert>
          <CheckCircleIcon weight={iconWeight} />
          <AlertTitle>No issues detected</AlertTitle>
          <AlertDescription>
            No non-compliant licenses or leaked secrets were found in the selected scan scope.
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue={result.secrets ? "secrets" : "licenses"}>
        <TabsList>
          {result.secrets ? <TabsTrigger value="secrets">Secrets</TabsTrigger> : null}
          {result.license ? <TabsTrigger value="licenses">Licenses</TabsTrigger> : null}
        </TabsList>

        {result.secrets ? (
          <TabsContent value="secrets">
            <Card>
              <CardHeader>
                <CardTitle>Commit security findings</CardTitle>
                <CardDescription>
                  Scanned {result.secrets.commitsScanned} commits across{" "}
                  {result.secrets.filesScanned} changed files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.secrets.findings.length === 0 ? (
                  <p className="text-description">No secrets detected in commit diffs.</p>
                ) : (
                  <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto">
                    {result.secrets.findings.map((finding) => (
                      <div
                        key={finding.id}
                        className="surface-panel flex flex-col gap-2 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <ShieldWarningIcon
                            weight={iconWeight}
                            className={`size-4 ${severityStyles[finding.severity]}`}
                          />
                          <span className="text-title">{finding.rule}</span>
                          <span
                            className={`text-label uppercase ${severityStyles[finding.severity]}`}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        <p className="font-mono text-sm">{finding.redacted}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption">
                          <span>{finding.file}</span>
                          <span>Line {finding.line}</span>
                          <span>{finding.commitSha.slice(0, 7)}</span>
                        </div>
                        <p className="text-caption">{finding.commitMessage}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {result.license ? (
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>License compliance</CardTitle>
                <CardDescription>
                  Repository license: {result.license.repoLicense ?? "Unknown"}
                  {result.license.manifestFiles.length > 0
                    ? ` · Manifests: ${result.license.manifestFiles.join(", ")}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {result.license.issues.length > 0 ? (
                  <Alert variant="destructive">
                    <WarningCircleIcon weight={iconWeight} />
                    <AlertTitle>Compliance issues</AlertTitle>
                    <AlertDescription>{result.license.issues.join(" ")}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-label">
                        <th className="px-3 py-2 font-medium">Package</th>
                        <th className="px-3 py-2 font-medium">Version</th>
                        <th className="px-3 py-2 font-medium">License</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.license.dependencies.map((dep) => (
                        <tr key={`${dep.name}@${dep.version}`} className="border-b border-border/60">
                          <td className="px-3 py-2 font-mono text-xs">{dep.name}</td>
                          <td className="px-3 py-2 text-caption">{dep.version}</td>
                          <td className="px-3 py-2">{dep.license ?? "Unknown"}</td>
                          <td className="px-3 py-2">
                            {dep.compliant ? (
                              <span className="text-primary">Compliant</span>
                            ) : (
                              <span className="text-destructive">{dep.category}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
