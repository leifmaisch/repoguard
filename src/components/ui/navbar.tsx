"use client"

import Link from "next/link"
import { createContext, useContext, useState } from "react"
import { ListIcon, XIcon } from "@phosphor-icons/react"

import { iconWeight } from "@/components/shared"
import { squircle } from "@/lib/squircle"
import { surfaceDepth } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"

type NavbarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  sticky: boolean
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

function useNavbar() {
  const context = useContext(NavbarContext)

  if (!context) {
    throw new Error("Navbar components must be used within Navbar")
  }

  return context
}

function Navbar({
  className,
  sticky = false,
  children,
  ...props
}: React.ComponentProps<"header"> & {
  sticky?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <NavbarContext value={{ open, setOpen, sticky }}>
      <header
        data-slot="navbar"
        data-sticky={sticky || undefined}
        className={cn(
          "w-full px-4 py-3 sm:px-6 sm:py-4",
          sticky && "sticky top-0 z-50",
          className
        )}
        {...props}
      >
        {children}
      </header>
    </NavbarContext>
  )
}

function NavbarFrame({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const { sticky } = useNavbar()

  return (
    <div
      data-slot="navbar-frame"
      style={{ ...squircle, ...style }}
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center gap-3 rounded-squircle-lg border border-border bg-card px-3 py-2 sm:px-4",
        surfaceDepth("lg"),
        sticky && "bg-card/95 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type NavbarBrandProps = React.ComponentProps<"div"> & {
  href?: string
  logo?: React.ReactNode
  name?: string
}

function NavbarBrand({
  href = "/",
  logo,
  name,
  className,
  ...props
}: NavbarBrandProps) {
  return (
    <div data-slot="navbar-brand" className={cn("min-w-0 shrink-0", className)} {...props}>
      <Link href={href} className="flex min-w-0 items-center gap-2.5 py-1.5">
        {logo}
        {name ? <span className="text-title truncate">{name}</span> : null}
      </Link>
    </div>
  )
}

function NavbarLinks({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="navbar-links"
      className={cn(
        "hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

type NavbarLinkProps = React.ComponentProps<typeof Link> & {
  active?: boolean
  label: string
}

function NavbarLink({
  active = false,
  label,
  className,
  ...props
}: NavbarLinkProps) {
  return (
    <Link
      data-slot="navbar-link"
      data-active={active || undefined}
      className={cn(
        "rounded-full px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className
      )}
      {...props}
    >
      {label}
    </Link>
  )
}

function NavbarActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn("hidden shrink-0 items-center gap-2 md:flex", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function NavbarMenuButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = useNavbar()

  return (
    <button
      type="button"
      data-slot="navbar-menu-button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      style={squircle}
      className={cn(
        "ml-auto flex size-9 items-center justify-center rounded-squircle-md border border-border bg-muted/40 text-foreground md:hidden",
        className
      )}
      {...props}
    >
      {open ? (
        <XIcon weight={iconWeight} className="size-4" />
      ) : (
        <ListIcon weight={iconWeight} className="size-4" />
      )}
    </button>
  )
}

function NavbarMobileMenu({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useNavbar()

  if (!open) {
    return null
  }

  return (
    <div
      data-slot="navbar-mobile-menu"
      style={squircle}
      className={cn(
        "mx-auto mt-3 w-full max-w-6xl rounded-squircle-lg border border-border bg-card/95 p-3 backdrop-blur-sm md:hidden",
        surfaceDepth("md"),
        className
      )}
      {...props}
    >
      <nav
        className="flex flex-col gap-1"
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </div>
  )
}

type NavbarMobileLinkProps = React.ComponentProps<typeof Link> & {
  active?: boolean
  label: string
}

function NavbarMobileLink({
  active = false,
  label,
  className,
  ...props
}: NavbarMobileLinkProps) {
  return (
    <Link
      data-slot="navbar-mobile-link"
      data-active={active || undefined}
      className={cn(
        "rounded-squircle-md px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className
      )}
      {...props}
    >
      {label}
    </Link>
  )
}

function NavbarMobileActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-mobile-actions"
      className={cn("mt-2 flex flex-col gap-2 border-t border-border pt-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarFrame,
  NavbarLink,
  NavbarLinks,
  NavbarMenuButton,
  NavbarMobileActions,
  NavbarMobileLink,
  NavbarMobileMenu,
}
