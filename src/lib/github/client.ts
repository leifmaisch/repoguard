import { Octokit } from "@octokit/rest"

export function createGitHubClient(token?: string) {
  return new Octokit({
    auth: token || undefined,
    userAgent: "repo-guard-scanner",
  })
}

export async function fetchRepoFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path })
    if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
      return null
    }
    return Buffer.from(data.content, "base64").toString("utf-8")
  } catch {
    return null
  }
}
