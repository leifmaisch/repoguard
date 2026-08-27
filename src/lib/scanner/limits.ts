export const MAX_COMMITS_WITHOUT_TOKEN = 5
export const MAX_COMMITS_WITH_TOKEN = 100
export const DEFAULT_COMMIT_LIMIT = 5

export function hasGitHubToken(token?: string): boolean {
  return Boolean(token?.trim())
}

export function resolveCommitLimit(commitLimit: number, token?: string): number {
  const max = hasGitHubToken(token) ? MAX_COMMITS_WITH_TOKEN : MAX_COMMITS_WITHOUT_TOKEN
  return Math.min(Math.max(commitLimit, 1), max)
}
