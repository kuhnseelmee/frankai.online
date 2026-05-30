import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { defaultPlatformConfig, type PlatformConfig } from './config'
import { validatePlatformConfig } from './validation'

const DEFAULT_PLATFORM_CONFIG_FILE = '/var/lib/frankai-site/platform/config.json'

function getPlatformConfigPath() {
  return process.env.FRANKAI_PLATFORM_CONFIG_FILE || DEFAULT_PLATFORM_CONFIG_FILE
}

function getParentDirectory(filepath: string) {
  const separator = filepath.lastIndexOf('/')
  return separator > 0 ? filepath.slice(0, separator) : '.'
}

async function writePlatformConfig(config: PlatformConfig) {
  const filepath = getPlatformConfigPath()
  await mkdir(/* turbopackIgnore: true */ getParentDirectory(filepath), { recursive: true })
  await writeFile(/* turbopackIgnore: true */ filepath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

export async function readPlatformConfig(): Promise<PlatformConfig> {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ getPlatformConfigPath(), 'utf8')
    return validatePlatformConfig(JSON.parse(raw))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {
        ...defaultPlatformConfig,
        updatedAt: new Date().toISOString()
      }
    }

    throw error
  }
}

export async function savePlatformDraft(input: unknown) {
  const current = await readPlatformConfig()
  const draft = validatePlatformConfig({
    ...(typeof input === 'object' && input !== null ? input : {}),
    publishedAt: current.publishedAt,
    publishedBy: current.publishedBy,
    updatedAt: new Date().toISOString()
  })

  await writePlatformConfig(draft)
  return draft
}

export async function publishPlatformConfig(publishedBy: string) {
  const current = await readPlatformConfig()
  const published = validatePlatformConfig({
    ...current,
    publishedAt: new Date().toISOString(),
    publishedBy,
    updatedAt: new Date().toISOString()
  })

  await writePlatformConfig(published)
  return published
}
