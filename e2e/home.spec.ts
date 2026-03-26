import { expect, test } from '@playwright/test'

test('homepage renders project title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Daily Drawing Fundamentals Trainer')).toBeVisible()
})
