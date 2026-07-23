# Etapa 17: preparación productiva

ITGO usa ambientes aislados (`development`, `test`, `staging`, `production`), migraciones inmutables y promoción mediante CI. Cada ambiente debe tener un proyecto Supabase, almacenamiento, dominios y secretos independientes.

## Despliegue

1. Ejecutar `npm ci` y `npm run validate`.
2. Ejecutar `npm run security:check` y `npm audit --audit-level=high`.
3. Aplicar migraciones en staging y ejecutar pruebas SQL/RLS.
4. Desplegar preview, ejecutar E2E, smoke y carga.
5. Requerir aprobación humana para producción.
6. Aplicar migraciones compatibles hacia adelante antes de promover la aplicación.
7. Verificar `/api/live`, `/api/ready`, `/api/health` y `/api/version`.

## Go-live

- [ ] DNS, TLS, correo y dominios verificados.
- [ ] Secretos productivos rotados y sin prefijo `NEXT_PUBLIC_`.
- [ ] Backups y restauración probados con RTO/RPO registrados.
- [ ] Pagos en modo producción conciliados con transacciones controladas.
- [ ] Alertas, logs, métricas y contactos de guardia configurados.
- [ ] RLS y aislamiento entre empresas validados.
- [ ] Runbooks revisados y simulacro de rollback realizado.
- [ ] Feature flags críticos y kill switches comprobados.
- [ ] Privacidad, términos y soporte operacional aprobados.

Los componentes externos no se consideran disponibles hasta que una verificación real del ambiente lo confirme.
