# Flujo de base de datos

1. Crear migración con `npx supabase migration new <nombre>`.
2. Iniciar Supabase local con `npm run supabase:start`.
3. Aplicar desde cero con `npm run db:reset`.
4. Ejecutar pruebas y asesores de base de datos.
5. Regenerar tipos con Supabase CLI.
6. Revisar grants, RLS y funciones `security definer` antes de confirmar cambios.

Las migraciones ya aplicadas no se editan; toda corrección se agrega como una migración incremental.
