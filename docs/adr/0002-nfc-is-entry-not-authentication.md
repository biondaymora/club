# ADR 0002 — El chip NFC abre el Club; no autentica ni premia

Estado: aceptado para la base técnica, 8 de octubre de 2026.

## Contexto

La marca quiere que una tarjeta/chip físico conecte a cada clienta con su tarjeta digital y, más adelante, Apple Wallet y Google Wallet. Un tag NDEF con una URL es fácil de distribuir, pero su contenido puede volver a leerse o compartirse. Tampoco equivale al NFC de un pase Wallet en un terminal certificado.

## Decisión

El tag guardará exclusivamente una URL HTTPS opaca. El servidor validará el token por hash y redirigirá a la web del Club; la clienta iniciará sesión de forma normal para ver datos personales. El tap no acreditará puntos, validará una visita física ni autorizará un canje. Una asistencia a feria se registra por un operador mediante un evento y una clave de idempotencia propios.

Apple Wallet y Google Wallet serán adaptadores de emisión/actualización sobre la misma `member_card`; el ledger Supabase continuará siendo la fuente de saldo. La experiencia contactless de Wallet con lector se evaluará como proyecto distinto tras confirmar hardware, certificados y costo.

## Consecuencias

- Se pueden pilotar chips de bajo costo antes de comprar terminales VAS/Smart Tap.
- Un chip perdido se revoca y sustituye sin cambiar cuenta ni puntos.
- Abrir el Club exige sesión para mostrar PII; una URL copiada no concede acceso.
- El alta de Wallet requiere certificados/issuer y servicios de actualización, por lo que los controles de guardado permanecen inactivos en la demo.
- Las métricas de taps no se confunden con visitas verificadas ni con conversiones.

Implementación y fuentes: [identidad digital](../architecture/digital-membership.md).
