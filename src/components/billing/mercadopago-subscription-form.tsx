'use client'

import { loadMercadoPago } from '@mercadopago/sdk-js'
import { useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type CardFormData = { token?: string; cardholderEmail?: string }
type MercadoPagoCardForm = {
  getCardFormData: () => CardFormData
  unmount?: () => void
}
type MercadoPagoInstance = {
  cardForm: (configuration: Record<string, unknown>) => MercadoPagoCardForm
}
type MercadoPagoConstructor = new (
  publicKey: string,
  options?: { locale?: string },
) => MercadoPagoInstance

declare global {
  interface Window {
    MercadoPago?: MercadoPagoConstructor
  }
}

export function MercadoPagoSubscriptionForm({
  planId,
  planName,
  amount,
  publicKey,
  retry,
}: {
  planId: string
  planName: string
  amount: number
  publicKey: string
  retry: boolean
}) {
  const router = useRouter()
  const reactId = useId().replace(/:/g, '')
  const prefix = `subscription-${reactId}`
  const formRef = useRef<MercadoPagoCardForm | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openForm() {
    setExpanded(true)
    setLoading(true)
    setError(null)
    try {
      await loadMercadoPago()
      if (!window.MercadoPago) throw new Error('sdk_unavailable')
      const mp = new window.MercadoPago(publicKey, { locale: 'es-CL' })
      formRef.current = mp.cardForm({
        amount: String(Math.round(amount)),
        iframe: true,
        form: {
          id: `${prefix}-form`,
          cardNumber: {
            id: `${prefix}-cardNumber`,
            placeholder: 'Número de tarjeta',
          },
          expirationDate: {
            id: `${prefix}-expirationDate`,
            placeholder: 'MM/AA',
          },
          securityCode: {
            id: `${prefix}-securityCode`,
            placeholder: 'CVV',
          },
          cardholderName: {
            id: `${prefix}-cardholderName`,
            placeholder: 'Nombre del titular',
          },
          issuer: { id: `${prefix}-issuer`, placeholder: 'Emisor' },
          installments: {
            id: `${prefix}-installments`,
            placeholder: 'Cuotas',
          },
          identificationType: {
            id: `${prefix}-identificationType`,
            placeholder: 'Tipo de documento',
          },
          identificationNumber: {
            id: `${prefix}-identificationNumber`,
            placeholder: 'RUT del titular',
          },
          cardholderEmail: {
            id: `${prefix}-cardholderEmail`,
            placeholder: 'Correo',
          },
        },
        callbacks: {
          onFormMounted: (mountError: unknown) => {
            setLoading(false)
            if (mountError) {
              setError('No fue posible cargar el formulario de pago.')
              return
            }
            setReady(true)
          },
          onSubmit: async (event: Event) => {
            event.preventDefault()
            setLoading(true)
            setError(null)
            const cardFormData = formRef.current?.getCardFormData()
            const token = cardFormData?.token
            const payerEmail = cardFormData?.cardholderEmail
            if (!token || !payerEmail) {
              setLoading(false)
              setError('Revisa los datos de la tarjeta antes de continuar.')
              return
            }
            try {
              const response = await fetch(
                '/api/payments/mercadopago/subscriptions',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    planId,
                    cardTokenId: token,
                    payerEmail,
                  }),
                },
              )
              const result = (await response.json()) as { message?: string }
              if (!response.ok) {
                throw new Error(
                  result.message ?? 'No fue posible activar el plan.',
                )
              }
              router.push('/app/billing?subscription=success')
              router.refresh()
            } catch (submissionError) {
              setError(
                submissionError instanceof Error
                  ? submissionError.message
                  : 'No fue posible activar el plan.',
              )
              setLoading(false)
            }
          },
          onFetching: () => {
            setLoading(true)
            return () => setLoading(false)
          },
        },
      })
    } catch {
      setLoading(false)
      setError('No fue posible cargar Mercado Pago. Inténtalo nuevamente.')
    }
  }

  if (!expanded) {
    return (
      <button className="button" type="button" onClick={openForm}>
        {retry ? 'Reintentar activación' : 'Contratar mensualmente'}
      </button>
    )
  }

  return (
    <form id={`${prefix}-form`} className="subscription-card-form">
      <p>
        <strong>{planName}</strong> · CLP {amount.toLocaleString('es-CL')} al
        mes
      </p>
      <label>
        Número de tarjeta
        <span id={`${prefix}-cardNumber`} className="mp-secure-field" />
      </label>
      <div className="form-row">
        <label>
          Vencimiento
          <span id={`${prefix}-expirationDate`} className="mp-secure-field" />
        </label>
        <label>
          Código de seguridad
          <span id={`${prefix}-securityCode`} className="mp-secure-field" />
        </label>
      </div>
      <label>
        Nombre del titular
        <input id={`${prefix}-cardholderName`} type="text" required />
      </label>
      <div className="form-row">
        <label>
          Tipo de documento
          <select id={`${prefix}-identificationType`} required />
        </label>
        <label>
          RUT del titular
          <input id={`${prefix}-identificationNumber`} type="text" required />
        </label>
      </div>
      <label>
        Correo del titular
        <input id={`${prefix}-cardholderEmail`} type="email" required />
      </label>
      <select id={`${prefix}-issuer`} hidden aria-label="Emisor" />
      <select id={`${prefix}-installments`} hidden aria-label="Cuotas" />
      {error && <p className="form-message error">{error}</p>}
      <div className="button-row">
        <button className="button" type="submit" disabled={!ready || loading}>
          {loading ? 'Procesando…' : 'Autorizar suscripción'}
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={loading}
          onClick={() => {
            formRef.current?.unmount?.()
            formRef.current = null
            setExpanded(false)
            setReady(false)
            setError(null)
          }}
        >
          Cancelar
        </button>
      </div>
      <small>
        Los datos de la tarjeta son capturados directamente por Mercado Pago y
        no se almacenan en ITGO.
      </small>
    </form>
  )
}
