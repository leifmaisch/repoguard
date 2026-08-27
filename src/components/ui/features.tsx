import { ArrowUpRightIcon } from "@phosphor-icons/react"

import { squircle } from "@/lib/squircle"
import { surfaceDepth } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section"

type FeatureCardProps = React.ComponentProps<"article"> & {
  title: string
  description?: string
  visual?: React.ReactNode
  large?: boolean
  showArrow?: boolean
}

function FeatureCard({
  title,
  description,
  visual,
  large = false,
  showArrow = true,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <article
      data-slot="feature-card"
      style={squircle}
      className={cn(
        "group flex flex-col rounded-squircle-lg border border-border bg-muted/30 p-2 transition-colors hover:bg-muted/50",
        large && "lg:h-full",
        className
      )}
      {...props}
    >
      {visual ? (
        <div
          data-slot="feature-card-visual"
          style={squircle}
          className={cn(
            "relative flex w-full overflow-hidden rounded-squircle-md border border-border bg-card",
            surfaceDepth("md"),
            large ? "min-h-[160px] flex-1 sm:min-h-[200px] lg:min-h-0" : "aspect-4/3"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_100%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_65%)]"
          />
          <div className="relative z-10 h-full w-full">{visual}</div>
        </div>
      ) : null}
      <div
        className={cn(
          "px-3 pb-1 pt-2",
          showArrow ? "flex items-start justify-between gap-3" : ""
        )}
      >
        <div className="min-w-0">
          <h3 className="text-title">{title}</h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-description">{description}</p>
          ) : null}
        </div>
        {showArrow ? (
          <span className="flex shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none">
            <ArrowUpRightIcon className="size-5" />
          </span>
        ) : null}
      </div>
    </article>
  )
}

type FeatureCtaCardProps = React.ComponentProps<"a"> & {
  label?: string
}

function FeatureCtaCard({
  label = "View all features",
  className,
  children,
  ...props
}: FeatureCtaCardProps) {
  return (
    <a
      data-slot="feature-cta-card"
      style={squircle}
      className={cn(
        "group relative flex min-h-45 flex-col justify-between overflow-hidden rounded-squircle-lg border border-primary/35 bg-primary p-6 text-primary-foreground shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--primary-foreground)_20%,transparent)] transition-opacity hover:opacity-95",
        className
      )}
      {...props}
    >
      <ArrowUpRightIcon className="relative size-8 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      <span className="relative text-heading text-xl sm:text-2xl">{children ?? label}</span>
    </a>
  )
}

type FeaturesProps = Omit<React.ComponentProps<typeof Section>, "children"> & {
  title?: string
  description?: string
  children: React.ReactNode
}

function Features({
  title,
  description,
  className,
  children,
  ...props
}: FeaturesProps) {
  return (
    <Section data-slot="features" className={className} {...props}>
      {title ? (
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
          {description ? (
            <SectionDescription>{description}</SectionDescription>
          ) : null}
        </SectionHeader>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </Section>
  )
}

export { FeatureCard, FeatureCtaCard, Features }
