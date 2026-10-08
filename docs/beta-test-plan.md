# Plan de prueba beta

Esta guía permite validar el Club con un grupo reducido sin exponer datos ni activar envíos masivos.

## Antes de invitar

1. Desplegar `main` en Vercel y registrar el dominio de beta o `club.biondaymora.com` en las URL permitidas de Supabase Auth.
2. Cargar en Vercel las variables de `.env.example`; las claves de servicio, Shopify, Omnisend y cron son exclusivamente de servidor.
3. Ejecutar las migraciones por orden y cargar `supabase/seeds/rewards.sql` y `supabase/seeds/missions.sql` en el proyecto Supabase de beta. Las acciones sin flujo real y el cashback quedan desactivados.
4. Crear una usuaria administradora en Supabase Auth y asignarla en `public.admin_roles`:

```sql
insert into public.admin_roles (user_id, role)
values ('UUID-DE-LA-USUARIA', 'admin');
```

5. Definir por escrito la equivalencia inicial de puntos y las reglas de reembolso. La versión actual usa provisionalmente 1 punto por cada COP 1.000 pagados: debe ser aprobada antes de habilitar Shopify.
6. Revisar la [conciliación contable](runbooks/beta-accounting-reconciliation.md) antes de aceptar pedidos reales. Si existían puntos acreditados con la fórmula anterior, no ejecutar un ajuste masivo sin aprobación.

## Guion de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Acceso Magic Link | El enlace inicia sesión y lleva a `/club`. |
| Cuenta nueva | Se crean perfil, cuenta de puntos y billetera una sola vez. |
| Recompensa sin saldo | El botón permanece deshabilitado. |
| Canje con saldo | Se crea un canje `pending`, se descuenta una sola vez y baja el stock. |
| Doble clic/reintento | La llave de idempotencia evita duplicar el canje. |
| Rol de clienta | `/admin` redirige a `/club`. |
| Rol operador | `/admin` muestra los canjes pendientes y permite gestionarlos. |
| Pedido Shopify | Un webhook firmado se registra una vez y agrega el movimiento al ledger. |
| Reembolso y cancelación | Generan reversos del ledger; si ya se canjearon puntos, la deuda se arrastra a nuevas compras. |
| Reseña o historia | Una clienta con compra válida envía un enlace; administración aprueba o rechaza; se acredita una sola vez. |
| Evento Omnisend | Solo se entrega con consentimiento específico activo; un fallo tiene reintento y trazabilidad. |

## Límites de la beta

- Invitar inicialmente a 10–25 clientas; la preferencia de correos del Club es opcional y no autoriza campañas generales.
- Entregar beneficios manualmente mientras se valida inventario y operación.
- No enviar campañas ni otorgar cashback real hasta que reglas, consentimiento y conciliación sean aprobados.
- El registro visual `/registro` continúa siendo una **demostración**, no una cuenta. Para beneficios reales se usa `/login` y un correo verificado. La política de privacidad y los términos del Club requieren revisión y publicación por la marca antes de invitar clientas.
- Revisar diariamente errores, webhooks fallidos y canjes pendientes.
