import { expect, test } from '@playwright/test'

test('public and protected staging boundaries', async ({ page, context }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/FrankAI/i)
  await expect(page.locator('body')).toContainText(/sign in|login/i)

  const admin = await context.request.get('/admin', { maxRedirects: 0 })
  expect([301, 302, 307, 308]).toContain(admin.status())

  await page.goto('/voice')
  await expect(page.locator('body')).toContainText(/not yet available|disabled|unavailable/i)

  const local = await page.evaluate(() => ({
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage),
  }))
  expect(local.localStorage).not.toContain('accessToken')
  expect(local.localStorage).not.toContain('refreshToken')
  expect(local.sessionStorage).not.toContain('accessToken')
  expect(local.sessionStorage).not.toContain('refreshToken')
})

test('voice page never requests microphone permission', async ({ page }) => {
  let microphoneRequested = false
  page.on('console', message => {
    if (/microphone|getUserMedia/i.test(message.text())) microphoneRequested = true
  })
  await page.goto('/voice')
  await page.waitForTimeout(250)
  expect(microphoneRequested).toBe(false)
})
