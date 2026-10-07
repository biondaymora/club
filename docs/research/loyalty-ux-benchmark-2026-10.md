# Estudio de experiencia: claridad del Club Bionda y Mora

Fecha: 7 de octubre de 2026. Alcance: recorrido personal, acciones y banco de recompensas. Se revisaron páginas públicas y documentación oficial de programas de fidelización; no se replicaron sus interfaces ni se asumió que sus condiciones aplican a Colombia.

## Hallazgo en el Club antes del cambio

La vista de prueba mostraba cuatro tareas como tarjetas casi idénticas, con códigos internos en inglés y el estado «Disponible», pero sin una forma de abrir instrucciones o iniciar una participación. Más abajo aparecían dos tarjetas de Círculo y cuatro recompensas. La clienta no veía el orden sugerido, el avance de su recorrido ni cuánto faltaba para la recompensa siguiente. El cashback se presentaba como un canje sin distinguirlo de un saldo disponible.

## Comparación de patrones

| Programa | Evidencia observable | Decisión para Bionda y Mora |
| --- | --- | --- |
| [Sephora Beauty Insider Challenges](https://www.sephora.com/beauty/challenge-faq) | Explica las tareas, el estado de los puntos y el lugar donde consultar el avance. La participación depende de condiciones que deben conocerse antes. | Cada acción abre pasos y condiciones de validación; los estados separan «por explorar», «en revisión» y «completada». |
| [Sephora Rewards Bazaar](https://www.sephora.com/beauty/loyalty-program) | Reúne beneficios de producto, dinero y experiencias en un banco con costo en puntos. | Mantener un banco único, con costo, disponibilidad y cercanía visibles en cada recompensa. |
| [Ulta Beauty Rewards](https://www.ulta.com/rewards/faq) | Comunica de forma explícita cuánto se gana y cómo se convierten puntos en beneficios; explica exclusiones. | Mostrar saldo, costo y faltante en el mismo lugar, sin obligar a calcularlo mentalmente. |
| [Starbucks Rewards](https://about.starbucks.com/press/2026/reimagined-starbucks-rewards-loyalty-program-launches-with-new-member-benefits/) | El nivel actual, el próximo nivel y el progreso son visibles en la cuenta. | Introducir una ruta visual corta y una tarjeta de progreso hacia el beneficio siguiente. No inventar umbrales de nivel hasta que estén configurados. |
| [Rakuten Cash Back](https://www.rakuten.com/help/article/account-faq-34279916493843) | Distingue importes en proceso, pendientes y confirmados, con explicación de devoluciones y exclusiones. | No llamar «disponible» a puntos o cashback que esperan validación. Mostrar las condiciones de acreditación antes de prometer un beneficio. |
| [Smile.io: abandono de programas](https://blog.smile.io/why-customers-abandon-your-loyalty-program/) y [explicación del programa](https://blog.smile.io/how-to-explain-a-loyalty-program-to-my-customers/) | Recomienda mostrar cuánto falta para el próximo beneficio y explicar en pocos pasos cómo entrar, sumar y redimir. | Resumir la experiencia en «siguiente paso», «camino» y «beneficios», con un enlace visible entre ellos. |

## Principios aplicados

1. **Respuesta en cinco segundos:** saldo, siguiente acción y próximo beneficio en la primera pantalla.
2. **Un paso principal, otras opciones disponibles:** la recomendación prioriza cuidado, perfil e historia antes de pedir recompra.
3. **Progreso específico:** barras con valores numéricos y un faltante calculado a partir del saldo actual.
4. **Instrucciones antes de participación:** cada acción explica qué hacer y cuándo se acreditan los puntos.
5. **Estados honestos:** la vista de prueba identifica cifras y canjes ilustrativos. La cuenta conectada lee el progreso de `mission_progress`; no marca una tarea como completada por abrirla.
6. **Marca sin presión:** el recorrido es sugerido, no obligatorio, y el Círculo habla de compartir experiencias, no de vender.

## Validación con clientas

Probar con 5–8 clientas en móvil, sin guiarlas. Pedirles: (1) encontrar una forma de sumar puntos sin comprar, (2) explicar cuántos puntos faltan para un beneficio, (3) identificar cuándo se validaría una historia, (4) encontrar una recompensa que ya pueden elegir. Medir comprensión y tiempo hasta la primera acción. Antes de activar pagos o cashback real, definir reglas de acumulación, vencimiento, uso y devoluciones con negocio y soporte.

## Limitaciones pendientes

La ruta actual es una guía de interfaz; perfil de estilo, carga de contenido, enlaces personales de referido y agenda de ferias aún requieren flujos operativos. La pantalla los explica, pero no registra participación desde esas fichas. Los canjes de la vista de prueba son simulados. En la cuenta conectada, la acreditación depende de la validación en servidor y del libro mayor de puntos.
