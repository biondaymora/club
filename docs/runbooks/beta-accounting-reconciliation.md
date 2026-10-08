# Conciliación del piloto

Las migraciones `202610080001`–`202610080004` son correctivas y se aplican en orden. No reescriben movimientos históricos. Ejecutarlas primero en un proyecto Supabase de prueba, con copia de seguridad y el equipo de negocio revisando las reglas.

## 1. Identificar pedidos acreditados con la fórmula anterior

La fórmula nueva acredita **1 punto por cada COP $1.000 pagados**. `shopify_orders.total_amount` está en centavos: un pedido de COP $100.000 equivale a 10.000.000 centavos y 100 puntos. La versión anterior dividía esos centavos entre 1.000 y podía acreditar 10.000 puntos.

```sql
select o.shopify_order_id, o.customer_id, o.total_amount,
       l.amount as points_credited,
       floor(o.total_amount::numeric / 100000)::bigint as expected_points,
       l.amount - floor(o.total_amount::numeric / 100000)::bigint as difference
from public.shopify_orders o
join public.points_ledger l
  on l.source_type = 'shopify_order'
 and l.source_id = o.shopify_order_id
 and l.event_type = 'earn'
where l.amount <> floor(o.total_amount::numeric / 100000)::bigint
order by abs(l.amount - floor(o.total_amount::numeric / 100000)::bigint) desc;
```

No ejecutar ajustes masivos sin revisar canjes realizados, reembolsos y saldos negativos. Cada corrección debe ser una **nueva entrada** `adjustment` con razón, actor e idempotency key; después llamar `refresh_loyalty_balance(account_id)`. Conservar el historial original para auditoría.

Los **canjes reales quedan cerrados por defecto**. Solo después de conciliar saldos, probar el flujo de entrega y aprobar las reglas comerciales, una persona autorizada puede habilitarlos en la base de beta:

```sql
update public.club_runtime_settings
set enabled = true, updated_at = now()
where key = 'redemptions_enabled';
```

Para una pausa operativa, establecer `enabled = false` nuevamente. La vista `/club/demo` no depende de este control.

## 2. Revisar entregas con error

```sql
select provider_event_id, topic, attempts, last_error, received_at
from public.webhook_events where status = 'failed'
order by received_at desc;

select id, event_name, attempts, last_error, available_at
from public.outbox_events where status = 'failed'
order by created_at desc;
```

Un `refunds/create` sin transacción exitosa y un reembolso recibido antes del pedido quedan marcados para revisión; **no** se acreditan ni revierten puntos por estimación. Corregir la causa y reprocesar con el mismo ID/payload desde un contexto de servicio autorizado. Los eventos de Omnisend se reclaman con lease y se reintentan hasta cinco veces; tras eso requieren intervención. La entrega externa y su confirmación en la base de datos no son una transacción única: comprobar duplicados en Omnisend antes de reintentar manualmente.

## 3. Prueba obligatoria antes de invitar clientas

En Supabase de prueba, con webhooks firmados y una cuenta Magic Link verificada:

1. Comprar COP $100.000 con el mismo correo: acreditar 100 puntos y vincular el Shopify customer ID.
2. Repetir el mismo webhook y otro `orders/paid` del mismo pedido: no duplicar puntos.
3. Reembolsar COP $50.000: revertir 50 puntos; repetir el webhook: no duplicar.
4. Cancelar el pedido: revertir los 50 puntos restantes.
5. Canjear antes de una devolución: comprobar `points_balance = 0` y `points_debt > 0`; una compra posterior debe saldar la deuda primero.
6. Cancelar un canje pendiente: devolver puntos y stock exactamente una vez.
7. Enviar una reseña, aprobarla y repetir la aprobación: acreditar una sola vez. Rechazar otra y confirmar que puede volver a enviarse.
8. Comprobar que Omnisend no recibe eventos sin consentimiento activo, y que un fallo se reintenta sin procesadores concurrentes duplicados.

No marcar la beta como lista hasta tener evidencia de estas pruebas y de la política de tratamiento de datos aprobada.
