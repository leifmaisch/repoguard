import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { squircle } from "@/lib/squircle"
import { surfaceDepth } from "@/lib/surface-depth"
import { cn } from "@/lib/utils"
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type TestimonialCardProps = React.ComponentProps<"article"> & {
  quote: string
  name: string
  role: string
  featured?: boolean
  avatar?: React.ReactNode
}

function TestimonialCard({
  quote,
  name,
  role,
  featured = false,
  avatar,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <article
      data-slot="testimonial-card"
      style={squircle}
      className={cn(
        "flex h-full flex-col rounded-squircle-lg border border-border bg-muted/30 p-2",
        className
      )}
      {...props}
    >
      <div
        style={squircle}
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden rounded-squircle-md border p-6 sm:p-7",
          surfaceDepth("md"),
          featured
            ? "border-primary/35 bg-primary/5"
            : "border-border bg-card"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_100%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_65%)]"
        />
        <blockquote className="relative text-sm leading-relaxed sm:text-[15px]">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <footer className="flex items-center gap-3 px-3 pb-1 pt-3">
        {avatar ?? (
          <Avatar size="default">
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0">
          <cite className="not-italic text-title text-sm">{name}</cite>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
      </footer>
    </article>
  )
}

type TestimonialsProps = Omit<React.ComponentProps<typeof Section>, "children"> & {
  title?: string
  description?: string
  children: React.ReactNode
}

function Testimonials({
  title,
  description,
  className,
  children,
  ...props
}: TestimonialsProps) {
  return (
    <Section data-slot="testimonials" className={className} {...props}>
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

export { TestimonialCard, Testimonials }
