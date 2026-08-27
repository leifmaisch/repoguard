"use client"

import { useState } from "react"
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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-heading-xl">{siteConfig.name}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Repository scan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="repo">Repository</Label>
              <Input
                id="repo"
                placeholder="owner/repo or https://github.com/owner/repo"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="token">GitHub token (optional)</Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_..."
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
              />
              <p className="text-caption">
                Used only for this request. Not stored on the server.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={scanLicense}
                  onChange={(event) => setScanLicense(event.target.checked)}
                  className="size-4 rounded border border-input"
                />
                License and dependency compliance
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={scanSecrets}
                  onChange={(event) => setScanSecrets(event.target.checked)}
                  className="size-4 rounded border border-input"
                />
                Commit secret scanner
              </label>
            </div>

            <div className="grid gap-2 sm:max-w-xs">
              <Label htmlFor="commitLimit">Commits to scan</Label>
              <Input
                id="commitLimit"
                type="number"
                min={1}
                max={100}
                value={commitLimit}
                onChange={(event) => setCommitLimit(event.target.value)}
                disabled={!scanSecrets}
              />
            </div>

            <Button type="submit" disabled={loading || (!scanLicense && !scanSecrets)}>
              <MagnifyingGlassIcon weight={iconWeight} className="size-4" />
              {loading ? "Scanning..." : "Run scan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? <ScanProgressBar progress={progress} message={progressMessage} /> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? <ScanResults result={result} /> : null}
    </div>
  )
}
