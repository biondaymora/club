# MVP visual — Club Bionda y Mora

El MVP permite validar la propuesta de valor y la navegación antes de conectar servicios externos.

## Incluye

- Inicio personalizado con puntos, progreso de nivel y cashback.
- Misiones y un historial con información demostrativa.
- Banco de recompensas con cuatro beneficios.
- Canje simulado: valida los puntos disponibles, descuenta el saldo local y confirma la acción.
- Diseño responsive, sin imágenes externas ni llamadas de red.

## Aún no incluye

- Autenticación, perfiles reales ni persistencia al actualizar la página.
- Reglas reales de elegibilidad, inventario, vencimientos o cupones.
- Integraciones con Shopify, Supabase u Omnisend.
- Procesamiento financiero/comercial de una redención.

Cuando se conecte el backend, el estado local de la interfaz se reemplazará por los saldos y movimientos aprobados del ledger, y cada canje ejecutará el flujo idempotente de `reward_redemptions`.
