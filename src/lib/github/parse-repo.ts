export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/i)
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] }
  }

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/?#]+)/i
  )
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") }
  }

  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/, "") }
  }

  return null
}
