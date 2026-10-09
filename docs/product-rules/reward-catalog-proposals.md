# Banco de recompensas — hipótesis para la demo

Estado: **propuesta de producto, no oferta comercial vigente**. Los puntos, montos, inventarios y opciones de canje del catálogo de `/club/demo` son ilustrativos. No activar el catálogo en producción ni comunicarlo por Omnisend hasta que negocio y operaciones aprueben costos, elegibilidad y entrega.

## Opciones que la clienta puede explorar en la demo

| Categoría | Recompensa | Puntos de ejemplo |
| --- | --- | ---: |
| Tarjetas | Tarjeta de regalo de $20.000 | 600 |
| Cuidado | Kit de cuidado del cuero | 850 |
| Experiencias | Acceso anticipado a una colección | 950 |
| Piezas | Pañoleta Amuleto | 1.200 |
| Piezas | Pañoleta Flora | 1.200 |
| Tarjetas | Tarjeta de regalo de $50.000 | 1.500 |
| Piezas | Estuche circular Alma | 2.500 |
| Tarjetas | Tarjeta de regalo de $100.000 | 3.200 |
| Tarjetas | Tarjeta de regalo de $150.000 | 5.000 |
| Piezas | Set Viajera | 8.500 |

Las piezas físicas se inspiran en productos de la tienda: [Kit de cuidado](https://biondaymora.com/products/kit-cuidado-del-cuero), [Pañoleta Amuleto](https://biondaymora.com/products/accesorio-panoleta-amuleto-colores), [Pañoleta Flora](https://biondaymora.com/products/panoleta-flora-colores), [Estuche circular Alma](https://biondaymora.com/products/accesorio-estuche-circular-alma-canela) y [Set Viajera](https://biondaymora.com/products/set-viajera). La existencia de un producto en la tienda **no** significa que esté reservado para el Club.

## Ideas visibles pero no canjeables

Asesoría de estilo, reserva de talla, taller de cuidado, encuentro en evento confirmado, personalización de un accesorio, servicio de renovación y la meta aspiracional de un par de botas. No tienen puntos, fecha ni botón de canje. Requieren verificar capacidad y demanda antes de definir reglas.

## Antes de ofrecerlas de verdad

1. Calcular el costo total por recompensa: costo de producto, empaque, envío, impuestos, atención, devoluciones y costo de oportunidad. Estimar la tasa real de acumulación de puntos para no prometer una meta inalcanzable ni subsidiar en exceso los canjes.
2. Aprobar denominaciones y condiciones de las tarjetas de regalo con Shopify, incluyendo vigencia, uso parcial, fraude, reversos y conciliación de pasivos. Un número de puntos mostrado en la demo no crea una tarjeta real.
3. Reservar inventario por talla/color o definir sustituciones consentidas. Para experiencias, fijar cupos y fechas antes de abrir canjes.
4. Definir elegibilidad y límites por persona, período y evento; ajustar puntos por pedido cancelado o devuelto en el ledger, sin borrar el historial.
5. Para la meta de botas, distinguir entre **puntos disponibles para gastar** y **progreso acumulado validado**. Redimir un detalle pequeño no debería borrar el recorrido hacia una meta de largo plazo. La fórmula, el umbral, la talla, el presupuesto y los límites quedan pendientes de aprobación.
6. Hacer pruebas moderadas con clientas para medir qué beneficios desean, qué esfuerzo consideran justo y si entienden que la demo no entrega beneficios reales. Revisar reglas antes de habilitar cualquier canje.

El catálogo transaccional sigue separado en `supabase/seeds/rewards.sql`; este documento no modifica esa semilla ni habilita beneficios reales.
