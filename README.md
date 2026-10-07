# Bionda y Mora — Club de fidelización

Plataforma de fidelización conectada con Shopify, Supabase y Omnisend.

## Principios

- Shopify conserva la verdad comercial de pedidos y reembolsos.
- Supabase conserva el estado de fidelización y un ledger inmutable.
- Omnisend recibe atributos y eventos; la aplicación no envía correos directamente.
- Cada integración externa es verificable, idempotente y observable.

## Inicio local

1. Copia `.env.example` como `.env.local` y completa las credenciales de desarrollo.
2. Instala dependencias desde la raíz con `npm ci`.
3. Ejecuta `npm run dev`.

Consulta [la arquitectura](docs/architecture/overview.md), las [reglas de producto](docs/product-rules/loyalty.md) y los [runbooks](docs/runbooks/README.md) antes de modificar reglas comerciales.

## Rutas principales

- `/` — prototipo visual autónomo para reuniones.
- `/landing` — landing pública del Club con visuales locales de la marca.
- `/login` — acceso de clientas mediante Magic Link.
- `/club` — área autenticada: saldo, historial y banco de recompensas.
- `/admin` — panel autenticado de operación y canjes.
- `/api/webhooks/shopify` — entrada firmada de eventos Shopify.
- `/api/rewards/redeem` — canje idempotente de recompensas.

Consulta la [guía de puesta en marcha](docs/deployment.md) para conectar los proveedores reales.
Para activar la beta con clientas, sigue el [plan de pruebas](docs/beta-test-plan.md).

## MVP visual

La primera versión presentable del Club vive en `apps/web/app/page.tsx`. Es una experiencia interactiva con datos de muestra: incluye puntos, nivel, cashback, misiones, historial y un banco de recompensas con canje simulado. No requiere Shopify, Supabase ni Omnisend para su demostración.

Consulta [el alcance del MVP visual](docs/mvp-visual.md) para distinguir los comportamientos simulados de las integraciones por construir.
