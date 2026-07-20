# Arquitectura general

ITGO usa un único repositorio Next.js con App Router. Los Server Components son el valor predeterminado; la interacción cliente se introduce solo donde sea necesaria. Supabase provee PostgreSQL, autenticación, almacenamiento y tiempo real. La arquitectura separa UI, configuración, utilidades, servicios y tipos, y evolucionará modularmente por etapas.

La autorización futura combinará validación en servidor con RLS en PostgreSQL. El proxy o middleware de sesión nunca será la única barrera de autorización.
