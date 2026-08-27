import Link from "next/link"

import { squircle } from "@/lib/squircle"
import { cn } from "@/lib/utils"
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section"

type BrandingProps = Omit<React.ComponentProps<typeof Section>, "children"> & {
  title?: string
  description?: string
  children: React.ReactNode
}

function Branding({
  title,
  description,
  className,
  children,
  ...props
}: BrandingProps) {
  return (
    <Section data-slot="branding" className={cn("py-10 md:py-14", className)} {...props}>
      {title ? (
        <SectionHeader className="mb-6 md:mb-8">
          <SectionTitle className="text-xl sm:text-2xl md:text-3xl">
            {title}
          </SectionTitle>
          {description ? (
            <SectionDescription>{description}</SectionDescription>
          ) : null}
        </SectionHeader>
      ) : null}
      {children}
    </Section>
  )
}

function BrandingGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="branding-grid"
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
        className
      )}
      {...props}
    />
  )
}

type BrandingLogoProps = React.ComponentProps<"div"> & {
  name: string
  href?: string
}

function BrandingLogo({
  name,
  href,
  className,
  children,
  ...props
}: BrandingLogoProps) {
  const content = (
  <div
    data-slot="branding-logo"
    style={squircle}
    className={cn(
      "flex h-14 items-center justify-center rounded-squircle-md border border-border/60 bg-muted/30 px-4 text-muted-foreground transition-colors",
      href && "hover:bg-muted/50 hover:text-foreground",
      className
    )}
    {...props}
  >
    <span className="sr-only">{name}</span>
    {children}
  </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

function BrandingRow({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="branding-row"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10",
        className
      )}
      {...props}
    />
  )
}

function BrandingRowItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="branding-row-item"
      className={cn("text-muted-foreground transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}

export { Branding, BrandingGrid, BrandingLogo, BrandingRow, BrandingRowItem }
