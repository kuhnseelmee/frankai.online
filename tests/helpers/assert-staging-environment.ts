export function assertSafeStagingEnvironment() {
  if (process.env.STAGING_E2E !== 'true') throw new Error('Staging tests require STAGING_E2E=true')
  if (process.env.AUTH_DATABASE_ENABLED !== 'true') throw new Error('Staging tests require AUTH_DATABASE_ENABLED=true')

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('Staging tests require DATABASE_URL')

  const parsed = new URL(databaseUrl)
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''))
  if (databaseName === 'frankai_auth' || databaseName !== 'frankai_auth_staging') throw new Error('Refusing to run staging tests against a non-staging database')
  if (process.env.APP_BASE_URL === 'https://frankai.online') throw new Error('Refusing to run staging tests with the production application origin')
  if (process.env.STAGING_BASE_URL && !process.env.STAGING_BASE_URL.includes('staging.localhost')) throw new Error('Refusing to run staging tests with a non-staging browser origin')
}
