import { SpecialistCard } from '@/components/marketplace/specialist-card'
import { listSpecialists } from '@/services/marketplace.service'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const specialists = await listSpecialists(q)
  return (
    <main className="dashboard-shell">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Talento verificado</p>
          <h1>Marketplace TI</h1>
          <p>
            Encuentra especialistas aprobados sin exponer información privada.
          </p>
        </div>
        <form className="marketplace-search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar especialidad o profesional"
          />
          <button className="button" type="submit">
            Buscar
          </button>
        </form>
      </section>
      {specialists.length ? (
        <section className="specialist-grid">
          {specialists.map((s) => (
            <SpecialistCard key={s.id} specialist={s} />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <strong>No hay especialistas disponibles</strong>
          <p>Amplía la búsqueda o vuelve más tarde.</p>
        </div>
      )}
    </main>
  )
}
