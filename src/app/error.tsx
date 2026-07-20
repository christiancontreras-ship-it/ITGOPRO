'use client'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="centered">
      <h1>No pudimos completar la solicitud</h1>
      <p>
        Inténtalo nuevamente. Si el problema persiste, contacta al equipo de
        soporte.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  )
}
