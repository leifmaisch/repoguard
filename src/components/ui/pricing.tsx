import { CheckIcon, XIcon } from "@phosphor-icons/react"

import { iconWeight } from "@/components/shared"
import { squircle } from "@/lib/squircle"
import { surfaceDepth } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section"

type PricingFeatureItem = {
  text: string
  included?: boolean
}

type PricingCardProps = React.ComponentProps<"article"> & {
  featured?: boolean
}

function PricingCard({
  featured = false,
  className,
  children,
  ...props
}: PricingCardProps) {
  return (
    <article
      data-slot="pricing-card"
      data-featured={featured || undefined}
      style={squircle}
      className={cn(
        "relative flex flex-col rounded-squircle-lg border p-5 sm:p-8",
        surfaceDepth(featured ? "lg" : "md"),
        featured
          ? "border-primary/35 bg-primary/5"
          : "border-border bg-muted/30",
        className
      )}
      {...props}
    >
      {featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-squircle-lg bg-[radial-gradient(90%_80%_at_50%_0%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_65%)]"
        />
      ) : null}
      <div className="relative flex h-full flex-col">{children}</div>
    </article>
  )
}

function PricingHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function PricingName({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="pricing-name"
      className={cn("text-title", className)}
      {...props}
    />
  )
}

function PricingDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="pricing-description"
      className={cn("text-description", className)}
      {...props}
    />
  )
}

function PricingAmount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-amount"
      className={cn("mt-6 flex items-end gap-1", className)}
      {...props}
    />
  )
}

function PricingPrice({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-price"
      className={cn("text-heading text-3xl sm:text-4xl", className)}
      {...props}
    />
  )
}

function PricingPeriod({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-period"
      className={cn("pb-1 text-description", className)}
      {...props}
    />
  )
}

function PricingFeatures({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pricing-features"
      className={cn("mt-6 flex flex-col gap-3 text-sm", className)}
      {...props}
    />
  )
}

type PricingFeatureProps = React.ComponentProps<"li"> & {
  included?: boolean
}

function PricingFeature({
  included = true,
  className,
  children,
  ...props
}: PricingFeatureProps) {
  return (
    <li
      data-slot="pricing-feature"
      data-included={included || undefined}
      className={cn(
        "flex items-start gap-2.5",
        included ? "text-foreground" : "text-muted-foreground/60",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center",
          included ? "text-primary" : "text-muted-foreground/40"
        )}
        aria-hidden
      >
        {included ? (
          <CheckIcon weight={iconWeight} className="size-4" />
        ) : (
          <XIcon weight={iconWeight} className="size-4" />
        )}
      </span>
      <span>{children}</span>
    </li>
  )
}

function PricingAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-action"
      className={cn("mt-8", className)}
      {...props}
    />
  )
}

type PricingProps = Omit<React.ComponentProps<typeof Section>, "children"> & {
  title?: string
  description?: string
  children: React.ReactNode
}

function Pricing({
  title,
  description,
  className,
  children,
  ...props
}: PricingProps) {
  return (
    <Section data-slot="pricing" className={className} {...props}>
      {title ? (
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
          {description ? (
            <SectionDescription>{description}</SectionDescription>
          ) : null}
        </SectionHeader>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </Section>
  )
}

export {
  Pricing,
  PricingAction,
  PricingAmount,
  PricingCard,
  PricingDescription,
  PricingFeature,
  PricingFeatures,
  PricingHeader,
  PricingName,
  PricingPeriod,
  PricingPrice,
  type PricingFeatureItem,
}
