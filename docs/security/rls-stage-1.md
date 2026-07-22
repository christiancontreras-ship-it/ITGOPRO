# RLS — Etapa 1

- Todas las tablas de negocio tienen RLS forzada.
- El acceso anónimo está denegado.
- Los perfiles y preferencias son accesibles por su propietario.
- Los recursos empresariales requieren membresía activa o permiso explícito.
- La auditoría permanece sin acceso directo para clientes.
- Las vistas futuras deben usar `security_invoker`.

Las pruebas reales de RLS requieren Supabase local y Docker Desktop activos.
