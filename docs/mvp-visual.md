# Experiencia visual y beta — Club Bionda y Mora

El repositorio conserva una única aplicación: `apps/web`. La ruta `/` es la landing pública del Club y `/club` es la experiencia autenticada preparada para la beta.

## Incluye

- `/` y `/landing` — presentación pública del Club, alineada con la identidad visual de Bionda y Mora.
- `/login` y `/club` — acceso por Magic Link, saldo, historial y banco de recompensas reales.
- `/admin` — operación de canjes para usuarias con rol administrador u operador.
- Diseño responsive y recursos visuales locales de la marca.
- Vista conceptual de tarjeta digital dentro del Club, identificada como muestra y sin validez para canjes.

## Aún no incluye

- Activación de proveedores sin sus credenciales y configuración de entorno.
- Reglas comerciales definitivas de puntos, cashback, vencimientos y devoluciones.
- Entrega automática de beneficios o campañas de correo sin la aprobación operativa correspondiente.
- Programación de chips NFC, emisión de pases Apple/Google Wallet y acreditación por visitas a la web o taps. Su base y fases están descritas en [identidad digital](architecture/digital-membership.md).

Las migraciones, funciones transaccionales, webhook de Shopify y outbox de Omnisend ya viven en el repositorio. Consulta el [plan de beta](beta-test-plan.md) para activar el entorno real.
