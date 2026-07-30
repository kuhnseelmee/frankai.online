import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { SectionIntro } from '@/components/SectionIntro'
import { PlatformAdminClient } from '@/components/platform/PlatformAdminClient'
import { requireAdmin } from '@/lib/auth/http'
import { readPlatformConfig } from '@/lib/platform/store'

export const metadata: Metadata = {
  title: 'Platform Console',
  description: 'Private FrankAI platform control surface.'
}

export const dynamic = 'force-dynamic'

export default async function PlatformAdminPage() {
  const requestHeaders = await headers()
  const authResponse = (await requireAdmin(new Request('https://frankai.online/admin/platform', { headers: requestHeaders }))).response

  if (authResponse) {
    return (
      <section className="page-section">
        <div className="container">
          <SectionIntro
            eyebrow="Private console"
            title="Platform admin is locked."
            text="This console requires FrankAI platform admin credentials before configuration, agent registry or governance state can be viewed."
          />
        </div>
      </section>
    )
  }

  const config = await readPlatformConfig()
  const blockingItems = config.governanceChecklist.filter(
    (item) => item.blocksProgression && item.status !== 'approved' && item.status !== 'deferred'
  ).length
  const activeAgents = config.agents.filter(
    (agent) => agent.runtimeState === 'active' || agent.runtimeState === 'pilot'
  ).length

  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Private console"
          title="FrankAI platform control surface."
          text="Draft, validate and approval-publish platform stages, capability tracks, agent registry and governance gates."
        />
        <div className="admin-summary">
          <article>
            <span>Stages</span>
            <strong>{config.stages.length}</strong>
          </article>
          <article>
            <span>Agents in pilot/active</span>
            <strong>{activeAgents}</strong>
          </article>
          <article>
            <span>Open blocking gates</span>
            <strong>{blockingItems}</strong>
          </article>
        </div>
        <PlatformAdminClient initialConfig={config} />
      </div>
    </section>
  )
}
