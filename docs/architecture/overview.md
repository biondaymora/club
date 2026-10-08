# Arquitectura

La aplicación se organiza por dominios y no por proveedor. Las rutas HTTP son adaptadores: validan autenticación, esquema y firma; luego invocan casos de uso del dominio.

## Límites

| Sistema | Responsabilidad |
|---|---|
| Shopify | Pedidos, pagos, devoluciones, catálogo y cupones de comercio |
| Supabase | Identidades, estado de fidelización, ledger, RLS y auditoría |
| Omnisend | Perfiles, segmentación y automatizaciones de correo |
| Vercel | Aplicación, previews, tareas programadas y despliegue |

La identidad digital del Club se modela aparte del ledger: [tarjeta web, tag NFC y Wallet](digital-membership.md). Un tap es entrada a la web, no autenticación ni evento que otorgue puntos.

Las escrituras de puntos y cashback son append-only. Los saldos son proyecciones; una reversión crea una nueva entrada y nunca modifica un movimiento histórico.

## Procesamiento de eventos

1. Verificar firma y conservar el evento entrante.
2. Crear `webhook_event` con una clave única del proveedor.
3. Devolver una respuesta rápida al proveedor.
4. Procesar una única vez aplicando una clave de idempotencia.
5. Escribir movimientos de ledger, auditoría y evento de outbox en una transacción.
6. Reintentar la entrega a Omnisend desde el outbox con backoff.
