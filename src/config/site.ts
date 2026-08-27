export const siteConfig = {
  name: "RepoGuard",
  description:
    "Scan GitHub repositories for license compliance, dependency tree issues, and leaked secrets in commit history.",
  allowedLicenses: [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "0BSD",
    "Unlicense",
    "CC0-1.0",
  ],
} as const
