import { SpecialistProfileForm } from '@/components/specialist/specialist-profile-form'
import { Card } from '@/components/ui/card'
import {
  getOwnSpecialistProfile,
  listSkills,
} from '@/services/specialist-portal.service'

export default async function SpecialistProfilePage() {
  const [profile, skills] = await Promise.all([
    getOwnSpecialistProfile(),
    listSkills(),
  ])
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Perfil profesional</p>
      <h1>Datos del especialista</h1>
      <Card>
        <SpecialistProfileForm profile={profile} skills={skills} />
      </Card>
    </main>
  )
}
