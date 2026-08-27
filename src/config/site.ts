export const siteConfig = {
  name: "RepoGuard",
  description: "GitHub repository security scanner",
  scanLimits: {
    maxCommitsWithoutToken: 5,
    maxCommitsWithToken: 100,
    defaultCommits: 5,
  },
  allowedLicenses: [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "0BSD",
    "Unlicense",
    "CC0-1.0",
    "MPL-2.0",
  ],
} as const
