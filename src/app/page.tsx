import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/layout/container'
import { appConfig } from '@/config/app'

export default function HomePage() {
  return (
    <main className="hero">
      <Container>
        <nav aria-label="Navegación principal" className="nav">
          <span className="logo">ITGO</span>
          <Badge>v{appConfig.version}</Badge>
        </nav>
        <section className="hero-content" aria-labelledby="hero-title">
          <Badge>Base técnica inicializada</Badge>
          <h1 id="hero-title">Tecnología que avanza al ritmo de tu negocio.</h1>
          <p>{appConfig.description}</p>
          <Link className="button" href="/auth/login">
            Iniciar sesión
          </Link>
        </section>
        <Card className="foundation-card">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <strong>Fundación operativa</strong>
          </div>
          <p>
            Next.js, TypeScript y Supabase preparados para el desarrollo
            incremental de la plataforma.
          </p>
        </Card>
      </Container>
    </main>
  )
}
