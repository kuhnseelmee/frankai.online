import { existsSync, readFileSync } from 'node:fs'

const DEFAULT_BASE_URL = 'https://frankai.online'
const DEFAULT_ENV_FILE = '.env'
const PAGE_PATHS = ['/', '/platform', '/docs', '/governance', '/rollout', '/release-cycle', '/memory', '/trust']
const TOKEN_ENV_NAME = 'MEMORY_INGEST_SECRET'

const baseUrl = normalizeBaseUrl(process.env.READINESS_BASE_URL || DEFAULT_BASE_URL)
const envFile = process.env.READINESS_ENV_FILE || DEFAULT_ENV_FILE
const envValues = readLocalEnv(envFile)
const memoryToken = process.env[TOKEN_ENV_NAME] || envValues[TOKEN_ENV_NAME]
const results = []

const healthResponse = await request('/api/health')
assertStatus(healthResponse, [200], '/api/health endpoint')
assertContentType(healthResponse, 'application/json', '/api/health endpoint')
const health = await healthResponse.json()
if (health?.ok !== true || health?.service !== 'frankai-site') {
  throw new Error('/api/health returned an unexpected payload')
}

for (const path of PAGE_PATHS) {
  const response = await request(path)
  assertStatus(response, [200], `${path} page`)
  assertContentType(response, 'text/html', `${path} page`)
}

const homeResponse = await request('/')
const homeHtml = await homeResponse.text()
const cssAssets = extractCssAssets(homeHtml)
if (cssAssets.length === 0) {
  throw new Error('No _next CSS assets were found on the homepage.')
}

for (const cssAsset of cssAssets) {
  const response = await request(cssAsset)
  assertStatus(response, [200], `${cssAsset} asset`)
  assertContentType(response, 'text/css', `${cssAsset} asset`)
}

if (memoryToken) {
  const searchResponse = await request('/api/memory/search', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${memoryToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ query: 'readiness', limit: 1 })
  })
  assertStatus(searchResponse, [200], 'authenticated memory search')

  const ingestResponse = await request('/api/memory/ingest', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${memoryToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({})
  })
  assertStatus(ingestResponse, [400], 'authenticated memory ingest validation')
} else {
  results.push({
    label: 'authenticated memory endpoints',
    status: 'skipped',
    detail: `${TOKEN_ENV_NAME} was not found in the environment or local env file`
  })
}

for (const result of results) {
  const prefix = result.status === 'skipped' ? 'SKIP' : 'OK'
  console.log(`${prefix} ${result.label} - ${result.detail}`)
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '')
}

function readLocalEnv(path) {
  if (!existsSync(path)) {
    return {}
  }

  const values = {}
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) {
      continue
    }

    values[match[1]] = unquoteEnvValue(match[2].trim())
  }

  return values
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

async function request(path, init) {
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  let response

  try {
    response = await fetch(url, init)
  } catch (error) {
    throw new Error(`${url} request failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  return response
}

function assertStatus(response, expectedStatuses, label) {
  if (!expectedStatuses.includes(response.status)) {
    throw new Error(`${label} returned ${response.status}; expected ${expectedStatuses.join(' or ')}`)
  }

  results.push({
    label,
    status: 'ok',
    detail: `HTTP ${response.status}`
  })
}

function assertContentType(response, expectedContentType, label) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes(expectedContentType)) {
    throw new Error(`${label} returned content-type "${contentType}"; expected ${expectedContentType}`)
  }
}

function extractCssAssets(html) {
  const assets = new Set()
  const hrefPattern = /href=["']([^"']*\/_next\/static\/[^"']+\.css(?:\?[^"']*)?)["']/g
  let match

  while ((match = hrefPattern.exec(html)) !== null) {
    assets.add(match[1])
  }

  return [...assets]
}
