# Activación comercial de ITGO

## Datos confirmados

- Super Admin solicitado: `christian.contreras@icloud.com`
- Dominio público: `www.itgopro.cl`
- Proveedores de pago: Transbank y Mercado Pago
- Repositorio: `christiancontreras-ship-it/ITGOPRO`

## Estado

- La versión consolidada está publicada en la rama
  `feature/etapa-17-production-readiness`.
- Vercel está conectado al repositorio `ITGOPRO`.
- `itgopro.cl` y `www.itgopro.cl` están asociados al proyecto Vercel `itgopro`.
- La producción continúa disponible en `https://itgopro.vercel.app` mientras se
  completa la verificación DNS.

## DNS requerido

El dominio fue registrado en NIC Chile y delegado a Vercel mediante:

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

No cambiar `NEXT_PUBLIC_APP_URL` ni la URL principal de Supabase Auth hasta que
Vercel confirme el dominio como válido y el certificado TLS esté activo.

## Super Admin

El usuario debe crearse mediante una invitación de Supabase Auth o mediante el
flujo normal de registro. No se crean ni almacenan contraseñas administrativas
en código, migraciones o documentación.

Después de que el usuario exista en Supabase Auth, se asignará el rol
`platform_super_admin` mediante una operación administrativa auditada.

## Pagos

Las integraciones deben comenzar en sandbox.

### Transbank

- Producto inicial por confirmar: Webpay Plus.
- Se requieren código de comercio y API key del ambiente de integración.
- Los secretos deben almacenarse únicamente en Vercel y Supabase.

### Mercado Pago

- Modalidad inicial por confirmar: Checkout Pro.
- Se requieren public key y access token de pruebas.
- Los webhooks deben usar firma, idempotencia y conciliación.

No se habilitarán pagos reales hasta completar pruebas sandbox de autorización,
captura, rechazo, anulación, reembolso y webhook duplicado.
