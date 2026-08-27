import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import {
  surfaceDepthInteractive,
  surfaceDepthInteractiveSquircle,
  surfaceDepthPrimary,
  surfaceDepthPrimarySquircle,
} from "@/lib/surface-depth"
import { squircle } from "@/lib/squircle"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,box-shadow,opacity] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline:
          "border-border bg-background text-foreground hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15",
        link: "text-primary underline-offset-4 hover:underline",
      },
      shape: {
        pill: "rounded-full",
        squircle: "rounded-squircle-md",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      {
        shape: "pill",
        variant: "default",
        class: surfaceDepthPrimary("pill"),
      },
      {
        shape: "squircle",
        variant: "default",
        class: surfaceDepthPrimarySquircle(),
      },
      {
        shape: "pill",
        variant: ["outline", "secondary", "destructive"],
        class: surfaceDepthInteractive("pill"),
      },
      {
        shape: "squircle",
        variant: ["outline", "secondary", "destructive"],
        class: surfaceDepthInteractiveSquircle(),
      },
    ],
    defaultVariants: {
      variant: "default",
      shape: "pill",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  shape = "pill",
  size = "default",
  style,
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      style={shape === "squircle" ? { ...squircle, ...style } : style}
      className={cn(buttonVariants({ variant, shape, size, className }))}
      render={render}
      nativeButton={nativeButton ?? !render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
