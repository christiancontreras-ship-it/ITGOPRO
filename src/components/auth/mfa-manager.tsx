'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type EnrolledFactor = { id: string; friendlyName?: string }

export function MfaManager({
  initialFactors,
}: {
  initialFactors: EnrolledFactor[]
}) {
  const [factors, setFactors] = useState(initialFactors)
  const [factorId, setFactorId] = useState<string>()
  const [qr, setQr] = useState<string>()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string>()

  async function enroll() {
    const { data, error } = await getSupabaseBrowserClient().auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'ITGO Authenticator',
    })
    if (error) return setMessage('No fue posible iniciar la configuración MFA.')
    setFactorId(data.id)
    setQr(data.totp.qr_code)
  }

  async function verify() {
    if (!factorId) return
    const { data: challenge, error: challengeError } =
      await getSupabaseBrowserClient().auth.mfa.challenge({ factorId })
    if (challengeError) return setMessage('No fue posible generar el desafío.')
    const { error } = await getSupabaseBrowserClient().auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })
    if (error) return setMessage('El código no es válido.')
    setFactors((current) => [
      ...current,
      { id: factorId, friendlyName: 'ITGO Authenticator' },
    ])
    setQr(undefined)
    setMessage('MFA quedó activado correctamente.')
  }

  async function unenroll(id: string) {
    const { error } = await getSupabaseBrowserClient().auth.mfa.unenroll({
      factorId: id,
    })
    if (error) return setMessage('No fue posible eliminar el factor.')
    setFactors((current) => current.filter((factor) => factor.id !== id))
  }

  return (
    <section className="mfa-manager">
      <h2>Autenticación multifactor</h2>
      {factors.length ? (
        <ul>
          {factors.map((factor) => (
            <li key={factor.id}>
              {factor.friendlyName ?? 'Aplicación autenticadora'}{' '}
              <button type="button" onClick={() => unenroll(factor.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay factores verificados.</p>
      )}
      {!qr && <Button onClick={enroll}>Configurar aplicación</Button>}
      {qr && (
        <div className="mfa-enrollment">
          <Image
            src={qr}
            alt="Código QR para configurar la aplicación autenticadora"
            width={256}
            height={256}
            unoptimized
          />
          <label>
            Código de seis dígitos
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
            />
          </label>
          <Button onClick={verify} disabled={code.length !== 6}>
            Verificar
          </Button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  )
}
