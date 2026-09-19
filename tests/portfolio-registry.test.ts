import assert from 'node:assert/strict'
import test from 'node:test'
import {
  currentDevelopmentEntries,
  getEntriesByCategory,
  getPortfolioEntry,
  portfolioCategories,
  portfolioEntries,
  portfolioMaturities,
  profileHref
} from '../lib/portfolio'
import sitemap from '../app/sitemap'

test('portfolio registry uses unique stable slugs and complete public profiles', () => {
  assert.ok(portfolioEntries.length >= 10)
  assert.equal(new Set(portfolioEntries.map((entry) => entry.slug)).size, portfolioEntries.length)

  for (const entry of portfolioEntries) {
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(entry.name.trim().length > 2)
    assert.ok(entry.summary.trim().length > 40)
    assert.ok(entry.overview.trim().length > 60)
    assert.ok(entry.capabilities.length >= 3)
    assert.ok(entry.evidence.trim().length > 40)
    assert.ok(portfolioCategories.includes(entry.category))
    assert.ok(portfolioMaturities.includes(entry.maturity))
    assert.equal(profileHref(entry), `/portfolio/${entry.slug}`)
  }
})

test('category and current-development views derive from the canonical registry', () => {
  const groupedSlugs = portfolioCategories.flatMap((category) =>
    getEntriesByCategory(category).map((entry) => entry.slug)
  )
  assert.deepEqual(new Set(groupedSlugs), new Set(portfolioEntries.map((entry) => entry.slug)))
  assert.deepEqual(
    currentDevelopmentEntries.map((entry) => entry.slug),
    portfolioEntries.filter((entry) => entry.current).map((entry) => entry.slug)
  )
})

test('named FrankAI systems remain represented under their public identities', () => {
  const expectedProjects = new Map([
    ['multistream', 'MultiStream'],
    ['androidlab-control-room', 'AndroidLab Control Room'],
    ['raywooler-online', 'raywooler.online'],
    ['career-tracker', 'Career Tracker'],
    ['inspect-pro', 'Inspect Pro'],
    ['careepoch', 'CareEpoch']
  ])

  for (const [slug, name] of expectedProjects) {
    assert.equal(getPortfolioEntry(slug)?.name, name)
  }
})

test('public links are deliberate and failed endpoints remain withheld', () => {
  const approvedHosts = new Set([
    'frankai.online',
    'jobs.frankai.online',
    'multistream.hnrhardhouse.online',
    'openwa.frankai.online',
    'raywooler.online',
    'servicedesk.frankai.online'
  ])

  for (const entry of portfolioEntries) {
    if (!entry.publicUrl || entry.publicUrl.startsWith('/')) continue
    const url = new URL(entry.publicUrl)
    assert.equal(url.protocol, 'https:')
    assert.ok(approvedHosts.has(url.hostname))
  }

  assert.equal(getPortfolioEntry('signal-ledger')?.publicUrl, undefined)
})

test('anonymised profiles expose architecture without direct contact or location data', () => {
  const anonymised = portfolioEntries.filter((entry) => entry.visibility === 'Anonymised')
  assert.ok(anonymised.length >= 2)

  for (const entry of anonymised) {
    const publicText = [entry.name, entry.summary, entry.overview, ...entry.capabilities, entry.evidence].join(' ')
    assert.doesNotMatch(publicText, /@|https?:\/\/|\b\d{6,}\b/)
    assert.equal(entry.publicUrl, undefined)
  }
})

test('public sitemap includes portfolio profiles and excludes protected surfaces', () => {
  const urls = sitemap().map((entry) => entry.url)

  for (const entry of portfolioEntries) {
    assert.ok(urls.includes(`https://frankai.online${profileHref(entry)}`))
  }

  assert.equal(urls.some((url) => /\/(?:admin|api|account|login)(?:\/|$)/.test(url)), false)
})
