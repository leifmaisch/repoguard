import { Geist_Mono, Inter, Rubik } from "next/font/google"

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const leguanFontVariables = [
  inter.variable,
  geistMono.variable,
  rubik.variable,
].join(" ")
