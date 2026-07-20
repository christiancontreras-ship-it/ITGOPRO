# ITGO

Base técnica de **ITGO**, plataforma SaaS y marketplace de servicios TI OnDemand y Servicios Gestionados. Este repositorio contiene exclusivamente la Etapa 0: fundaciones compilables, verificables y seguras para el desarrollo incremental.

## Stack

Next.js (App Router), React, TypeScript estricto, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage y Realtime), Zod, Vitest, Testing Library, Playwright y GitHub Actions.

## Requisitos

- Node.js 22 LTS o superior y npm.
- Docker Desktop para Supabase local.
- Git.

## Instalación y ejecución

```bash
npm install
copy .env.example .env.local
npm run dev
```

La aplicación queda en `http://localhost:3000` y el health check en `http://localhost:3000/api/health`. Reemplaza los valores de ejemplo de `.env.local` con credenciales locales o del entorno; nunca confirmes secretos.

## Variables de entorno

Las variables `NEXT_PUBLIC_*` son públicas. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` y `ANTHROPIC_API_KEY` son exclusivas del servidor. `src/config/env.ts` centraliza su validación con Zod. La clave de Anthropic queda reservada para una etapa futura y no existe integración de IA en esta etapa.

## Calidad y pruebas

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e:install
npm run test:e2e
npm run build
npm run validate
```

Las pruebas unitarias no consumen servicios externos. Playwright inicia el servidor de desarrollo automáticamente.

## Supabase local

```bash
npm run supabase:start
npm run db:reset
npm run supabase:status
npm run supabase:stop
```

El stack local no debe exponerse a Internet. Las migraciones habilitan RLS y no conceden acceso directo a `anon` o `authenticated` sobre tablas internas.

## Estructura

- `src/app`: rutas, estados y API del App Router.
- `src/components`: sistema visual y componentes compartidos.
- `src/config`, `src/lib`, `src/services`, `src/types`: configuración y capas técnicas.
- `supabase`: configuración local, migraciones y seed.
- `tests`: pruebas unitarias, integración y E2E.
- `docs`: arquitectura, desarrollo y operaciones.

## Convenciones

Commits semánticos, TypeScript estricto, imports ordenados, formato Prettier, componentes con semántica accesible y cambios de base de datos mediante migraciones SQL. No se usa Prisma.

## Roadmap

La Etapa 0 establece las fundaciones. Las etapas funcionales posteriores se implementarán una por una, empezando por la Etapa 1, sin anticipar empresas, usuarios de negocio, tickets, pagos, marketplace o IA hasta que sus requisitos sean aprobados.
