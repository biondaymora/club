# Readiness de producción

## Plataforma

- [ ] Proyecto Vercel conectado a `main`, previews activados y dominio configurado.
- [ ] Variables de cada entorno cargadas y validadas al arrancar.
- [ ] El archivo de bloqueo de dependencias está versionado y CI usa `npm ci`.
- [ ] Protección de rama: revisión obligatoria, CI verde y administradores incluidos.

## Datos y seguridad

- [ ] Migraciones aplicadas y respaldo/restauración comprobados.
- [ ] RLS y permisos administrativos probados con cuentas reales de prueba.
- [ ] Shopify HMAC, rate limits e idempotencia validados.
- [ ] Ningún secreto llega al navegador ni a logs.
- [ ] Consentimientos de marketing y política de retención aprobados.

## Negocio e integraciones

- [ ] Tasas de puntos, cashback, expiración, niveles y devoluciones aprobados por negocio.
- [ ] Flujos de Omnisend probados con perfiles de prueba.
- [ ] Conciliación entre saldos proyectados y ledger completada.
- [ ] Redención, devolución parcial y reintento de webhook cubiertos por E2E.

## Operación

- [ ] Alertas de errores, webhook atrasado, outbox fallido y tareas programadas activas.
- [ ] Runbooks y responsables de incidentes acordados.
- [ ] Plan de rollback de aplicación y de migración revisado.

