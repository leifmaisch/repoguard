# RepoGuard

GitHub repository license and dependency tree compliance checker with commit security scanning for leaked environment variables, API keys, and secrets.

## Features

- **License compliance**: Reads `package.json`, lockfiles, and `requirements.txt` to build a dependency tree and checks licenses against an allowlist
- **Repository license**: Reports the SPDX license on the GitHub repository
- **Secret scanner**: Scans recent commit diffs for AWS keys, GitHub tokens, Stripe keys, private keys, database URLs, hardcoded passwords, and more
- **GitHub API**: Works with public repos; optional token for private repos and higher rate limits

## Stack

- Next.js 16 (App Router)
- Leguan UI
- Octokit
- TypeScript

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), enter a repository like `vercel/next.js`, and run a scan.

## API

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "owner/repo",
    "scanLicense": true,
    "scanSecrets": true,
    "commitLimit": 30
  }'
```

Optional fields:

- `token`: GitHub personal access token (not stored)
- `allowedLicenses`: custom SPDX allowlist
- `scanLicense` / `scanSecrets`: toggle scan types

## Configuration

Default allowed licenses are defined in `src/config/site.ts`.

Secret detection rules live in `src/lib/scanner/patterns.ts`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Security notes

- GitHub tokens are sent only to your server for the scan request and are not persisted
- Secret matches are redacted in the UI
- Scans commit diffs only, not full file history
- For production use, run behind authentication and consider rate limiting
