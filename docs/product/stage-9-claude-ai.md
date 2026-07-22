# Etapa 9: Claude

ITGO envía a Claude únicamente los campos mínimos del ticket, los delimita como datos no confiables y valida la respuesta con un esquema estricto antes de persistirla. El análisis es sugerente: no modifica prioridad, precio ni asignación automáticamente.

El modelo se configura con `ANTHROPIC_MODEL`; el valor inicial corresponde al identificador estable documentado para Claude Sonnet 4. Sin clave válida, la plataforma conserva la operación manual.
