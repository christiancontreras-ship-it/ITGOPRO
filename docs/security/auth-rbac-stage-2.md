# Autenticación y RBAC — Etapa 2

ITGO usa Supabase Auth con sesiones almacenadas en cookies HTTP y refrescadas por el proxy de Next.js. La autorización empresarial continúa aplicándose mediante RLS y las membresías/roles de la Etapa 1.

## Flujos implementados

- Registro con perfil automático mediante trigger.
- Login y logout por contraseña.
- Recuperación y actualización de contraseña mediante callback PKCE.
- OAuth preparado para Google y Microsoft/Azure; requiere credenciales por ambiente.
- TOTP MFA administrable por el usuario.
- Contexto server-side de perfil, empresas activas y roles de plataforma.

Los mensajes de recuperación e ingreso evitan enumerar cuentas. Las contraseñas locales exigen doce caracteres, mayúsculas, minúsculas y números. Las credenciales OAuth nunca se almacenan en el repositorio.

## Límites de la etapa

La exigencia de MFA por rol se configurará al incorporar los paneles administrativos. Los proveedores OAuth necesitan habilitación y secretos en cada proyecto Supabase; la UI queda preparada, pero no simula una conexión inexistente.
