import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const standaloneDir = join(root, '.next', 'standalone')
const standaloneNextDir = join(standaloneDir, '.next')
const nestedStandaloneDir = join(standaloneDir, 'frankai-site')
const nestedStandaloneNextDir = join(nestedStandaloneDir, '.next')
const staticSource = join(root, '.next', 'static')
const staticTarget = join(standaloneNextDir, 'static')
const publicSource = join(root, 'public')
const publicTarget = join(standaloneDir, 'public')
const nestedPublicTarget = join(nestedStandaloneDir, 'public')
const standaloneEnv = join(standaloneDir, '.env')
const nestedStandaloneEnv = join(standaloneDir, 'frankai-site', '.env')

if (!existsSync(standaloneDir)) {
  throw new Error('Missing .next/standalone. Run this after a successful Next.js standalone build.')
}

if (!existsSync(staticSource)) {
  throw new Error('Missing .next/static. Next.js static assets were not generated.')
}

// Next may copy local env files into standalone output. systemd supplies runtime
// configuration; never ship repository env contents with the deploy artifact.
rmSync(standaloneEnv, { force: true })
rmSync(nestedStandaloneEnv, { force: true })

mkdirSync(standaloneNextDir, { recursive: true })
rmSync(staticTarget, { recursive: true, force: true })
cpSync(staticSource, staticTarget, { recursive: true })
// The service executes the nested standalone server while keeping the project
// root as its working directory. Keep the client assets beside that server as
// well; otherwise SSR works but browser hydration assets return 404.
mkdirSync(nestedStandaloneNextDir, { recursive: true })
const nestedStaticTarget = join(nestedStandaloneNextDir, 'static')
rmSync(nestedStaticTarget, { recursive: true, force: true })
cpSync(staticSource, nestedStaticTarget, { recursive: true })

if (existsSync(publicSource)) {
  rmSync(publicTarget, { recursive: true, force: true })
  cpSync(publicSource, publicTarget, { recursive: true })
  rmSync(nestedPublicTarget, { recursive: true, force: true })
  cpSync(publicSource, nestedPublicTarget, { recursive: true })
}

console.log('Copied .next/static and public assets into .next/standalone.')
