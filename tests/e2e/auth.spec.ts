import { expect, test } from '@playwright/test'

test('permite registrar, iniciar y cerrar una sesión local', async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.test`
  const password = 'ValidPassword123'

  await page.goto('/auth/register')
  await page.getByLabel('Nombre').fill('E2E')
  await page.getByLabel('Apellido').fill('ITGO')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByLabel('Confirmar contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByText('Cuenta creada. Revisa tu correo')).toBeVisible()

  await page.goto('/auth/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole('heading', { name: 'Acceso autenticado' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
})
