const SENSITIVE_KEYS = /(?:password|passwordhash|secret|token|accesstoken|refreshtoken|authorization|cookie|set-cookie|invitationtoken|verificationtoken|resettoken|totpsecret|provisioninguri|recoverycode|smtppassword|databasepassword|hostingertoken|opena[keyi]|privatekey)/i
const FORBIDDEN_VALUES = [
  /eyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i, /\bBearer\s+[a-z0-9._~+/=-]{16,}/i,
  /otpauth:\/\//i, /-----BEGIN [A-Z ]*PRIVATE KEY-----/i, /(?:postgres|mysql|mongodb):\/\/[^\s/]+:[^\s@]+@/i,
  /(?:\/signup\/invite|\/verify-email|\/reset-password)\?[^\s]*token=/i, /(?:^|[;\s])(set-cookie|cookie):/i,
  /\b(?:sk|hf|ghp|gho)_[a-z0-9_-]{16,}\b/i, /\b[A-Z0-9]{4,8}(?:-[A-Z0-9]{4,8}){2,}\b/
]

const forbidden = (value: string) => FORBIDDEN_VALUES.some(pattern => pattern.test(value))
export function redactAuditValue(value: unknown, key = ''): unknown {
  if (SENSITIVE_KEYS.test(key)) return '[REDACTED]'
  if (typeof value === 'string') return forbidden(value) ? '[REDACTED]' : value
  if (value instanceof Error) return { name: value.name, message: redactAuditValue(value.message, 'errorMessage'), cause: value.cause === undefined ? undefined : redactAuditValue(value.cause, 'cause') }
  if (Array.isArray(value)) return value.map(item => redactAuditValue(item, key))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redactAuditValue(childValue, childKey)]))
  return value
}
export function redactAuditMetadata(metadata: Record<string, unknown>) { return redactAuditValue(metadata) as Record<string, unknown> }
