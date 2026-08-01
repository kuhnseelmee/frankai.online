export function assertSafeStagingEnvironment() {
  if (process.env.STAGING_E2E !== 'true') throw new Error('Staging tests require STAGING_E2E=true')
  if (process.env.AUTH_DATABASE_ENABLED !== 'true') throw new Error('Staging tests require AUTH_DATABASE_ENABLED=true')
  if (process.env.DATABASE_NAME !== 'frankai_auth_staging') throw new Error('Staging tests require DATABASE_NAME=frankai_auth_staging')
  if (process.env.APP_BASE_URL !== 'https://staging.localhost:8443') throw new Error('Staging tests require the staging application origin')
  if (process.env.VOICE_ENABLED !== 'false') throw new Error('Staging tests require VOICE_ENABLED=false')
  if (process.env.PRODUCTION_DATABASE_URL || process.env.PRODUCTION_ENV_FILE || process.env.FRANKAI_PRODUCTION_ENVIRONMENT === 'true') throw new Error('Refusing to run staging tests with production environment loaded')

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('Staging tests require DATABASE_URL')

  const parsed = new URL(databaseUrl)
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''))
  if (databaseName === 'frankai_auth' || databaseName !== 'frankai_auth_staging') throw new Error('Refusing to run staging tests against a non-staging database')
  if (parsed.pathname !== '/frankai_auth_staging') throw new Error('Refusing to run staging tests against a non-staging database')
  if (parsed.hostname === 'frankai.online') throw new Error('Refusing to run staging tests against production')
  if (process.env.STAGING_BASE_URL && !process.env.STAGING_BASE_URL.includes('staging.localhost')) throw new Error('Refusing to run staging tests with a non-staging browser origin')
}
