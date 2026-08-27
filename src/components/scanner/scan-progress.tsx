"use client"

import { Progress } from "@/components/ui/progress"

type ScanProgressProps = {
  progress: number
  message: string
}

export function ScanProgressBar({ progress, message }: ScanProgressProps) {
  return (
    <div className="surface-panel flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{message}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} />
    </div>
  )
}
