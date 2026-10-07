# Puesta en marcha

## 1. Supabase

1. Crea un proyecto Supabase y copia URL, anon key y service-role key a Vercel.
2. Ejecuta, en orden, las migraciones de `supabase/migrations/` y luego `supabase/seeds/rewards.sql`.
3. Activa Magic Link en Auth y configura el dominio de retorno del Club.
4. Crea una cuenta administradora y agrégala a `admin_roles`.

## 2. Shopify

1. Crea una app personalizada con acceso de lectura a pedidos y clientes.
2. Configura los webhooks `orders/paid`, `orders/cancelled` y `refunds/create` hacia `https://<dominio>/api/webhooks/shopify`.
3. Configura `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN` y `SHOPIFY_WEBHOOK_SECRET`.
4. Shopify firma cada entrega con HMAC y el endpoint rechaza cargas que no superen esa verificación.

## 3. Omnisend

1. Crea una API key con permisos `contacts.write` y `events.write`.
2. Configura `OMNISEND_API_KEY` y crea automations para `points_earned`, `tier_upgraded`, `cashback_earned` y `reward_redeemed`.
3. Configura `CRON_SECRET`; en Vercel Hobby, el cron invoca `/api/cron/outbox` una vez al día a las 12:00 UTC (07:00 en Colombia). Para entregar eventos con baja latencia, actualiza a Vercel Pro o usa una cola/worker externo.

## 4. Vercel

1. Importa el repositorio y establece el directorio raíz como `/`.
2. Carga las variables de `.env.example` en Production, Preview y Development.
3. Configura `club.biondaymora.com` y, si corresponde, una redirección desde `www`.
4. Ejecuta el checklist de [producción](production-readiness.md) antes de activar los webhooks reales.

## Límites del paquete

Las credenciales, permisos de las cuentas externas, configuración de DNS y aprobación de reglas comerciales requieren acceso de la marca; por seguridad no se incluyen en el código ni pueden activarse desde este ZIP.
