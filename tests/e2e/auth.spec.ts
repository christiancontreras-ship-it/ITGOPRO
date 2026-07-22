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
  await expect(page).toHaveURL(/\/app\/onboarding$/, { timeout: 15_000 })
  await page.getByLabel('Razón social').fill(`ITGO E2E ${Date.now()} SpA`)
  await page.getByLabel('Nombre de fantasía').fill('ITGO E2E')
  await page.getByRole('button', { name: 'Crear empresa' }).click()
  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 })
  await expect(page.getByText('Panel cliente')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('link', { name: 'Crear ticket' }).click()
  await page.getByLabel('Título').fill('Servidor principal sin acceso')
  await page.getByLabel('Categoría').selectOption({ label: 'Windows Server' })
  await page.getByLabel('Prioridad').selectOption('critical')
  await page
    .getByLabel('Descripción')
    .fill(
      'El servidor principal no permite conexiones remotas desde esta mañana.',
    )
  await page.getByRole('button', { name: 'Crear ticket' }).click()
  await expect(
    page.getByRole('heading', { name: 'Servidor principal sin acceso' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/^ITG-/)).toBeVisible()

  await page.getByRole('link', { name: 'Especialistas' }).click()
  await expect(
    page.getByRole('heading', { name: 'Marketplace TI' }),
  ).toBeVisible()
  await expect(page.getByText('No hay especialistas disponibles')).toBeVisible()

  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
})
