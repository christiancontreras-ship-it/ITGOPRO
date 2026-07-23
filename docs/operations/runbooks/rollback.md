# Runbook ROLLBACK

1. Detener la promoción y conservar evidencias del fallo.
2. Desactivar la funcionalidad mediante kill switch cuando sea suficiente.
3. Promover el último artefacto verificado.
4. No revertir una migración destructiva; aplicar una migración correctiva compatible.
5. Ejecutar health checks, smoke tests y validación de datos.
6. Registrar motivo, versión, responsables y resultado.
