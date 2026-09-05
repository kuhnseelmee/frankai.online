export type CurrentWork = {
  name: string
  status: string
  category: string
  summary: string
  proof: string
}

export const currentWork: CurrentWork[] = [
  {
    name: 'DroidSMS',
    status: 'Local prototype',
    category: 'Governed SMS execution',
    summary:
      'A local-first SMS control plane for planning, approving, executing and auditing Android SMS UI actions through ADB.',
    proof:
      'The latest work adds API versioning, idempotent run creation, execution/outcome separation, fake-ADB safety tests, inbound source identities, an operator review queue, retention purge controls and forwarder qualification planning.'
  },
  {
    name: 'AndroidLab Control Room',
    status: 'Local control room',
    category: 'Android network lab operations',
    summary:
      'A browser dashboard for creating a lab hotspot, provisioning an Android device over ADB and inspecting the environment from one place.',
    proof:
      'The latest work adds NetworkManager and ADB state checks, interface selection, one-click lab runs, live command history, step progress, saved local presets and downloadable run bundles.'
  }
]
