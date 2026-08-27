"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { squircle } from "@/lib/squircle"
import { cn } from "@/lib/utils"

const FONT_5X7: Record<string, readonly number[]> = {
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  "3": [0x0e, 0x11, 0x01, 0x06, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0e],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  "?": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
}

const avatarVariants = cva(
  "group/avatar relative flex shrink-0 overflow-hidden select-none after:pointer-events-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-6",
        lg: "size-10",
      },
      shape: {
        circle: "rounded-full after:rounded-full",
        squircle: "rounded-squircle-md after:rounded-squircle-md",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
    },
  }
)

function nodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") {
    return ""
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(nodeText).join("")
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return nodeText(node.props.children)
  }

  return ""
}


function glyphChars(text: string) {
  const chars = text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 2)

  return chars || "?"
}

function AvatarDottextGlyph({ text }: { text: string }) {
  const chars = glyphChars(text)
  const cols = chars.length * 5 + Math.max(0, chars.length - 1)
  const dots: { x: number; y: number }[] = []

  for (let i = 0; i < chars.length; i++) {
    const rows = FONT_5X7[chars[i] ?? "?"] ?? FONT_5X7["?"]!
    const ox = i * 6

    rows.forEach((row, y) => {
      for (let x = 0; x < 5; x++) {
        if (row & (1 << (4 - x))) {
          dots.push({ x: ox + x, y })
        }
      }
    })
  }

  return (
    <svg
      viewBox={`-0.2 -0.2 ${cols + 0.4} ${7.4}`}
      className="h-[58%] w-[58%]"
      aria-hidden
    >
      {dots.map((dot, index) => (
        <circle
          key={`${dot.x}-${dot.y}-${index}`}
          cx={dot.x + 0.5}
          cy={dot.y + 0.5}
          r={0.36}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

function Avatar({
  className,
  size = "default",
  shape = "circle",
  style,
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      style={shape === "squircle" ? { ...squircle, ...style } : style}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover group-data-[shape=circle]/avatar:rounded-full group-data-[shape=squircle]/avatar:rounded-squircle-md",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  variant = "default",
  hue,
  children,
  style,
  ...props
}: AvatarPrimitive.Fallback.Props & {
  variant?: "default" | "dottext"
  hue?: number
}) {
  const text = nodeText(children)
  const isDottext = variant === "dottext"
  const hasCustomHue = hue != null

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-variant={variant}
      style={
        hasCustomHue
          ? ({
              "--hue": String(hue),
              backgroundColor: `hsl(${hue} 48% 50% / 0.16)`,
              ...style,
            } as React.CSSProperties & { "--hue": string })
          : style
      }
      className={cn(
        "flex size-full items-center justify-center group-data-[shape=circle]/avatar:rounded-full group-data-[shape=squircle]/avatar:rounded-squircle-md",
        hasCustomHue
          ? isDottext
            ? "[color:hsl(var(--hue)_70%_38%)] dark:[color:hsl(var(--hue)_68%_76%)]"
            : "text-sm text-[hsl(var(--hue)_70%_38%)] dark:text-[hsl(var(--hue)_68%_76%)] group-data-[size=sm]/avatar:text-xs"
          : isDottext
            ? "bg-primary/15 text-primary"
            : "bg-primary/10 text-sm font-medium text-primary group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    >
      {isDottext ? (
        <>
          <span className="sr-only">{text}</span>
          <AvatarDottextGlyph text={text} />
        </>
      ) : (
        children
      )}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarDottext(
  props: AvatarPrimitive.Fallback.Props & { hue?: number }
) {
  return <AvatarFallback variant="dottext" {...props} />
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarDottext,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  avatarVariants,
}
