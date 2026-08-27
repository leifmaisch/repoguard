"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { dottedBorder, dottedFillHorizontal } from "@/lib/dot-pattern"
import { squircle } from "@/lib/squircle"
import { surfaceDepthInput, surfaceDepthPrimarySquircle } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"

const progressDashMask =
  "mask-[repeating-linear-gradient(90deg,#000_0_12px,transparent_12px_16px)] [-webkit-mask:repeating-linear-gradient(90deg,#000_0_12px,transparent_12px_16px)]"

const progressTrackVariants = cva(
  "relative flex w-full items-center overflow-hidden rounded-squircle-sm",
  {
    variants: {
      size: {
        sm: "h-1",
        default: "h-1.5",
        lg: "h-2.5",
      },
      appearance: {
        solid: cn(
          "border border-transparent bg-muted/80",
          surfaceDepthInput("sm")
        ),
        dashed: cn("rounded-sm bg-muted/70", progressDashMask),
        dotted: cn(dottedBorder, dottedFillHorizontal),
        striped: cn(
          "border border-transparent bg-muted/80",
          surfaceDepthInput("sm")
        ),
      },
    },
    defaultVariants: {
      size: "default",
      appearance: "solid",
    },
  }
)

const progressIndicatorVariants = cva(
  cn(
    "h-full transition-[width] duration-300 ease-out",
    "data-indeterminate:absolute data-indeterminate:inset-y-0 data-indeterminate:left-0 data-indeterminate:w-1/3 data-indeterminate:animate-progress-slide"
  ),
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
      },
      appearance: {
        solid: "rounded-squircle-sm",
        dashed: "rounded-none",
        dotted: "rounded-none",
        striped: "rounded-squircle-sm",
      },
    },
    compoundVariants: [
      {
        appearance: "solid",
        variant: "default",
        class: cn("bg-primary", surfaceDepthPrimarySquircle()),
      },
      {
        appearance: "solid",
        variant: "secondary",
        class: "bg-foreground/70",
      },
      {
        appearance: "solid",
        variant: "destructive",
        class: "bg-destructive",
      },
      {
        appearance: "dashed",
        variant: "default",
        class: cn("bg-primary", progressDashMask),
      },
      {
        appearance: "dashed",
        variant: "secondary",
        class: cn("bg-foreground/70", progressDashMask),
      },
      {
        appearance: "dashed",
        variant: "destructive",
        class: cn("bg-destructive", progressDashMask),
      },
      {
        appearance: "dotted",
        variant: "default",
        class:
          "bg-[radial-gradient(circle,var(--primary)_1.5px,transparent_1.5px)] bg-[length:6px_100%]",
      },
      {
        appearance: "dotted",
        variant: "secondary",
        class:
          "bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_70%,transparent)_1.5px,transparent_1.5px)] bg-[length:6px_100%]",
      },
      {
        appearance: "dotted",
        variant: "destructive",
        class:
          "bg-[radial-gradient(circle,var(--destructive)_1.5px,transparent_1.5px)] bg-[length:6px_100%]",
      },
      {
        appearance: "striped",
        variant: "default",
        class: cn(
          "bg-primary bg-[linear-gradient(-45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:10px_10px]",
          surfaceDepthPrimarySquircle()
        ),
      },
      {
        appearance: "striped",
        variant: "secondary",
        class:
          "bg-foreground/70 bg-[linear-gradient(-45deg,rgba(255,255,255,0.14)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.14)_50%,rgba(255,255,255,0.14)_75%,transparent_75%,transparent)] bg-[length:10px_10px]",
      },
      {
        appearance: "striped",
        variant: "destructive",
        class:
          "bg-destructive bg-[linear-gradient(-45deg,rgba(255,255,255,0.16)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0.16)_75%,transparent_75%,transparent)] bg-[length:10px_10px]",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
    },
  }
)

type ProgressOptions = VariantProps<typeof progressTrackVariants> &
  Pick<VariantProps<typeof progressIndicatorVariants>, "variant">

const ProgressContext = React.createContext<ProgressOptions>({
  size: "default",
  appearance: "solid",
  variant: "default",
})

function Progress({
  className,
  children,
  value,
  size = "default",
  appearance = "solid",
  variant = "default",
  ...props
}: ProgressPrimitive.Root.Props & ProgressOptions) {
  return (
    <ProgressContext.Provider value={{ size, appearance, variant }}>
      <ProgressPrimitive.Root
        value={value}
        data-slot="progress"
        className={cn("flex w-full flex-wrap items-center gap-x-3 gap-y-2", className)}
        {...props}
      >
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  )
}

function ProgressTrack({
  className,
  size: sizeProp,
  appearance: appearanceProp,
  style,
  ...props
}: ProgressPrimitive.Track.Props & VariantProps<typeof progressTrackVariants>) {
  const context = React.useContext(ProgressContext)
  const size = sizeProp ?? context.size ?? "default"
  const appearance = appearanceProp ?? context.appearance ?? "solid"

  return (
    <ProgressPrimitive.Track
      style={appearance === "dashed" || appearance === "dotted" ? style : { ...squircle, ...style }}
      className={cn(progressTrackVariants({ size, appearance }), className)}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  variant: variantProp,
  appearance: appearanceProp,
  style,
  ...props
}: ProgressPrimitive.Indicator.Props &
  VariantProps<typeof progressIndicatorVariants>) {
  const context = React.useContext(ProgressContext)
  const variant = variantProp ?? context.variant ?? "default"
  const appearance = appearanceProp ?? context.appearance ?? "solid"

  return (
    <ProgressPrimitive.Indicator
      style={appearance === "dashed" || appearance === "dotted" ? style : { ...squircle, ...style }}
      data-slot="progress-indicator"
      className={cn(
        progressIndicatorVariants({ variant, appearance }),
        className
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium text-foreground", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-xs text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  progressTrackVariants,
  progressIndicatorVariants,
}
