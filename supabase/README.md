# Base de datos

Las migraciones se ejecutan en orden cronológico y son la única fuente de verdad del esquema. El navegador opera con RLS; los webhooks y trabajos de integración usan credenciales de servidor y deben limitarse a casos de uso explícitos.

Los movimientos de `points_ledger` y `cashback_ledger` son append-only. Cualquier corrección se registra como una nueva entrada y un `audit_log`.

Después de aplicar las migraciones, cargar `seeds/rewards.sql`. El archivo `seeds/missions.sql` contiene el banco de acciones propuesto para una beta controlada y requiere aprobación de negocio antes de cargarse.

Las migraciones correctivas de `20261008` añaden deuda de puntos para devoluciones posteriores a canjes, procesamiento atómico de Shopify, leases para el outbox y revisión manual de reseñas/historias. Las misiones sin validación operativa y el cashback están desactivados en el Club real. Antes de usar una base con pedidos existentes, seguir el [runbook de conciliación](../docs/runbooks/beta-accounting-reconciliation.md); las migraciones no corrigen en silencio movimientos históricos.

`202610080005_member_card_foundation.sql` reserva identidad digital, inventario de tags NFC, estados de pases Wallet y asistencias verificadas. **No** programa chips, emite pases ni suma puntos. Consulta la [arquitectura de identidad digital](../docs/architecture/digital-membership.md) antes de implementar rutas o activar proveedores.
