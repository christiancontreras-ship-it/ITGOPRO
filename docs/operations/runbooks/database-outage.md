# Runbook DB-OUTAGE

1. Declarar SEV1 y detener cambios.
2. Confirmar alcance mediante `/api/ready` y el panel del proveedor.
3. Activar comunicación interna y modo degradado.
4. Recuperar el servicio o restaurar el último respaldo validado según el plan DR.
5. Verificar integridad, RLS, ledger y flujos críticos antes de reabrir tráfico.
6. Registrar cronología, RTO/RPO alcanzados y revisión posterior.
