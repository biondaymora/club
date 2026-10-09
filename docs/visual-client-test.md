# Prueba guiada con una clienta — sin integraciones

Estado: **prototipo funcional de experiencia**, no programa de fidelización activo. El enlace público es `/registro` con `NEXT_PUBLIC_CLUB_MODE=preview`. No solicitar correo, celular, compra, reseña real ni archivos a la participante. No prometer recompensas: precios, puntos, stock y reglas visibles son ilustrativos hasta que negocio los apruebe.

Prueba también la tercera entrada desde `/registro?origen=web`: elegir «Me suscribí en la web» debe mostrar 0 puntos, una bienvenida propia y acciones de producto/reseña marcadas para después de una compra. No pedir una suscripción real durante la prueba visual.

## Preparación (5 minutos)

1. Abrir `/registro` en el propio teléfono de prueba; verificar que la página carga sin login de Vercel.
2. Pulsar «Soy nueva en el Club». Debe aparecer **0 puntos de ejemplo** y la etiqueta de demo.
3. Pulsar «Reiniciar prueba» antes de ceder el teléfono. El avance de acciones y canjes se guarda solo en `sessionStorage` para resistir una recarga y se borra al reiniciar o al iniciar un escenario nuevo. La cookie de entrada guarda solo `name` y `scenario` durante un máximo de ocho horas; la opción invitada usa «Invitada».
4. Tener a mano esta guía y anotar respuestas **sin datos personales**. No grabar pantalla, voz o rostro sin autorización explícita.

## Tareas para la clienta (15–20 minutos)

No explicar dónde pulsar. Preguntar primero qué cree que puede hacer; después darle estas tareas en orden:

| # | Tarea | Señal de éxito sin ayuda |
| --- | --- | --- |
| 1 | Entra como nueva, prueba la preferencia de estilo sugerida y di qué es real. | Reconoce que empieza en 0, elige una preferencia y comprende que los puntos son ficticios. |
| 2 | Encuentra cómo grabar un video y averigua si podrías hacerlo más de una vez. | Llega al detalle desde el inicio; explica «uno original por pieza» y validación. |
| 3 | Simula esa acción y vuelve a cargar la página. | Ve +300 puntos de ejemplo, historial y progreso conservado. |
| 4 | Elige «Kit de cuidado» como meta; explica cuánto falta. | Encuentra el banco, selecciona meta y describe faltante/costo sin ayuda. |
| 5 | Encuentra otra acción que no implique comprar. | Usa categorías o atajos; sabe que la ruta sugerida no bloquea nada. |
| 6 | Abre «Mi tarjeta» y explica qué hará un futuro chip NFC. | Dice que abre la web, no inicia sesión ni suma puntos por tocar. |
| 7 | Cambia al escenario «Ya he comprado antes» y simula un canje. | Reconoce 1.240 puntos de ejemplo y que el canje no entrega beneficio real. |
| 8 | Busca una tarjeta de regalo, una pañoleta y el Set Viajera; luego encuentra la idea de las botas. | Usa filtros o «Ver todas», identifica el costo de muestra y entiende que las botas no se pueden redimir todavía. |

Registrar por tarea: completada sin ayuda / con ayuda / no completada, tiempo aproximado, dudas textuales y momento de confusión. Al terminar, preguntar «¿Qué harías por gusto?», «¿Qué te parecería demasiado trabajo?» y «¿Qué beneficio te ilusiona de verdad?». No interpretar una única prueba como validación de mercado; usarla para corregir fallos obvios antes de ampliar a 5–8 clientas.

## Criterio para decir “lista para una prueba visual”

- [x] Entrada sin datos personales obligatorios y dos puntos de partida explícitos.
- [x] Puntos, canjes, tarjeta y Wallet etiquetados como muestra o futuro.
- [x] Accesos directos a reseña, video, invitación y recompensas desde el inicio.
- [x] Reglas de validación y repetición visibles antes de simular cada acción.
- [x] Primera acción sugerida practicable: elegir una preferencia antes de sumar puntos ficticios.
- [x] Meta de recompensa elegible, costo y faltante visibles.
- [x] Avance local resiste recarga; reinicio disponible entre participantes.
- [x] Flujo móvil revisado a 390 y 320 px; sin desbordamiento horizontal a 320 px.
- [x] Lint, tipos, pruebas unitarias y build ejecutados.
- [ ] Comprobar el despliegue final en el teléfono real de la reunión y registrar cualquier diferencia de navegador.
- [ ] Primera prueba moderada observada y anotada; corregir los bloqueos encontrados antes de invitar a más clientas.

## Lo que **no** se puede probar todavía

No se crean perfiles reales, no se envía evidencia ni contenido al equipo, no se vinculan compras ni referidos, no se acreditan puntos, no se entregan beneficios y no se emiten tarjetas NFC/Wallet. Para una **beta transaccional** hacen falta las integraciones y el checklist de [readiness de producción](production-readiness.md); la prueba visual no sustituye esas condiciones.
