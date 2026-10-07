# Runbooks operativos

Cada incidente debe tener propietario, impacto, hora de inicio, acciones y resolución.

- **Webhook fallido:** confirmar firma, revisar `webhook_event`, reencolar por identificador y comprobar idempotencia.
- **Omnisend no sincronizado:** revisar `outbox_event`, reintentar los fallidos y no reenviar eventos ya entregados.
- **Saldo cuestionado:** reconciliar el ledger antes de realizar un ajuste; registrar razón y aprobador.
- **Migración fallida:** detener despliegues, restaurar la versión compatible y aplicar una migración correctiva; no editar migraciones aplicadas.

