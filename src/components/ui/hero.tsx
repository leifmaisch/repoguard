import { squircle } from "@/lib/squircle"
import { surfaceDepth, surfaceDepthFrame } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"
import { Section } from "@/components/ui/section"

type HeroProps = React.ComponentProps<typeof Section>

function Hero({ className, ...props }: HeroProps) {
  return (
    <Section
      data-slot="hero"
      className={cn("py-12 sm:py-16 md:py-24", className)}
      {...props}
    />
  )
}

function HeroFrame({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-frame"
      style={{ ...squircle, ...style }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-squircle-xl border border-border/60 bg-muted/50 p-1",
        surfaceDepthFrame,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function HeroIntro({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-intro"
      className={cn(
        "flex flex-col items-center gap-4 px-4 py-10 text-center sm:gap-5 sm:px-10 sm:py-14",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function HeroLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="hero-label"
      style={squircle}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-label",
        className
      )}
      {...props}
    />
  )
}

function HeroTitle({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="hero-title"
      className={cn(
        "max-w-3xl text-balance text-heading-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
        className
      )}
      {...props}
    />
  )
}

function HeroDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="hero-description"
      className={cn("max-w-2xl text-balance text-description sm:text-lg", className)}
      {...props}
    />
  )
}

function HeroActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-actions"
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className
      )}
      {...props}
    />
  )
}

function HeroChips({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-chips"
      className={cn("flex flex-wrap justify-center gap-2", className)}
      {...props}
    />
  )
}

function HeroChip({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="hero-chip"
      style={squircle}
      className={cn(
        "rounded-full border border-border bg-background px-3 py-1 text-label",
        className
      )}
      {...props}
    />
  )
}

function HeroShowcase({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-showcase"
      style={squircle}
      className={cn(
        "relative mx-1 mb-1 min-h-[200px] overflow-hidden rounded-squircle-inner border border-border bg-card sm:min-h-[280px] md:min-h-[300px]",
        surfaceDepth("md"),
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_0%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(color-mix(in_srgb,var(--primary)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--primary)_6%,transparent)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}

export {
  Hero,
  HeroActions,
  HeroChip,
  HeroChips,
  HeroDescription,
  HeroFrame,
  HeroIntro,
  HeroLabel,
  HeroShowcase,
  HeroTitle,
}
