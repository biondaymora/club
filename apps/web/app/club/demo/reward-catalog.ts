import type { Reward } from "../club-journey";

/** These point amounts are presentation examples, not approved financial offers. */
export const demoRewards: Reward[] = [
  { id: "11111111-1111-4111-8111-111111111111", code: "TARJETA_20000", category: "tarjetas", title: "Tarjeta de regalo de $20.000", description: "Un primer impulso para tu próxima elección. Monto y puntos de ejemplo.", points_cost: 600, stock: null },
  { id: "22222222-2222-4222-8222-222222222222", code: "KIT_DE_CUIDADO", category: "cuidado", title: "Kit de cuidado del cuero", description: "Para acompañar tus piezas por más tiempo. Producto y disponibilidad por confirmar.", points_cost: 850, stock: 8 },
  { id: "55555555-5555-4555-8555-555555555555", code: "ACCESO_ANTICIPADO", category: "experiencias", title: "Acceso anticipado a una colección", description: "Conoce un lanzamiento antes de su apertura general. Fechas por definir.", points_cost: 950, stock: null },
  { id: "33333333-3333-4333-8333-333333333333", code: "PANOLETA_AMULETO", category: "piezas", title: "Pañoleta Amuleto", description: "Un detalle de la colección para acompañar distintos looks. Color según inventario.", points_cost: 1200, stock: null },
  { id: "66666666-6666-4666-8666-666666666666", code: "PANOLETA_FLORA", category: "piezas", title: "Pañoleta Flora", description: "Una pieza botánica y versátil. Su disponibilidad real está por confirmar.", points_cost: 1200, stock: null },
  { id: "44444444-4444-4444-8444-444444444444", code: "TARJETA_50000", category: "tarjetas", title: "Tarjeta de regalo de $50.000", description: "Para acercarte a una nueva elección. Monto y puntos de ejemplo.", points_cost: 1500, stock: null },
  { id: "77777777-7777-4777-8777-777777777777", code: "ESTUCHE_ALMA", category: "piezas", title: "Estuche circular Alma", description: "Un accesorio de cuero para llevar tus pequeños esenciales. Color según inventario.", points_cost: 2500, stock: null },
  { id: "88888888-8888-4888-8888-888888888888", code: "TARJETA_100000", category: "tarjetas", title: "Tarjeta de regalo de $100.000", description: "Una meta para una próxima pieza. Monto y puntos de ejemplo.", points_cost: 3200, stock: null },
  { id: "99999999-9999-4999-8999-999999999999", code: "TARJETA_150000", category: "tarjetas", title: "Tarjeta de regalo de $150.000", description: "Un beneficio mayor para tu siguiente elección. Monto y puntos de ejemplo.", points_cost: 5000, stock: null },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", code: "SET_VIAJERA", category: "piezas", title: "Set Viajera", description: "Correa porta celular, estuche y portagafas en cuero. Su entrega requeriría stock reservado.", points_cost: 8500, stock: null }
];

/** No price, points or redemption until business and operations approve these ideas. */
export const rewardIdeas = [
  { title: "Asesoría personal de estilo", description: "Una conversación para elegir silueta, color y formas de combinar." },
  { title: "Reserva de talla en lanzamiento", description: "Acceso a una talla o color durante una ventana de preventa definida." },
  { title: "Taller de cuidado", description: "Aprender con el equipo cómo mantener las piezas de cuero." },
  { title: "Encuentro con las fundadoras", description: "Una experiencia cercana en una feria o evento confirmado." },
  { title: "Personalización de accesorio", description: "Un detalle propio en una pieza compatible, si producción lo permite." },
  { title: "Servicio de renovación", description: "Evaluación de cuidado o reparación ligera, sujeta a capacidad del taller." }
];
