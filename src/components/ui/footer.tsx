import Link from "next/link"

import { squircle } from "@/lib/squircle"
import { surfaceDepth } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"

type FooterLinkItem = {
  label: string
  href: string
}

function Footer({
  className,
  children,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="footer"
      className={cn("border-t border-border bg-muted/25 px-4 py-10 sm:px-6 sm:py-12", className)}
      {...props}
    >
      {children}
    </footer>
  )
}

function FooterPanel({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-panel"
      style={{ ...squircle, ...style }}
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-squircle-xl border border-border bg-card p-4 sm:gap-10 sm:p-8",
        surfaceDepth("lg"),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function FooterMain({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-main"
      className={cn(
        "grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type FooterBrandProps = React.ComponentProps<"div"> & {
  href?: string
  logo?: React.ReactNode
  name?: string
}

function FooterBrand({
  href = "/",
  logo,
  name,
  className,
  children,
  ...props
}: FooterBrandProps) {
  return (
    <div
      data-slot="footer-brand"
      className={cn("flex max-w-sm flex-col gap-4", className)}
      {...props}
    >
      <Link href={href} className="flex w-fit items-center gap-2.5">
        {logo}
        {name ? <span className="text-heading text-xl">{name}</span> : null}
      </Link>
      {children ? <p className="text-description">{children}</p> : null}
    </div>
  )
}

function FooterColumns({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-columns"
      className={cn("grid gap-8 sm:grid-cols-2 md:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

type FooterColumnProps = React.ComponentProps<"div"> & {
  title: string
}

function FooterColumn({
  title,
  className,
  children,
  ...props
}: FooterColumnProps) {
  return (
    <div
      data-slot="footer-column"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      <p className="text-label">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function FooterLink({
  label,
  href,
  className,
}: FooterLinkItem & { className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "w-fit text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      {label}
    </Link>
  )
}

function FooterDivider({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-divider"
      role="separator"
      className={cn("h-px w-full border-t border-dashed border-border", className)}
      {...props}
    />
  )
}

function FooterBar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-bar"
      className={cn(
        "flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type FooterCopyrightProps = React.ComponentProps<"p"> & {
  name?: string
}

function FooterCopyright({
  name,
  className,
  children,
  ...props
}: FooterCopyrightProps) {
  const year = new Date().getFullYear()

  return (
    <p
      data-slot="footer-copyright"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children ?? (name ? `${name} © ${year}` : null)}
    </p>
  )
}

type FooterLegalProps = React.ComponentProps<"div"> & {
  links?: FooterLinkItem[]
}

function FooterLegal({
  links = [],
  className,
  children,
  ...props
}: FooterLegalProps) {
  return (
    <div
      data-slot="footer-legal"
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}
      {...props}
    >
      {children ??
        links.map((link) => (
          <FooterLink key={`${link.label}-${link.href}`} {...link} />
        ))}
    </div>
  )
}

export {
  Footer,
  FooterBar,
  FooterBrand,
  FooterColumn,
  FooterColumns,
  FooterCopyright,
  FooterDivider,
  FooterLegal,
  FooterLink,
  FooterMain,
  FooterPanel,
  type FooterLinkItem,
}
