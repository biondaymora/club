# Banco de acciones — Club Bionda y Mora

## Idea rectora

Una integrante no es una vendedora. Es una mujer que encuentra una pieza que la acompaña, la hace parte de su historia y, si le nace, inspira a otra mujer. El Club reconoce ese vínculo con acceso, cuidado y pequeños gestos; nunca premia spam, reseñas inventadas ni publicaciones obligatorias.

El banco nace de atributos que Bionda y Mora comunica hoy: cuero legítimo hecho en Colombia, comodidad para una vida en movimiento, artesanía duradera, cambios de talla sin costo, historias reales y piezas para trabajo, viajes y vida cotidiana. [Inicio Bionda y Mora](https://biondaymora.com/), [historia de la marca](https://biondaymora.com/pages/nosotros).

## Reglas de experiencia

- Decir **“comparte tu historia”**, **“invita a caminar juntas”** o **“inspira un look”**; no “vende”, “capta” ni “afiliada”.
- Toda acción de contenido requiere consentimiento explícito para reutilizarlo. El uso orgánico y el uso en pauta son consentimientos distintos.
- Un referido se recompensa tras una primera compra pagada que supere el período de cambios/devolución. No se bonifican registros ni enlaces enviados.
- Limitar frecuencia, repetir sólo cuando haya novedad y mostrar siempre condiciones antes de participar.
- El cashback se concede como saldo promocional, con vigencia, mínimo de compra y exclusiones visibles antes de activarlo.
- Moderar contenido y reseñas de manera transparente: una opinión honesta vale tanto si es crítica como si es favorable.

## Experiencia visual actual y límite antes de la beta

La pantalla muestra **todas las acciones desde el inicio**, agrupadas por intención (elegir/cuidar, crear/contar, invitar y encontrarnos). La ruta de cuatro etapas es una sugerencia; no desbloquea ni bloquea el banco. La demo permite repetir acciones de ejemplo un número acotado de veces por visita para enseñar la experiencia, pero no envía evidencia ni otorga puntos reales. Puntajes, topes y beneficios visibles son propuestas sujetas a aprobación comercial.

Las reglas de repetición propuestas son: un pedido diferente para cada recompra; una compra o pieza diferente y contenido original para reseñas, videos y testimonios; una amiga distinta con primera compra validada para referidos; consentimiento verificable de la autora para testimonios de amigas; y una visita confirmada por evento para ferias. Nunca se paga por compartir un enlace, una reseña positiva o publicar en redes sin validación.

**No habilitar repeticiones reales con la tabla actual:** `mission_progress` permite una sola fila por `(mission_id, customer_id)`. Antes de lanzar a clientas, añadir una instancia verificable por pedido, pieza, amiga o evento; claves de idempotencia, topes por ventana, detección de duplicados, revisión humana y entradas de ledger reversibles ante devoluciones. Los formularios reales de reseña/historia siguen limitados a una primera participación hasta completar esa ampliación.

## Acciones de bienvenida y relación

| Código | Invitación a la clienta | Resultado de negocio | Incentivo inicial | Validación |
| --- | --- | --- | --- | --- |
| `WELCOME_PROFILE` | Cuéntanos cómo caminas: estilo, talla y ciudad. | Mejor recomendación y segmentación. | 100 puntos | Perfil completo una sola vez. |
| `FIT_CONFIDENCE` | Guarda tu talla y la silueta con la que te sientes cómoda. | Menos fricción y cambios. | 75 puntos | Preferencias guardadas. |
| `CARE_CARD` | Aprende a cuidar el cuero que te acompaña. | Mayor vida útil y confianza. | 50 puntos | Lectura/interacción, máximo 1 vez por pieza. |
| `FIRST_LOOK` | Mira primero una nueva colección. | Demanda y acceso anticipado. | Acceso, no puntos | Invitación por nivel/interés. |
| `BIRTHDAY_GESTURE` | Celebremos tu mes. | Recurrencia emocional. | Regalo/cashback acotado | Mes validado; sin solicitar fecha completa públicamente. |

## Acciones de recompra y cuidado

| Código | Invitación a la clienta | Resultado de negocio | Incentivo inicial | Validación |
| --- | --- | --- | --- | --- |
| `SECOND_STEP` | Elige la pieza que completa tu forma de caminar. | Segunda compra. | 250 puntos | Pedido pagado 30+ días después del primero. |
| `COMPLETE_THE_LOOK` | Descubre un accesorio que acompaña tu pieza. | Cross-sell de accesorios. | 150 puntos | Compra de categoría complementaria. |
| `CARE_REPLENISH` | Dale un nuevo gesto de cuidado a tu cuero. | Reactivación 90–120 días. | Envío o puntos | Compra elegible posterior a ventana de uso. |
| `SEASONAL_RETURN` | Encuentra tu próxima pieza para una nueva temporada. | Reactivación 120+ días. | Acceso/cashback segmentado | No compra reciente y consentimiento email. |
| `REPAIR_AND_CONTINUE` | Cuéntanos cómo sigue tu pieza contigo. | Postventa, durabilidad, recuperación. | 200 puntos | Caso de cuidado/garantía cerrado; no condicionar la solución al contenido. |

## Acciones de comunidad y contenido

| Código | Invitación a la clienta | Resultado de negocio | Incentivo inicial | Validación |
| --- | --- | --- | --- | --- |
| `REAL_WALK` | Comparte una foto o video de un día real con tu pieza. | UGC auténtico. | 300 puntos | Revisión humana + consentimiento de uso. |
| `STYLE_NOTE` | Cuéntale a otra mujer cómo eliges comodidad y estilo. | Prueba social cualitativa. | 200 puntos | Texto, foto o video moderado; una vez por pedido. |
| `CARE_TIP` | Comparte un ritual de cuidado que te funcione. | Educación y contenido útil. | 150 puntos | Revisión humana; evitar afirmaciones engañosas. |
| `COMMUNITY_LOOK` | Participa en el look del mes. | Comunidad y descubrimiento. | 350 puntos + posibilidad de publicación | Consentimiento y curaduría; no garantizar publicación. |
| `FOUNDER_CIRCLE` | Conversa con las fundadoras sobre la próxima colección. | Investigación y pertenencia. | Acceso/experiencia | Cupos limitados, asistencia o respuesta cualitativa. |

## Acciones de recomendación cálida

| Código | Invitación a la clienta | Resultado de negocio | Incentivo inicial | Validación |
| --- | --- | --- | --- | --- |
| `WALK_TOGETHER` | Invita a una amiga a conocer una pieza que le pueda acompañar. | Adquisición por afinidad. | 300 puntos para ambas | Primera compra de la amiga, pagada y fuera de ventana de cambios. |
| `GIFT_A_STEP` | Regala una recomendación o una guía de talla. | Compra de regalo y confianza. | Empaque/nota especial o puntos | Pedido de regalo completado. |
| `FRIEND_FIT_HELP` | Ayuda a una amiga a elegir su talla desde tu experiencia. | Menos incertidumbre de compra. | 100 puntos | Amiga usa enlace y compra elegible; máximo mensual. |
| `CIRCLE_MILESTONE` | Celebra que tres amigas encontraron su propia pieza. | Referidos de calidad, no volumen. | Experiencia/acceso especial | Tres primeras compras elegibles, con tope anual. |

## Ruta de reconocimiento

1. **Esencia** — compra, perfil y cuidado.
2. **Raíz** — recompra y relación sostenida.
3. **Camino** — historias reales, looks y recomendaciones cálidas.
4. **Círculo** — embajadoras invitadas por consistencia y afinidad, nunca por obligación de venta.

El salto a **Círculo** debe combinar señales: 2+ compras, una acción de comunidad aprobada y comportamiento responsable. Beneficios recomendados: acceso anticipado, conversaciones con fundadoras, pruebas de colección, experiencias locales y un regalo anual; no comisiones abiertas.

## Métricas de control

- Recompra a 60, 90 y 180 días por cohorte.
- Tasa de compra de referido, repetición de la amiga y porcentaje de devoluciones.
- Porcentaje de contenido aprobado, permiso de reutilización y rendimiento del contenido usado.
- Costo de incentivo por pedido incremental y por clienta activa.
- Quejas, bajas de comunicación y señales de contenido forzado.

## Lanzamiento recomendado

Empezar con seis acciones: `WELCOME_PROFILE`, `CARE_CARD`, `SECOND_STEP`, `COMPLETE_THE_LOOK`, `REAL_WALK` y `WALK_TOGETHER`. Probar durante ocho semanas con un grupo de beta; ajustar puntajes antes de habilitar cashback o niveles de embajadora.
