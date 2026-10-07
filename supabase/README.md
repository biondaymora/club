# Base de datos

Las migraciones se ejecutan en orden cronológico y son la única fuente de verdad del esquema. El navegador opera con RLS; los webhooks y trabajos de integración usan credenciales de servidor y deben limitarse a casos de uso explícitos.

Los movimientos de `points_ledger` y `cashback_ledger` son append-only. Cualquier corrección se registra como una nueva entrada y un `audit_log`.

