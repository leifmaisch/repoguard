import type { Severity } from "@/lib/scanner/types"

export type SecretRule = {
  id: string
  name: string
  pattern: RegExp
  severity: Severity
}

export const SECRET_RULES: SecretRule[] = [
  {
    id: "aws-access-key",
    name: "AWS Access Key ID",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    severity: "critical",
  },
  {
    id: "aws-secret-key",
    name: "AWS Secret Access Key",
    pattern: /\b(?:aws)?[_-]?secret[_-]?access[_-]?key\s*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
    severity: "critical",
  },
  {
    id: "github-pat",
    name: "GitHub Personal Access Token",
    pattern: /\bghp_[a-zA-Z0-9]{36,}\b/g,
    severity: "critical",
  },
  {
    id: "github-oauth",
    name: "GitHub OAuth Token",
    pattern: /\bgho_[a-zA-Z0-9]{36,}\b/g,
    severity: "critical",
  },
  {
    id: "github-app",
    name: "GitHub App Token",
    pattern: /\bghu_[a-zA-Z0-9]{36,}\b/g,
    severity: "critical",
  },
  {
    id: "github-fine-grained",
    name: "GitHub Fine-Grained PAT",
    pattern: /\bgithub_pat_[a-zA-Z0-9_]{60,}\b/g,
    severity: "critical",
  },
  {
    id: "gitlab-pat",
    name: "GitLab Personal Access Token",
    pattern: /\bglpat-[a-zA-Z0-9_-]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "stripe-secret",
    name: "Stripe Secret Key",
    pattern: /\b(?:sk|rk)_(?:live|test)_[a-zA-Z0-9]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "openai-key",
    name: "OpenAI API Key",
    pattern: /\bsk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "anthropic-key",
    name: "Anthropic API Key",
    pattern: /\bsk-ant-[a-zA-Z0-9_-]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "slack-token",
    name: "Slack Token",
    pattern: /\bxox[baprs]-[a-zA-Z0-9-]{10,}\b/g,
    severity: "high",
  },
  {
    id: "slack-webhook",
    name: "Slack Webhook",
    pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]+/g,
    severity: "high",
  },
  {
    id: "discord-webhook",
    name: "Discord Webhook",
    pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g,
    severity: "high",
  },
  {
    id: "google-api-key",
    name: "Google API Key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    severity: "high",
  },
  {
    id: "private-key",
    name: "Private Key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    severity: "critical",
  },
  {
    id: "jwt",
    name: "JSON Web Token",
    pattern: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    severity: "medium",
  },
  {
    id: "database-url",
    name: "Database Connection String",
    pattern: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:'"]+:[^\s@'"]+@[^\s'"]+/gi,
    severity: "critical",
  },
  {
    id: "generic-api-key",
    name: "Generic API Key Assignment",
    pattern: /(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)\s*[=:]\s*['"]([a-zA-Z0-9_\-./+=]{16,})['"]/gi,
    severity: "high",
  },
  {
    id: "password-assignment",
    name: "Hardcoded Password",
    pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"]([^'"\s]{8,})['"]/gi,
    severity: "high",
  },
  {
    id: "env-var-leak",
    name: "Environment Variable Value",
    pattern: /(?:export\s+)?[A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)\s*=\s*['"]?([^\s'"]{12,})['"]?/g,
    severity: "medium",
  },
  {
    id: "sendgrid-key",
    name: "SendGrid API Key",
    pattern: /\bSG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}\b/g,
    severity: "high",
  },
  {
    id: "npm-token",
    name: "npm Access Token",
    pattern: /\bnpm_[a-zA-Z0-9]{36,}\b/g,
    severity: "high",
  },
  {
    id: "twilio-key",
    name: "Twilio API Key",
    pattern: /\bSK[a-f0-9]{32}\b/g,
    severity: "high",
  },
]

const FALSE_POSITIVE_PATTERNS = [
  /^your[_-]?/i,
  /^xxx+$/i,
  /^changeme$/i,
  /^example$/i,
  /^placeholder$/i,
  /^<[^>]+>$/,
  /^\$\{/,
  /^process\.env\./,
  /^os\.environ/,
  /^0{8,}$/,
  /^x{8,}$/i,
]

export function redactSecret(value: string): string {
  if (value.length <= 8) {
    return "***"
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export function isLikelyFalsePositive(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 8) {
    return true
  }
  return FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(trimmed))
}
