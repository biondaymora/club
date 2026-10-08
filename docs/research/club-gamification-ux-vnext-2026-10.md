# Investigación para la siguiente experiencia del Club

Fecha: 8 de octubre de 2026. Alcance: Club móvil, tarjeta digital, acciones repetibles, progreso y recompensas. Método: auditoría de la demo pública en móvil + documentación de Apple/Google/Chrome + estudios originales de motivación y programas de recompensas. **No equivale a investigación con clientas Bionda y Mora**: las hipótesis deben probarse en la beta.

## Auditoría de la experiencia actual

1. **Inicio — salud: aceptable.** La bienvenida y el saldo son claros, pero en el primer pantallazo móvil solo asoma la pregunta «¿Qué te gustaría hacer?». La identidad del Club está repartida entre saludo, saldo y nivel; no existe una tarjeta que pueda llevarse a una feria o Wallet. Riesgo visible: mucho desplazamiento antes de elegir una acción.
2. **Banco de acciones — salud: mejorable.** Las cuatro categorías ayudan, pero después hay 13 fichas extensas. El orden inicial empieza con compra y los videos/testimonios quedan varias pantallas abajo. La regla de repetición solo se entiende al abrir cada ficha. Riesgo visible: descubrimiento lento de actividades no transaccionales y demasiada lectura.
3. **Recompensas — salud: buena base.** Se ven saldo, costo y faltante; la demo distingue un canje de muestra. Falta conectar un objetivo elegido por la clienta con acciones relevantes y su tarjeta. Riesgo visible: progresar se interpreta solo como conseguir más puntos, no como participar o pertenecer.

La auditoría visual no demuestra cumplimiento de accesibilidad. Faltan pruebas de teclado, lector de pantalla, reflujo a 320 px, contraste medido, zoom y comprensión con clientas reales.

## Evidencia y traducción al producto

| Evidencia | Lectura prudente | Decisión para Bionda y Mora |
| --- | --- | --- |
| El experimento de Sailer y colegas encontró que distintos elementos de juego satisfacen necesidades psicológicas diferentes; no hay un ingrediente universal. [Estudio original](https://www.researchgate.net/profile/Michael-Sailer-2/publication/311879391_How_gamification_motivates_An_experimental_study_of_the_effects_of_specific_game_design_elements_on_psychological_need_satisfaction/links/5874ebdc08ae329d62202795/How-gamification-motivates-An-experimental-study-of-the-effects-of-specific-game-design-elements-on-psychological-need-satisfaction.pdf). | Su contexto experimental no prueba conversión retail para esta marca. | Diseñar para **autonomía** (elegir actividad), **competencia** (criterios y progreso claro) y **relación** (historias/encuentros); medir cada mecanismo por separado. |
| En programas reales de recompensas, Kivetz y colegas observaron aceleración de la actividad al acercarse a una meta; también estudiaron la ilusión de progreso. [Investigación original](https://s3.amazonaws.com/fieldexperiments-papers2/papers/00658.pdf). | Un indicador de distancia puede orientar, pero puede inducir compras innecesarias. | Mostrar «te faltan X» solo para una recompensa real y disponible; ofrecer también acciones sin compra. No dar progreso ficticio ni crear urgencia artificial. |
| Nunes y Drèze hallaron que progreso inicial artificial puede aumentar persistencia. [Investigación original](https://www.researchgate.net/publication/23547282_The_Endowed_Progress_Effect_How_Artificial_Advancement_Increases_Effort). | Es un hallazgo de conducta, no una justificación ética para inventar saldos. | Si se regala una bienvenida, registrar un bono **real, explícito y conciliable** en el ledger; nunca dibujar puntos que no existen. |
| Los resultados de badges/leaderboards varían con el contexto y el diseño. [Experimentos aleatorizados](https://pubmed.ncbi.nlm.nih.gov/35308640/). | Competencia pública puede no encajar con una marca íntima y artesanal. | Usar reconocimientos privados, opcionales y no monetarios; **no** ranking entre clientas, rachas diarias ni presión social. |

Inferencia de diseño: para una marca de calzado de compra ocasional, la recurrencia saludable puede venir de cuidado, estilo, historias y encuentros entre compras; una «racha diaria» castigaría pausas normales. La evidencia citada motiva esta hipótesis, pero no valida todavía su efecto comercial.

## Modelo de gamificación propuesto

### 1. Progreso con sentido, no una lista obligatoria

El Club tendrá **tres capas simultáneas**: (a) saldo económico confirmado y recompensas, (b) recorrido opcional de pertenencia, y (c) «colecciones de gestos» por tema — cuidado, historias y círculo. La clienta puede hacer cualquier acción abierta sin completar etapas anteriores. Los reconocimientos celebran variedad y constancia, no volumen de compra.

| Mecanismo | Forma de mostrarlo | Regla/guardarraíl |
| --- | --- | --- |
| Objetivo elegido | «Estoy cerca de…» con una recompensa que la clienta selecciona o cambia. | Saldo confirmado, costo y vigencia visibles; no meta impuesta. |
| Siguiente gesto sugerido | Una opción contextual y dos alternativas («sin comprar», «para compartir»). | Recomendación explicable; todas las acciones siguen en el banco. |
| Colección privada | Insignias como «Cuidas lo que eliges», «Tu historia inspira», «Nos encontramos». | Se asignan por eventos validados; no otorgan puntos extra por duplicar la misma acción. |
| Participación repetible | Contador por tipo: pedidos distintos, piezas/historias originales, amigas distintas, ferias diferentes. | Topes y evidencia antes del envío; devolución revierte puntos, no borra historia. |
| Encuentro presencial | Check-in del equipo en feria y recuerdo en tarjeta web. | Un tap de tag o una visita a la página no prueban presencia ni generan puntos. |
| Reconocimiento editorial | Invitación opcional a ser destacada o colaborar. | Consentimiento separado para publicación y pauta; críticas honestas válidas. |

No proponer cajas sorpresa de valor opaco, descuento oculto tras múltiples compras, cuenta regresiva artificial, comparaciones públicas ni puntos por enviar mensajes masivos. El Club debe sentirse como una relación con la marca, no como trabajo de ventas encubierto.

### 2. Prioridad de la pantalla móvil

1. **Arriba:** saludo breve, tarjeta digital compacta y saldo confirmado/muestra claramente etiquetado.
2. **«Hoy para ti»:** una acción contextual con razón («porque ya tienes una pieza») y accesos a «sin comprar» / «compartir».
3. **«Elige tu gesto»:** cuatro categorías, banco completo buscable/filtrable y frecuencia visible en la tarjeta.
4. **«Tu objetivo»:** recompensa elegida, distancia exacta y condiciones; alternativa sin compra si existe.
5. **«Tu camino»:** ruta opcional y reconocimientos privados. Nunca bloquear acciones.
6. **«Mi tarjeta»:** identidad visual y estado de NFC/Wallet, sin botón de emisión hasta que proveedores estén listos.

La tarjeta puede abrirse desde navegación persistente, pero no debe desplazar las acciones bajo varios pantallazos. Una única pantalla de detalle por acción debe responder: qué hago, qué envío, cuándo cuenta, cuántas veces, quién lo revisa y cuándo podré ver el resultado.

### 3. Estados y microcopy

Separar «disponible para explorar», «puedes enviar», «en revisión», «validada», «no válida con motivo», «puedes repetir con una instancia nueva» y «en pausa/agenda pendiente». Decir «puntos de ejemplo» en demo y «puntos confirmados» en cuenta real. Para referidos: «Tu amiga decide; su compra válida activa el gesto»; nunca «gana por conseguir clientes». Para Wallet: «Próximamente» hasta emitir un pase firmado real.

## Hipótesis y plan de validación

| Hipótesis | Señal de éxito | Guardarraíl |
| --- | --- | --- |
| Una tarjeta web tangible aumenta retorno al Club y recuerdo en ferias. | Aperturas autenticadas a 30 días y comprensión de para qué sirve la tarjeta. | Taps no atribuidos como visitas físicas; quejas de privacidad. |
| Dos acciones alternativas sin compra aumentan participación auténtica. | Historias/reseñas aprobadas por cada 100 clientas activas. | Moderación, duplicados, opiniones forzadas, tasa de rechazo. |
| Meta elegida + distancia real mejora comprensión y canje. | Clientas que explican costo/faltante sin ayuda; canjes válidos. | Margen de incentivos, devoluciones, compras inducidas no deseadas. |
| Colecciones privadas apoyan pertenencia sin competencia. | Uso voluntario, satisfacción y diversidad de acciones. | Bajas de correo, frustración, percepción de obligación. |

**Primero:** 5–8 pruebas moderadas en móvil con clientas de diferentes edades y niveles de compra. Tareas: abrir tarjeta, explicar qué hace un chip, encontrar un video sin comprar, repetir una historia con otra pieza, saber cuándo suma un referido y localizar un beneficio alcanzable. Medir éxito, tiempo, errores y explicación en palabras propias. **Después:** beta de 6–8 semanas con eventos instrumentados y comparación gradual; no afirmar causalidad con una muestra pequeña. Pedir consentimiento de analítica antes de seguimiento individual.

## Eventos mínimos de producto

`club_viewed`, `card_opened`, `action_category_selected`, `action_detail_opened`, `evidence_submitted`, `action_approved`, `action_rejected`, `reward_goal_selected`, `reward_redeemed`, `nfc_entry_opened` (agregado), `wallet_pass_saved`, `wallet_pass_sync_failed`, `fair_checkin_verified`. En analítica no enviar email, teléfono, URL de evidencia, token NFC ni contenido de reseñas. Los eventos financieros y de verificación viven en sus tablas transaccionales, no solo en analítica.

## Alcance de la siguiente entrega

Este repositorio incorpora la base de datos y una vista conceptual de tarjeta. Quedan **fuera** de la entrega: escribir chips físicos, emitir pases firmados, NFC de Wallet, puntos por visitas, insignias de producción y automatizaciones de correo nuevas. Sus contratos y criterios están en [Identidad digital](../architecture/digital-membership.md). El paso siguiente es un prototipo validado con clientas antes de conectar emisores y scanners.
