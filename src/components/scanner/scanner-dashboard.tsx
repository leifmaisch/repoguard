"use client"

import { useId, useState } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { iconWeight } from "@/components/shared"
import { siteConfig } from "@/config/site"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScanResult } from "@/lib/scanner/types"

import { ScanOption } from "./scan-option"
import { ScanProgressBar } from "./scan-progress"
import { ScanResults } from "./scan-results"

async function consumeScanStream(
  response: Response,
  onProgress: (progress: number, message: string) => void
): Promise<ScanResult> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("No response stream available")
  }

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const event of events) {
      const line = event.trim()
      if (!line.startsWith("data: ")) {
        continue
      }

      const payload = JSON.parse(line.slice(6)) as {
        type: string
        progress?: number
        message?: string
        result?: ScanResult
        error?: string
      }

      if (payload.type === "progress" && payload.progress !== undefined && payload.message) {
        onProgress(payload.progress, payload.message)
      }

      if (payload.type === "result" && payload.result) {
        return payload.result
      }

      if (payload.type === "error") {
        throw new Error(payload.error ?? "Scan failed")
      }
    }
  }

  throw new Error("Scan ended without a result")
}

export function ScannerDashboard() {
  const formTitleId = useId()
  const tokenHintId = useId()
  const commitHintId = useId()
  const statusRegionId = useId()

  const [repo, setRepo] = useState("")
  const [token, setToken] = useState("")
  const [commitLimit, setCommitLimit] = useState("30")
  const [scanLicense, setScanLicense] = useState(true)
  const [scanSecrets, setScanSecrets] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setProgress(0)
    setProgressMessage("Starting scan...")
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          token: token || undefined,
          scanLicense,
          scanSecrets,
          commitLimit: Number.parseInt(commitLimit, 10),
          allowedLicenses: [...siteConfig.allowedLicenses],
          stream: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "Scan failed")
      }

      const scanResult = await consumeScanStream(response, (nextProgress, message) => {
        setProgress(nextProgress)
        setProgressMessage(message)
      })

      setResult(scanResult)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Scan failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:px-6 sm:py-10"
    >
      <header>
        <h1 className="text-heading-xl sm:text-2xl">{siteConfig.name}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle id={formTitleId}>Repository scan</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-labelledby={formTitleId}
            aria-busy={loading}
          >
            <div className="grid gap-2">
              <Label htmlFor="repo">Repository</Label>
              <Input
                id="repo"
                name="repo"
                placeholder="owner/repo or https://github.com/owner/repo"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                autoComplete="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="url"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token">GitHub token (optional)</Label>
              <Input
                id="token"
                name="token"
                type="password"
                placeholder="ghp_..."
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                aria-describedby={tokenHintId}
              />
              <p id={tokenHintId} className="text-caption">
                Used only for this request. Not stored on the server.
              </p>
            </div>

            <fieldset className="grid gap-3 border-0 p-0 sm:grid-cols-2">
              <legend className="mb-1 text-sm font-medium">Scan options</legend>
              <ScanOption
                id="scan-license"
                label="License and dependency compliance"
                checked={scanLicense}
                onCheckedChange={setScanLicense}
              />
              <ScanOption
                id="scan-secrets"
                label="Commit secret scanner"
                checked={scanSecrets}
                onCheckedChange={setScanSecrets}
              />
            </fieldset>

            <div className="grid gap-2">
              <Label htmlFor="commitLimit">Commits to scan</Label>
              <Input
                id="commitLimit"
                name="commitLimit"
                type="number"
                min={1}
                max={100}
                value={commitLimit}
                onChange={(event) => setCommitLimit(event.target.value)}
                disabled={!scanSecrets}
                aria-describedby={commitHintId}
                className="w-full sm:max-w-xs"
              />
              <p id={commitHintId} className="text-caption">
                {scanSecrets
                  ? "Scan recent commit diffs for leaked secrets."
                  : "Enable commit secret scanner to configure commit count."}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || (!scanLicense && !scanSecrets)}
              className="w-full sm:w-auto"
            >
              <MagnifyingGlassIcon weight={iconWeight} className="size-4" aria-hidden="true" />
              {loading ? "Scanning..." : "Run scan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div
        id={statusRegionId}
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col gap-6"
      >
        {loading ? <ScanProgressBar progress={progress} message={progressMessage} /> : null}

        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Scan failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {result ? <ScanResults result={result} /> : null}
      </div>
    </main>
  )
}
