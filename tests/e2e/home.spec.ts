import { expect, test } from '@playwright/test'

test('la portada informa el estado real de la plataforma', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByText('ITGO', { exact: true })).toBeVisible()
  await expect(page.getByText('Base técnica inicializada')).toBeVisible()
  await expect(
    page.getByRole('button', { name: /ingreso disponible/i }),
  ).toBeDisabled()
  expect(errors).toEqual([])
})
