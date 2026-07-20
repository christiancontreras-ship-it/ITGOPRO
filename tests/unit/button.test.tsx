import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('es accesible y ejecuta su acción', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continuar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
