import type { Octokit } from "@octokit/rest"

import { fetchRepoFile } from "@/lib/github/client"

const LICENSE_PATHS = ["LICENSE", "LICENSE.md", "LICENSE.txt", "License", "COPYING"]

const LICENSE_PATTERNS: Array<{ pattern: RegExp; spdx: string }> = [
  { pattern: /apache license,?\s+version 2\.0/i, spdx: "Apache-2.0" },
  { pattern: /\bmit license\b/i, spdx: "MIT" },
  { pattern: /bsd 3-clause/i, spdx: "BSD-3-Clause" },
  { pattern: /bsd 2-clause/i, spdx: "BSD-2-Clause" },
  { pattern: /\bisc license\b/i, spdx: "ISC" },
  { pattern: /mozilla public license,?\s+version 2\.0/i, spdx: "MPL-2.0" },
  { pattern: /gnu lesser general public license/i, spdx: "LGPL-3.0-or-later" },
  { pattern: /gnu general public license/i, spdx: "GPL-3.0-or-later" },
  { pattern: /the unlicense/i, spdx: "Unlicense" },
  { pattern: /creative commons zero/i, spdx: "CC0-1.0" },
]

export async function detectRepositoryLicense(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.get({ owner, repo })
    if (data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION") {
      return data.license.spdx_id
    }
  } catch {
    return null
  }

  for (const path of LICENSE_PATHS) {
    const content = await fetchRepoFile(octokit, owner, repo, path)
    if (!content) {
      continue
    }

    for (const { pattern, spdx } of LICENSE_PATTERNS) {
      if (pattern.test(content)) {
        return spdx
      }
    }
  }

  return null
}
