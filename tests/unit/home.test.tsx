import { render, screen } from '@testing-library/react'

import HomePage from '@/app/page'

describe('HomePage', () => {
  it('presenta el acceso a la plataforma', () => {
    render(<HomePage />)
    expect(screen.getByText('ITGO')).toBeInTheDocument()
    expect(screen.getByText('Base técnica inicializada')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /iniciar sesión/i }),
    ).toHaveAttribute('href', '/auth/login')
  })
})
