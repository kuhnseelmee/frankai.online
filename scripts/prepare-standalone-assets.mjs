import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const standaloneDir = join(root, '.next', 'standalone')
const standaloneNextDir = join(standaloneDir, '.next')
const staticSource = join(root, '.next', 'static')
const staticTarget = join(standaloneNextDir, 'static')
const publicSource = join(root, 'public')
const publicTarget = join(standaloneDir, 'public')

if (!existsSync(standaloneDir)) {
  throw new Error('Missing .next/standalone. Run this after a successful Next.js standalone build.')
}

if (!existsSync(staticSource)) {
  throw new Error('Missing .next/static. Next.js static assets were not generated.')
}

mkdirSync(standaloneNextDir, { recursive: true })
rmSync(staticTarget, { recursive: true, force: true })
cpSync(staticSource, staticTarget, { recursive: true })

if (existsSync(publicSource)) {
  rmSync(publicTarget, { recursive: true, force: true })
  cpSync(publicSource, publicTarget, { recursive: true })
}

console.log('Copied .next/static and public assets into .next/standalone.')
