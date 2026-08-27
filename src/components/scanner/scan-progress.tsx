"use client"

import { Progress } from "@/components/ui/progress"

type ScanProgressProps = {
  progress: number
  message: string
}

export function ScanProgressBar({ progress, message }: ScanProgressProps) {
  const value = Math.round(progress)

  return (
    <section
      aria-labelledby="scan-progress-label"
      aria-describedby="scan-progress-message"
      className="surface-panel flex flex-col gap-3 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p id="scan-progress-message" className="text-sm font-medium">
          {message}
        </p>
        <span
          id="scan-progress-label"
          className="shrink-0 text-xs text-muted-foreground tabular-nums"
          aria-hidden="true"
        >
          {value}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Scan progress: ${value}%`}
      >
        <Progress value={progress} />
      </div>
    </section>
  )
}
