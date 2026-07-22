# Etapa 7: postulaciones y asignaciones

La etapa conecta tickets publicados con especialistas aprobados. Las postulaciones están aisladas por participante y la selección utiliza una RPC transaccional con bloqueo de fila y un índice parcial que impide dos asignaciones activas para el mismo ticket.

El especialista debe aceptar la asignación antes de iniciar. El rechazo libera el ticket; el inicio registra la fecha real y mueve el ticket a `in_progress`.
