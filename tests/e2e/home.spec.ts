import { expect, test } from '@playwright/test'

test('la portada permite acceder al inicio de sesión', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByText('ITGO', { exact: true })).toBeVisible()
  await expect(page.getByText('Base técnica inicializada')).toBeVisible()
  await page.getByRole('link', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(
    page.getByRole('heading', { name: /iniciar sesión/i }),
  ).toBeVisible()
  expect(errors).toEqual([])
})
