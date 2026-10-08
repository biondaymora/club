# Readiness de producción

## Plataforma

- [ ] `NEXT_PUBLIC_CLUB_MODE` sigue en `preview` durante pruebas visuales; cambiar a `live` solo después de completar los puntos de datos, seguridad, negocio y operación de este checklist.
- [ ] Proyecto Vercel conectado a `main`, previews activados y dominio configurado.
- [ ] Variables de cada entorno cargadas y validadas al arrancar.
- [ ] El archivo de bloqueo de dependencias está versionado y CI usa `npm ci`.
- [ ] Protección de rama: revisión obligatoria, CI verde y administradores incluidos.

## Datos y seguridad

- [ ] Migraciones aplicadas y respaldo/restauración comprobados.
- [ ] RLS y permisos administrativos probados con cuentas reales de prueba.
- [ ] Shopify HMAC, rate limits e idempotencia validados.
- [ ] Ningún secreto llega al navegador ni a logs.
- [ ] Consentimientos de marketing y política de retención aprobados.

## Negocio e integraciones

- [ ] Tasas de puntos, cashback, expiración, niveles y devoluciones aprobados por negocio.
- [ ] Flujos de Omnisend probados con perfiles de prueba.
- [ ] Conciliación entre saldos proyectados y ledger completada.
- [ ] Redención, devolución parcial y reintento de webhook cubiertos por E2E.
- [ ] Se revisaron los pedidos históricos que pudieron recibir puntos 100 veces mayores y se conciliaron sin editar el ledger original.
- [ ] Shopify `orders/paid`, `orders/cancelled` y `refunds/create` se probaron con payloads reales y eventos fuera de orden.
- [ ] La reseña/historia aprobada, rechazada y reenviada se probó con una compra válida y una cancelada.

## Operación

- [ ] Alertas de errores, webhook atrasado, outbox fallido y tareas programadas activas.
- [ ] Runbooks y responsables de incidentes acordados.
- [ ] Plan de rollback de aplicación y de migración revisado.

## Beta con primeras clientas

- [ ] Se creó un proyecto Supabase **separado** para producción/beta y se aplicaron, en orden, todas las migraciones de `supabase/migrations`.
- [ ] Se cargó `supabase/seeds/rewards.sql` y el equipo revisó stock, costos y términos de cada recompensa.
- [ ] Se configuró Magic Link en Supabase: URL del sitio, URL de redirección `/auth/callback` y remitente aprobado.
- [ ] Se creó una cuenta administradora en `auth.users` y se insertó su id en `admin_roles` con rol `operator` o `admin`.
- [ ] Se crearon al menos dos cuentas de prueba: una con puntos suficientes y otra sin saldo suficiente.
- [ ] Se realizó un canje de prueba, se marcó como entregado y se verificó el ajuste en el ledger.
- [ ] Después de conciliar saldos y aprobar la operación, se habilitó explícitamente `club_runtime_settings.redemptions_enabled` en la base de beta.
- [ ] Se comprobó que una clienta no puede consultar ni canjear desde la cuenta de otra.
- [ ] Shopify y Omnisend se prueban primero con datos de prueba; no habilitar campañas automáticas antes de validar consentimiento.
- [ ] El banco real solo muestra recompensas entregables y sus términos/stock fueron aprobados. Cashback sigue desactivado hasta conectar emisión y reversos.
- [ ] Se publicó la política de tratamiento de datos y términos del Club aprobados por la marca; los registros de consentimiento son verificables.

## Tarjeta digital, NFC y Wallet (fase posterior; no bloquea la beta sin estos canales)

- [ ] `member_cards` se emiten solo a cuentas autenticadas; RLS, revocación y eliminación de cuenta probadas.
- [ ] URL de tag sin PII ni sesión, token aleatorio, hash en base de datos, revocación, redirección segura y prueba de copia/pérdida.
- [ ] Taps y aperturas de página no acreditan puntos ni se presentan como visitas físicas.
- [ ] Check-in de feria exige operador, evento válido, clave idempotente y prueba de duplicado/reintento.
- [ ] Apple Pass Type ID/certificado y Google Wallet issuer de prueba separados de producción; emisión y actualización ensayadas con dispositivos reales.
- [ ] Si se desea NFC desde Wallet, lectores VAS/Smart Tap certificados, software y operación confirmados antes de prometerlo.
- [ ] Certificados, llaves, tokens y datos de clientas ausentes del repositorio, URL, analítica y logs.
