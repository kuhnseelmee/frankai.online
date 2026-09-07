import { expect, test } from '@playwright/test'

const servicePath = '/services/ai-consulting'
const serviceTitle = 'AI Consulting & Agentic Systems'
const subtitle = 'Industry-specific AI implementation, intelligent workflow automation, and agentic AI platform development.'

// Public GET navigation only: this suite can also verify the production site.
test.use({ ignoreHTTPSErrors: false })

test('service page presents the commercial offer and all ten service areas', async ({ page }) => {
  const response = await page.goto(servicePath)
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: serviceTitle, exact: true, level: 1 })).toBeVisible()
  await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
  await expect(page.getByText('Specialised / Enterprise', { exact: true })).toBeVisible()
  await expect(page.getByText('We engineer AI into real operational systems.', { exact: true })).toBeVisible()

  const areas = page.getByRole('region', { name: 'Service areas', exact: true })
  await expect(areas.getByRole('listitem')).toHaveCount(10)
  for (const topic of [
    /strategy.*readiness|readiness.*strategy/i,
    /industry-specific.*workflow/i,
    /agentic AI.*architecture.*development/i,
    /orchestration.*tool|tool.*orchestration/i,
    /business.process.*automation/i,
    /knowledge.*RAG|RAG.*knowledge/i,
    /API.*database.*enterprise/i,
    /private.*local.*hybrid/i,
    /governance.*permissions.*auditability.*human oversight/i,
    /evaluation.*observability.*production hardening/i,
  ]) {
    await expect(areas.getByRole('listitem').filter({ hasText: topic })).toHaveCount(1)
  }

  for (const phase of ['Advisory', 'Implementation', 'Platform Engineering']) {
    await expect(page.getByRole('heading', { name: phase, exact: true })).toBeVisible()
  }
  await expect(page.locator('main')).not.toContainText('Specialized Enterprise demand')
})

for (const source of ['/', '/solutions']) {
  test(`customers can discover the service from ${source}`, async ({ page }) => {
    await page.goto(source)
    const link = page.getByRole('link', { name: `Explore ${serviceTitle}`, exact: true })
    await expect(link).toHaveAttribute('href', servicePath)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${servicePath}/?$`))
    await expect(page.getByRole('heading', { name: serviceTitle, exact: true, level: 1 })).toBeVisible()
  })
}

test('desktop navigation and footer expose the defined service', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const services = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services', exact: true })
  await expect(services).toBeVisible()
  await expect(services).toHaveAttribute('href', servicePath)
  await services.click()
  await expect(page.getByRole('heading', { name: serviceTitle, exact: true, level: 1 })).toBeVisible()
  await expect(page.getByRole('contentinfo').getByRole('link', { name: serviceTitle, exact: true })).toHaveAttribute('href', servicePath)
})

test('project discussion call to action opens contact without submitting anything', async ({ page }) => {
  await page.goto(servicePath)
  const contact = page.getByRole('link', { name: 'Discuss your AI project', exact: true })
  await expect(contact).toHaveAttribute('href', '/contact')
  await contact.click()
  await expect(page).toHaveURL(/\/contact\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

for (const width of [390, 768, 1024, 1440]) {
  test(`service and discovery pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    for (const path of [servicePath, '/', '/solutions']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const dimensions = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }))
      expect(dimensions.content, `${path} overflows at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  })
}
