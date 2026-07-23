# Runbook AI-OUTAGE

1. Confirmar error, latencia o límite del proveedor sin registrar prompts sensibles.
2. Abrir el circuito y desactivar `AI_ENABLED` si el fallo persiste.
3. Mantener clasificación, matching y operación manual disponibles.
4. Reintentar solo solicitudes idempotentes con backoff.
5. Restaurar gradualmente y revisar costos, errores y calidad antes del 100%.
