# RepoGuard

GitHub repository license and dependency tree compliance checker with commit security scanning for leaked environment variables, API keys, and secrets.


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

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
