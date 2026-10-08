# Identidad digital del Club: web, NFC y Wallet

Estado: **base preparada, emisión y lectura desactivadas**. Fecha: 8 de octubre de 2026. La fuente de verdad seguirá siendo Supabase; ni el chip ni un pase de Wallet llevarán un saldo autónomo.

## Decisión principal: son cuatro capacidades distintas

| Capacidad | Experiencia | Requisito | Fase |
| --- | --- | --- | --- |
| Tarjeta digital web | La clienta autenticada ve su identidad, saldo confirmado y beneficios. | Cuenta del Club y ledger. | Vista preliminar actual; emisión real posterior. |
| Chip NFC físico | Un tag NDEF con URL HTTPS abre el Club en el teléfono. | Tag programado, URL canónica y ruta pública segura. | Siguiente piloto físico. |
| Apple/Google Wallet | Un pase guardado muestra identidad y estado, y enlaza al Club. | Certificados/issuer, firma, servicios de actualización y aprobación. | Después del piloto web. |
| NFC desde Wallet para validar en feria o caja | El teléfono intercambia datos con un lector certificado. | Apple VAS/certificado NFC o Google Smart Tap, lector y software compatibles. | Opcional y separada; **no** viene incluida por tener un tag o un pase. |

Un tag HTTPS es el camino barato y compatible para abrir una página; Apple documenta la apertura de URL NDEF en iPhone con lectura en segundo plano, con límites según dispositivo y estado. Chrome documenta Web NFC para Chrome en Android, no como solución universal de lectura web. Para el piloto no necesitamos Web NFC: el sistema operativo abre la URL escrita en el tag. [Apple: lectura de tags](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading), [Chrome: Web NFC](https://developer.chrome.com/docs/capabilities/nfc). Apple Wallet contactless exige certificado NFC y terminal compatible con VAS; Google Smart Tap exige configuración de issuer/merchant y terminal compatible. [Apple: pases de fidelización](https://developer.apple.com/wallet/loyalty-passes/), [Google: Smart Tap](https://developers.google.com/wallet/smart-tap/introduction/pass-configuration).

## Flujo objetivo

```text
Tag físico con URL opaca ──► /t/{token} ──► inicio seguro del Club
                                              │
                                      inicio de sesión normal
                                              │
                                   /club · tarjeta digital
                                              │
                       puntos/beneficios leídos de Supabase
                                              │
                          Apple/Google Wallet reciben proyección

Asistencia a feria: operador autenticado + evento + prueba ──► check-in único
Nunca: tap de tag o visita web ──► puntos automáticos
```

La URL de un chip **no inicia sesión, no identifica públicamente a la clienta y no concede puntos**. Un chip perdido o copiado debe poder revocarse y reemplazarse sin cambiar la cuenta. Si la clienta no ha iniciado sesión, verá el acceso al Club; tras autenticarse podrá ver su tarjeta. El tag no contiene email, celular, `customer_id`, saldo ni códigos de canje.

## Modelo de datos reservado

La migración `202610080005_member_card_foundation.sql` añade:

- `member_cards`: una identidad opaca por clienta, estado y revocación. `public_ref` no es credencial.
- `member_nfc_tags`: inventario y hash SHA-256 de tokens aleatorios escritos como URL NDEF. No hay política de lectura desde navegador.
- `member_wallet_passes`: proveedor, ID de objeto y estado de sincronización, sin llaves privadas ni tokens Apple en claro.
- `member_checkins`: asistencia confirmada por personal, única por clienta/evento, sin otorgar puntos por sí sola.

Las cuatro tablas tienen RLS. Solo la clienta ve su propia tarjeta, estado de pases y asistencias; asignación y escritura quedan para casos de uso de servidor con control de rol, auditoría e idempotencia. La migración no crea tags, pases, check-ins ni puntos de forma automática. El ledger sigue siendo la única fuente de saldo.

## Contratos de aplicación a implementar por fases

| Contrato | Protección | Efecto |
| --- | --- | --- |
| `GET /t/[token]` | Token aleatorio de al menos 128 bits; comparar hash, rate limit; `Referrer-Policy: no-referrer`; no redirección abierta. | Solo redirige al Club; un token inválido también llega a una página pública neutra. No acredita nada. |
| `GET /api/member-card` | Sesión Supabase y RLS. | Devuelve el estado de la tarjeta y proyecciones del ledger, nunca secretos del tag. |
| `POST /api/member-card/wallet/apple` | Sesión, tarjeta activa, feature flag y rate limit. | Genera `.pkpass` firmado en servidor; nunca expone certificado o llave. |
| `POST /api/member-card/wallet/google` | Igual; issuer aprobado. | Crea/actualiza `LoyaltyObject` y firma URL de guardado. |
| Apple Pass web service / Google sync | Autenticación de proveedor y procesamiento idempotente por outbox. | Mantiene pases alineados con saldo/nivel; fallo de Wallet no altera el ledger. |
| `POST /api/checkins` | Rol de operador, evento activo, prueba presencial e idempotencia. | Registra asistencia; una regla de negocio aprobada podría premiarla después. |

Apple distribuye un pase firmado por web y permite actualizaciones mediante un web service con registro de dispositivos. Google separa `LoyaltyClass` (plantilla) de `LoyaltyObject` (pase individual), permite guardar desde un enlace JWT firmado y actualizar el objeto. [Apple: distribución](https://developer.apple.com/documentation/walletpasses/distributing-and-updating-a-pass), [Apple: actualizaciones](https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes), [Google: guardado](https://developers.google.com/wallet/retail/loyalty-cards/overview/add-to-google-wallet-flow), [Google: actualizaciones](https://developers.google.com/wallet/retail/loyalty-cards/use-cases/updates).

## Seguridad, privacidad y operación

1. **No usar NFC como autenticación.** El tag se puede compartir, fotografiar o perder; solo abre una URL. Para validar asistencia o canje se requiere sesión/operador y un evento distinto.
2. **No poner PII ni saldo en URLs, barcodes o identificadores de proveedor.** Usar referencias aleatorias; el nombre visible en Wallet requiere decisión de producto y tratamiento de datos.
3. **Separar la señal de visita del derecho a premio.** Una apertura web no prueba presencia física ni compra. Evitar almacenar cada tap por clienta sin un propósito y consentimiento definidos.
4. **Revocación y reemplazo.** Al perder un chip, marcarlo `lost` o `revoked`, asignar otro token; la tarjeta y el ledger permanecen. Un pase suspendido se sincroniza o elimina según el proveedor.
5. **Secretos de emisión.** Certificado/llave Apple y cuenta de servicio Google solo en un gestor de secretos del entorno servidor; rotación, acceso mínimo y separación Preview/Production. No guardar claves en GitHub, `NEXT_PUBLIC_*`, logs o filas públicas.
6. **Degradación.** La web sigue sirviendo si NFC/Wallet fallan. QR o enlace como alternativa al chip; la tarjeta web no depende de que exista un teléfono compatible.
7. **Observabilidad.** Métricas sin PII: emisión fallida, actualización atrasada, tokens revocados, errores de resolución, check-ins duplicados. Alertas separadas de contabilidad de puntos.

## Condiciones para activar cada fase

- **Web:** migración aplicada y probada, sesión real, RLS y recuperación de cuenta; no mostrar números de muestra a clientas reales.
- **Tag piloto:** dominio `club.biondaymora.com` establecido, tags NDEF probados en iPhone/Android reales, ruta segura, proceso de inventario/pérdida y política de analytics.
- **Wallet:** cuenta Apple Developer/Pass Type ID/certificado y Google Wallet issuer con acceso de publicación, artes aprobadas, passes de prueba, actualización/revocación y soporte. Google limita el modo demo a usuarios de prueba antes de aprobación. [Google: modo demo](https://developers.google.com/wallet/retail/loyalty-cards/resources/terminology).
- **NFC Wallet en feria/caja:** proveedor de terminal compatible y costo/operación justificados; nunca asumir que funcionará con un lector NFC genérico. [Apple VAS](https://developer.apple.com/wallet/loyalty-passes/), [Google Smart Tap](https://developers.google.com/wallet/smart-tap/introduction/collection-identifiers).

## Decisiones pendientes de negocio

Titular del issuer/certificados, proveedor de terminal si se desea NFC Wallet, presupuesto de tags y reposición, datos visibles en el pase, reglas de puntos por visita y calendario de ferias. Ninguna de estas decisiones debe resolverse con valores ficticios de producción.
