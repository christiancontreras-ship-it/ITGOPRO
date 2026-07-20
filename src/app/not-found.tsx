import { Container } from '@/components/layout/container'

export default function NotFound() {
  return (
    <main className="centered">
      <Container>
        <h1>Página no encontrada</h1>
        <p>La dirección solicitada no existe.</p>
      </Container>
    </main>
  )
}
