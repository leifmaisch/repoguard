import type { Metadata } from "next"

import { ScannerDashboard } from "@/components/scanner/scanner-dashboard"
import { siteConfig } from "@/config/site"
import { leguanFontVariables } from "@/lib/fonts"

import "./globals.css"

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export const viewport = {
  colorScheme: "dark",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${leguanFontVariables} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  )
}
