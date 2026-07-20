import { render, screen } from '@testing-library/react'

import HomePage from '@/app/page'

describe('HomePage', () => {
  it('presenta únicamente el estado real de la etapa cero', () => {
    render(<HomePage />)
    expect(screen.getByText('ITGO')).toBeInTheDocument()
    expect(screen.getByText('Base técnica inicializada')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ingreso disponible/i }),
    ).toBeDisabled()
  })
})
