import { parse as parseYaml } from "yaml"

export type ParsedDependency = {
  name: string
  version: string
}

const MANIFEST_FILES = [
  "package.json",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "requirements.txt",
  "Pipfile",
  "go.mod",
  "Cargo.toml",
]

export function getManifestFileNames(): string[] {
  return MANIFEST_FILES
}

export function parsePackageJson(content: string): ParsedDependency[] {
  const data = JSON.parse(content) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    optionalDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }

  const deps = new Map<string, string>()

  for (const section of [
    data.dependencies,
    data.devDependencies,
    data.optionalDependencies,
    data.peerDependencies,
  ]) {
    if (!section) continue
    for (const [name, version] of Object.entries(section)) {
      deps.set(name, version.replace(/^[\^~>=<]*/, ""))
    }
  }

  return Array.from(deps.entries()).map(([name, version]) => ({ name, version }))
}

export function parsePnpmPackageKey(key: string): { name: string; version: string } | null {
  const base = key.replace(/\(.*$/, "")

  if (base.startsWith("@")) {
    const versionAt = base.indexOf("@", 1)
    if (versionAt === -1) {
      return null
    }

    return {
      name: base.slice(0, versionAt),
      version: base.slice(versionAt + 1),
    }
  }

  const versionAt = base.indexOf("@")
  if (versionAt <= 0) {
    return null
  }

  return {
    name: base.slice(0, versionAt),
    version: base.slice(versionAt + 1),
  }
}

export function parsePnpmLock(content: string): ParsedDependency[] {
  const data = parseYaml(content) as {
    packages?: Record<string, unknown>
    importers?: Record<string, { dependencies?: Record<string, { version?: string }> }>
  }

  const deps = new Map<string, string>()

  if (data.packages) {
    for (const key of Object.keys(data.packages)) {
      const parsed = parsePnpmPackageKey(key)
      if (!parsed) {
        continue
      }
      deps.set(parsed.name, parsed.version)
    }
  }

  if (deps.size === 0 && data.importers) {
    for (const importer of Object.values(data.importers)) {
      if (!importer.dependencies) continue
      for (const [name, spec] of Object.entries(importer.dependencies)) {
        const version = spec.version?.match(/^\(([^)]+)\)/)?.[1] ?? spec.version ?? "*"
        deps.set(name, version)
      }
    }
  }

  return Array.from(deps.entries()).map(([name, version]) => ({ name, version }))
}

export function parsePackageLock(content: string): ParsedDependency[] {
  const data = JSON.parse(content) as {
    packages?: Record<string, { version?: string }>
    dependencies?: Record<string, { version?: string }>
  }

  const deps = new Map<string, string>()

  if (data.packages) {
    for (const [path, pkg] of Object.entries(data.packages)) {
      if (!path || path === "") continue
      const name = path.startsWith("node_modules/")
        ? path.replace(/^node_modules\//, "")
        : path
      if (pkg.version) {
        deps.set(name, pkg.version)
      }
    }
  } else if (data.dependencies) {
    for (const [name, pkg] of Object.entries(data.dependencies)) {
      if (pkg.version) {
        deps.set(name, pkg.version)
      }
    }
  }

  return Array.from(deps.entries()).map(([name, version]) => ({ name, version }))
}

export function parseRequirementsTxt(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []

  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue

    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(?:[=<>!~]+(.+))?/)
    if (match) {
      deps.push({ name: match[1], version: match[2] ?? "*" })
    }
  }

  return deps
}
