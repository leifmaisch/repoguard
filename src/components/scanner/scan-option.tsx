"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type ScanOptionProps = {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ScanOption({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: ScanOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-squircle-md border border-transparent px-2 py-2 transition-colors has-focus-visible:border-ring has-focus-visible:ring-2 has-focus-visible:ring-ring/30",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="text-sm leading-snug">{label}</span>
    </label>
  )
}
