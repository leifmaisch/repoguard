"use client"

import { useId, useMemo, useState } from "react"
import {
  CheckCircleIcon,
  ShieldWarningIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

import { iconWeight } from "@/components/shared"
import { ScanOption } from "@/components/scanner/scan-option"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isOptionalPlatformPackage } from "@/lib/scanner/licenses"
import type { DependencyLicense, ScanResult, Severity } from "@/lib/scanner/types"

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
      <span className={`text-heading text-2xl sm:text-3xl ${valueClass}`}>{value}</span>
    </div>
  )
}

function LicenseStatus({ dep }: { dep: DependencyLicense }) {
  if (dep.compliant) {
    return <span className="text-primary">Compliant</span>
  }

  return <span className="text-destructive">{dep.category}</span>
}

function LicenseCards({ dependencies }: { dependencies: DependencyLicense[] }) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {dependencies.map((dep) => (
        <li key={`${dep.name}@${dep.version}`}>
          <article className="surface-panel flex flex-col gap-2 p-4">
            <h3 className="break-all font-mono text-xs">{dep.name}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-label">Version</dt>
              <dd>{dep.version}</dd>
              <dt className="text-label">License</dt>
              <dd className="break-words">{dep.license ?? "Unknown"}</dd>
              <dt className="text-label">Status</dt>
              <dd>
                <LicenseStatus dep={dep} />
              </dd>
            </dl>
          </article>
        </li>
      ))}
    </ul>
  )
}

function LicenseTable({ dependencies }: { dependencies: DependencyLicense[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Dependency license compliance results</caption>
        <thead>
          <tr className="border-b border-border text-label">
            <th scope="col" className="px-3 py-2 font-medium">
              Package
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Version
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              License
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map((dep) => (
            <tr key={`${dep.name}@${dep.version}`} className="border-b border-border/60">
              <td className="px-3 py-2 font-mono text-xs">{dep.name}</td>
              <td className="px-3 py-2 text-caption">{dep.version}</td>
              <td className="px-3 py-2">{dep.license ?? "Unknown"}</td>
              <td className="px-3 py-2">
                <LicenseStatus dep={dep} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LicenseResults({ dependencies }: { dependencies: DependencyLicense[] }) {
  if (dependencies.length === 0) {
    return <p className="text-description">No packages match the current filters.</p>
  }

  return (
    <>
      <LicenseCards dependencies={dependencies} />
      <LicenseTable dependencies={dependencies} />
    </>
  )
}

export function ScanResults({ result }: { result: ScanResult }) {
  const resultsTitleId = useId()
  const [showAllDependencies, setShowAllDependencies] = useState(false)
  const [hidePlatformPackages, setHidePlatformPackages] = useState(true)

  const licenseDependencies = useMemo(() => {
    if (!result.license) {
      return []
    }

    let deps = result.license.dependencies

    if (hidePlatformPackages) {
      deps = deps.filter((dep) => !isOptionalPlatformPackage(dep.name))
    }

    if (!showAllDependencies) {
      deps = deps.filter((dep) => !dep.compliant)
    }

    return deps
  }, [result.license, hidePlatformPackages, showAllDependencies])

  const licenseGroups = useMemo(() => {
    if (!result.license) {
      return []
    }

    const groups = new Map<string, number>()

    for (const dep of result.license.dependencies) {
      if (hidePlatformPackages && isOptionalPlatformPackage(dep.name)) {
        continue
      }
      if (dep.compliant) {
        continue
      }

      const key = dep.license ?? "Unknown"
      groups.set(key, (groups.get(key) ?? 0) + 1)
    }

    return Array.from(groups.entries()).sort((a, b) => b[1] - a[1])
  }, [result.license, hidePlatformPackages])

  const secretCount = result.secrets?.findings.length ?? 0
  const licenseIssues = result.license?.summary.nonCompliant ?? 0
  const hasProblems = secretCount > 0 || licenseIssues > 0 || result.errors.length > 0

  return (
    <section aria-labelledby={resultsTitleId} className="flex flex-col gap-6">
      <h2 id={resultsTitleId} className="text-heading-lg break-all sm:text-xl">
        Results for {result.repo}
      </h2>

      {result.errors.length > 0 ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Partial scan errors</AlertTitle>
          <AlertDescription>{result.errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        role="list"
        aria-label="Scan summary"
      >
        <div role="listitem">
          <SummaryCard
            label="Secrets found"
            value={secretCount}
            tone={secretCount > 0 ? "danger" : "success"}
          />
        </div>
        <div role="listitem">
          <SummaryCard
            label="License issues"
            value={licenseIssues}
            tone={licenseIssues > 0 ? "danger" : "success"}
          />
        </div>
        <div role="listitem">
          <SummaryCard label="Dependencies" value={result.license?.summary.total ?? 0} />
        </div>
        <div role="listitem">
          <SummaryCard label="Commits scanned" value={result.secrets?.commitsScanned ?? 0} />
        </div>
      </div>

      {!hasProblems ? (
        <Alert>
          <CheckCircleIcon weight={iconWeight} aria-hidden="true" />
          <AlertTitle>No issues detected</AlertTitle>
          <AlertDescription>
            No non-compliant licenses or leaked secrets were found in the selected scan scope.
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue={result.license ? "licenses" : "secrets"} className="gap-4">
        <TabsList className="h-auto w-full max-w-full overflow-x-auto">
          {result.license ? (
            <TabsTrigger value="licenses" className="min-h-10 min-w-[7rem] flex-none sm:flex-1">
              Licenses
            </TabsTrigger>
          ) : null}
          {result.secrets ? (
            <TabsTrigger value="secrets" className="min-h-10 min-w-[7rem] flex-none sm:flex-1">
              Secrets
            </TabsTrigger>
          ) : null}
        </TabsList>

        {result.license ? (
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>License compliance</CardTitle>
                <CardDescription className="break-words">
                  Repository license: {result.license.repoLicense ?? "Unknown"}
                  {result.license.manifestFiles.length > 0
                    ? ` · Manifests: ${result.license.manifestFiles.join(", ")}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {result.license.issues.length > 0 ? (
                  <Alert variant="destructive" role="alert">
                    <WarningCircleIcon weight={iconWeight} aria-hidden="true" />
                    <AlertTitle>Compliance issues</AlertTitle>
                    <AlertDescription>{result.license.issues.join(" ")}</AlertDescription>
                  </Alert>
                ) : null}

                {licenseGroups.length > 0 ? (
                  <div
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
                    role="list"
                    aria-label="License issue groups"
                  >
                    {licenseGroups.map(([license, count]) => (
                      <div
                        key={license}
                        role="listitem"
                        className="surface-panel flex flex-col gap-1 p-3"
                      >
                        <span className="text-label">{count} packages</span>
                        <span className="break-words text-sm">{license}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <fieldset className="flex flex-col gap-3 border-0 p-0">
                  <legend className="text-sm font-medium">Filters</legend>
                  <ScanOption
                    id="show-all-dependencies"
                    label="Show all dependencies"
                    checked={showAllDependencies}
                    onCheckedChange={setShowAllDependencies}
                  />
                  <ScanOption
                    id="hide-platform-packages"
                    label="Hide optional platform binaries"
                    checked={hidePlatformPackages}
                    onCheckedChange={setHidePlatformPackages}
                  />
                </fieldset>

                <LicenseResults dependencies={licenseDependencies} />
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

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
                  <ul className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1">
                    {result.secrets.findings.map((finding) => (
                      <li key={finding.id}>
                        <article
                          className="surface-panel flex flex-col gap-2 p-4"
                          aria-labelledby={`finding-${finding.id}-title`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <ShieldWarningIcon
                              weight={iconWeight}
                              className={`size-4 ${severityStyles[finding.severity]}`}
                              aria-hidden="true"
                            />
                            <h3 id={`finding-${finding.id}-title`} className="text-title">
                              {finding.rule}
                            </h3>
                            <span
                              className={`text-label uppercase ${severityStyles[finding.severity]}`}
                            >
                              {finding.severity}
                            </span>
                          </div>
                          <p className="break-all font-mono text-sm">{finding.redacted}</p>
                          <dl className="flex flex-col gap-1 text-caption sm:flex-row sm:flex-wrap sm:gap-x-4">
                            <div>
                              <dt className="sr-only">File</dt>
                              <dd className="break-all">{finding.file}</dd>
                            </div>
                            <div>
                              <dt className="sr-only">Line</dt>
                              <dd>Line {finding.line}</dd>
                            </div>
                            <div>
                              <dt className="sr-only">Commit</dt>
                              <dd>{finding.commitSha.slice(0, 7)}</dd>
                            </div>
                          </dl>
                          <p className="text-caption">{finding.commitMessage}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </section>
  )
}
