function extractNpmLicense(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null
  }

  const pkg = data as Record<string, unknown>

  if (typeof pkg.license === "string") {
    return pkg.license
  }

  if (pkg.license && typeof pkg.license === "object" && "type" in pkg.license) {
    const type = (pkg.license as { type?: string }).type
    return type ?? null
  }

  if (Array.isArray(pkg.licenses) && pkg.licenses.length > 0) {
    const first = pkg.licenses[0]
    return typeof first === "string" ? first : ((first as { type?: string }).type ?? null)
  }

  return null
}

export async function fetchNpmLicense(name: string, version: string): Promise<string | null> {
  const encoded = encodeURIComponent(name)

  if (version && version !== "*") {
    try {
      const versionResponse = await fetch(`https://registry.npmjs.org/${encoded}/${version}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      })

      if (versionResponse.ok) {
        const license = extractNpmLicense(await versionResponse.json())
        if (license) {
          return license
        }
      }
    } catch {
      // fall through to package metadata lookup
    }
  }

  try {
    const packageResponse = await fetch(`https://registry.npmjs.org/${encoded}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    })

    if (!packageResponse.ok) {
      return null
    }

    const data = (await packageResponse.json()) as {
      versions?: Record<string, unknown>
    }

    if (version && version !== "*" && data.versions?.[version]) {
      const license = extractNpmLicense(data.versions[version])
      if (license) {
        return license
      }
    }

    return extractNpmLicense(data)
  } catch {
    return null
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = 20
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  )

  await Promise.all(workers)
  return results
}
