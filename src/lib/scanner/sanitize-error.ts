const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
const IPV6_PATTERN = /\b(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/gi
const GITHUB_TOKEN_PATTERN = /\b(?:ghp|gho|ghu|github_pat)_[a-zA-Z0-9_]+\b/g
const NPM_TOKEN_PATTERN = /\bnpm_[a-zA-Z0-9]+\b/g
const URL_CREDENTIALS_PATTERN = /\/\/[^\s@/]+@[^\s/]+/g

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined
  }

  const status = (error as { status: unknown }).status
  return typeof status === "number" ? status : undefined
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unknown error"
}

function isRateLimitError(error: unknown, message: string): boolean {
  const status = getErrorStatus(error)
  const normalized = message.toLowerCase()

  return (
    status === 429 ||
    (status === 403 && normalized.includes("rate limit")) ||
    normalized.includes("secondary rate limit") ||
    normalized.includes("abuse detection")
  )
}

function isAuthError(error: unknown, message: string): boolean {
  const status = getErrorStatus(error)
  const normalized = message.toLowerCase()

  return (
    status === 401 ||
    (status === 403 &&
      (normalized.includes("bad credentials") ||
        normalized.includes("requires authentication")))
  )
}

function isNotFoundError(error: unknown, message: string): boolean {
  const status = getErrorStatus(error)
  const normalized = message.toLowerCase()

  return status === 404 || normalized.includes("not found")
}

export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(URL_CREDENTIALS_PATTERN, "//[redacted]@")
    .replace(GITHUB_TOKEN_PATTERN, "[redacted]")
    .replace(NPM_TOKEN_PATTERN, "[redacted]")
    .replace(IPV6_PATTERN, "[redacted]")
    .replace(IPV4_PATTERN, "[redacted]")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export function toPublicScanError(error: unknown): string {
  const message = getErrorMessage(error)

  if (isRateLimitError(error, message)) {
    return "GitHub API rate limit exceeded. Wait a few minutes or add a token for higher limits."
  }

  if (isAuthError(error, message)) {
    return "GitHub authentication failed. Check your token and try again."
  }

  if (isNotFoundError(error, message)) {
    return "Repository not found or inaccessible. Check the URL and token."
  }

  const status = getErrorStatus(error)
  if (status && status >= 500) {
    return "GitHub is temporarily unavailable. Try again later."
  }

  return "Scan failed. Try again later."
}

export function toPublicPartialScanError(error: unknown): string {
  const message = getErrorMessage(error)

  if (isRateLimitError(error, message)) {
    return "License scan stopped: GitHub API rate limit exceeded."
  }

  if (message.toLowerCase().includes("license")) {
    return "License scan failed."
  }

  if (message.toLowerCase().includes("secret")) {
    return "Secret scan failed."
  }

  return toPublicScanError(error)
}

export function logScanError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[scan] ${context}:`, error.message)
    return
  }

  console.error(`[scan] ${context}:`, error)
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof PublicScanError) {
    return error.statusCode
  }

  if (isRateLimitError(error, getErrorMessage(error))) {
    return 429
  }

  if (isAuthError(error, getErrorMessage(error))) {
    return 401
  }

  if (isNotFoundError(error, getErrorMessage(error))) {
    return 404
  }

  return 500
}

export class PublicScanError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "PublicScanError"
    this.statusCode = statusCode
  }
}

export function throwPublicScanError(error: unknown): never {
  throw new PublicScanError(toPublicScanError(error), getErrorStatusCode(error))
}

export function getPublicErrorMessage(error: unknown): string {
  if (error instanceof PublicScanError) {
    return error.message
  }

  return toPublicScanError(error)
}
