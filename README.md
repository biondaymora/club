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

El [estudio de experiencia del Club](docs/research/loyalty-ux-benchmark-2026-10.md) explica las decisiones de recorrido, acciones y recompensas con referencias de programas comparables.

## Rutas principales

El despliegue arranca en **vista previa** por defecto (`NEXT_PUBLIC_CLUB_MODE=preview`): se puede mostrar la experiencia de clienta y equipo sin activar integraciones ni beneficios reales. Consulta [puesta en marcha](docs/deployment.md) antes de usar `live`.

- `/` — landing pública del Club con visuales locales de la marca.
- `/landing` — alias de la landing pública.
- `/login` — acceso de clientas mediante Magic Link.
- `/registro` — entrada a la vista de prueba mediante nombre, correo y celular.
- `/club/demo` — recorrido visual con puntos y canjes ilustrativos.
- `/admin/demo` — vista operativa ilustrativa, sin datos reales.
- `/club` — área autenticada: saldo, historial y banco de recompensas.
- `/admin` — panel autenticado de operación y canjes.
- `/api/webhooks/shopify` — entrada firmada de eventos Shopify.
- `/api/rewards/redeem` — canje idempotente de recompensas.

Consulta la [guía de puesta en marcha](docs/deployment.md) para conectar los proveedores reales.
Para activar la beta con clientas, sigue el [plan de pruebas](docs/beta-test-plan.md).

Consulta el [alcance de la experiencia visual y beta](docs/mvp-visual.md) para distinguir las rutas públicas de las que requieren integración.
