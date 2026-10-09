export type Reward = {
  id: string;
  code: string;
  title: string;
  description: string;
  points_cost: number;
  stock: number | null;
};

export type Mission = {
  id: string;
  code: string;
  title: string;
  description: string;
  points_reward: number;
  completed?: boolean;
  pending?: boolean;
};

export const journeyStages = [
  { id: "empieza", number: "01", title: "Empieza", description: "Conoce el Club y descubre cómo cuidar tus piezas.", benefit: "Tus primeros puntos" },
  { id: "disfruta", number: "02", title: "Disfruta", description: "Elige a tu ritmo y vuelve cuando encuentres algo para ti.", benefit: "Más opciones para redimir" },
  { id: "comparte", number: "03", title: "Comparte", description: "Tu experiencia puede inspirar a otras mujeres.", benefit: "Reconocimiento por tu historia" },
  { id: "circulo", number: "04", title: "Círculo", description: "Invita a una amiga y acércate a nuestros encuentros.", benefit: "Experiencias de comunidad" }
] as const;

export type StageId = typeof journeyStages[number]["id"];

export const actionCategories = [
  { id: "elige", title: "Elegir y cuidar", description: "Piezas, recompra y cuidado" },
  { id: "comparte", title: "Crear y contar", description: "Reseñas, fotos y videos" },
  { id: "invita", title: "Invitar", description: "Amigas e historias compartidas" },
  { id: "encuentros", title: "Encontrarnos", description: "Ferias y comunidad" }
] as const;

export type ActionCategory = typeof actionCategories[number]["id"];

export type MissionGuide = {
  stage: StageId;
  category: ActionCategory;
  time: string;
  steps: string[];
  validation: string;
  frequency: string;
  repeatable: boolean;
  demoLimit?: number;
  requiresEvent?: boolean;
};

const guides: Record<string, MissionGuide> = {
  WELCOME_PROFILE: { stage: "empieza", category: "elige", time: "2 min", frequency: "Una sola vez", repeatable: false, steps: ["En esta demo, elige el estilo que más te gusta para practicar el recorrido.", "Cuando se habilite tu perfil real, podrás guardar tus preferencias de forma voluntaria."], validation: "La elección de esta demo solo suma puntos ficticios. El perfil real se validará antes de asignar puntos." },
  CARE_CARD: { stage: "empieza", category: "elige", time: "3 min", frequency: "Una sola vez en esta versión", repeatable: false, steps: ["Descubre cómo limpiar y conservar el cuero de tu pieza.", "Guarda la guía para tenerla cerca después de tu compra."], validation: "La lectura se registrará cuando esté disponible la guía dentro del Club." },
  SECOND_STEP: { stage: "disfruta", category: "elige", time: "A tu ritmo", frequency: "Hito de segunda compra", repeatable: false, steps: ["Explora la colección cuando quieras encontrar una nueva pieza.", "Tu segunda compra elegible se asociará a tu cuenta del Club."], validation: "Se confirma después del pago y del período de cambios." },
  COMPLETE_THE_LOOK: { stage: "disfruta", category: "elige", time: "A tu ritmo", frequency: "Por compra complementaria", repeatable: true, demoLimit: 2, steps: ["Encuentra un accesorio que acompañe una pieza que ya tienes.", "Compra desde la tienda con el mismo correo asociado al Club."], validation: "Una compra complementaria distinta puede volver a participar; se confirma después del pago y del período de cambios." },
  RETURN_PURCHASE: { stage: "disfruta", category: "elige", time: "A tu ritmo", frequency: "Por pedido elegible", repeatable: true, demoLimit: 3, steps: ["Vuelve a la tienda cuando encuentres una pieza que realmente quieras usar.", "Compra con el correo de tu cuenta del Club; cada pedido debe ser distinto."], validation: "Cada pedido elegible se revisa después de pago y devoluciones. No se premian pedidos anulados." },
  HONEST_REVIEW: { stage: "comparte", category: "comparte", time: "5 min", frequency: "Una por compra distinta", repeatable: true, demoLimit: 2, steps: ["Escribe una reseña sincera de una pieza que compraste.", "Comparte aquí el enlace público para que el equipo pueda revisarla."], validation: "El equipo verifica cada compra y reseña antes de acreditar puntos. Tu opinión no tiene que ser positiva." },
  REAL_WALK: { stage: "comparte", category: "comparte", time: "5 min", frequency: "Una historia original por pieza", repeatable: true, demoLimit: 2, steps: ["Cuenta una experiencia honesta con tu pieza, en foto, video o palabras.", "Decide por separado si autorizas que la marca publique tu contenido."], validation: "El equipo revisa que cada historia sea distinta antes de asignar puntos. Publicarla desde la marca requiere permiso aparte." },
  VIDEO_STORY: { stage: "comparte", category: "comparte", time: "10 min", frequency: "Un video original por pieza", repeatable: true, demoLimit: 2, steps: ["Graba un momento real con tu pieza; no hace falta producir un anuncio.", "Conserva el enlace y decide aparte si autorizas reutilizar el video."], validation: "Se revisan autenticidad, pieza y compra. Un segundo video debe aportar una historia nueva, no duplicar el primero." },
  STYLE_TESTIMONIAL: { stage: "comparte", category: "comparte", time: "5 min", frequency: "Uno por compra distinta", repeatable: true, demoLimit: 2, steps: ["Cuenta con tus palabras qué te gustó y qué mejorarías.", "Puedes compartir texto o un enlace a audio/video si lo prefieres."], validation: "El equipo confirma la compra y que el testimonio sea genuino. No se exige una opinión positiva." },
  CARE_TIP: { stage: "comparte", category: "comparte", time: "4 min", frequency: "Una idea nueva por mes", repeatable: true, demoLimit: 2, steps: ["Comparte un consejo de cuidado que hayas probado de verdad.", "Explica para qué material o pieza funciona, sin prometer resultados universales."], validation: "Se revisa seguridad y originalidad. Repetir el mismo consejo no genera puntos nuevos." },
  WALK_TOGETHER: { stage: "circulo", category: "invita", time: "Cuando quieras", frequency: "Hasta 3 amigas con compra válida al mes", repeatable: true, demoLimit: 3, steps: ["Recomienda la marca a una amiga sólo si crees que le puede gustar.", "La invitación se vinculará a tu cuenta cuando se habilite el enlace personal."], validation: "Cada amiga debe hacer su primera compra válida y pasar el período de cambios; compartir el enlace por sí solo no suma." },
  FRIEND_TESTIMONIAL: { stage: "circulo", category: "invita", time: "5 min", frequency: "Uno por amiga y compra distintas", repeatable: true, demoLimit: 2, steps: ["Si una amiga ya compró y quiere contar su experiencia, pídele permiso antes de compartir su enlace.", "Ella conserva el control de su testimonio y del permiso de publicación."], validation: "Se verifica compra, autoría y consentimiento de tu amiga. No se premian reseñas inventadas ni datos de contacto recolectados sin permiso." },
  FAIR_VISIT: { stage: "circulo", category: "encuentros", time: "En fecha de feria", frequency: "Una visita por feria", repeatable: true, requiresEvent: true, steps: ["Consulta la agenda cuando haya una feria confirmada cerca de ti.", "Al visitarnos, solicita al equipo el registro presencial de tu asistencia."], validation: "El equipo valida cada visita en la feria. No se usa ubicación del celular en segundo plano." }
};

const fallbackGuide: MissionGuide = {
  stage: "comparte",
  category: "comparte",
  time: "A tu ritmo",
  frequency: "Según las condiciones de la acción",
  repeatable: false,
  steps: ["Conoce los detalles de esta acción antes de participar."],
  validation: "El equipo del Club confirmará la participación antes de asignar los puntos."
};

export function missionGuide(code: string): MissionGuide {
  return guides[code.toUpperCase()] ?? fallbackGuide;
}

/** Illustrative cards only; no extra mission is submitted to Supabase. */
export const demoExtraMissions: Mission[] = [
  { id: "demo-return-purchase", code: "RETURN_PURCHASE", title: "Vuelve cuando una pieza te llame", description: "Cada nueva compra elegible puede acercarte a otra recompensa.", points_reward: 200 },
  { id: "demo-video-story", code: "VIDEO_STORY", title: "Graba un video real", description: "Muéstranos cómo te acompaña tu pieza en un día de verdad.", points_reward: 300 },
  { id: "demo-style-testimonial", code: "STYLE_TESTIMONIAL", title: "Cuéntanos tu experiencia", description: "Un testimonio honesto, en tus palabras y sin guion.", points_reward: 180 },
  { id: "demo-care-tip", code: "CARE_TIP", title: "Comparte un consejo de cuidado", description: "Una idea útil y probada por ti puede ayudar a otra mujer.", points_reward: 100 },
  { id: "demo-friend-testimonial", code: "FRIEND_TESTIMONIAL", title: "Trae la historia de una amiga", description: "Si compró y quiere contarla, compártela con su permiso.", points_reward: 200 },
  { id: "demo-fair-visit", code: "FAIR_VISIT", title: "Ven a vernos en una feria", description: "Conoce las piezas y al equipo cuando tengamos un encuentro confirmado.", points_reward: 120 }
];

export function rewardGap(balance: number, cost: number): number {
  return Math.max(0, cost - Math.max(0, balance));
}

export function nextReward(rewards: Reward[], balance: number): Reward | null {
  return [...rewards]
    .filter(reward => reward.stock !== 0 && reward.points_cost > balance)
    .sort((a, b) => a.points_cost - b.points_cost)[0] ?? null;
}

export function rewardGoal(rewards: Reward[], balance: number, chosenId: string | null, redeemedIds: string[] = []): Reward | null {
  const eligible = rewards.filter(reward => reward.stock !== 0 && !redeemedIds.includes(reward.id));
  const chosen = eligible.find(reward => reward.id === chosenId);
  return chosen ?? nextReward(eligible, balance) ?? [...eligible].sort((a, b) => a.points_cost - b.points_cost)[0] ?? null;
}

export function recommendedMission(missions: Mission[]): Mission | null {
  const priority = ["WELCOME_PROFILE", "CARE_CARD", "HONEST_REVIEW", "REAL_WALK", "COMPLETE_THE_LOOK", "SECOND_STEP", "WALK_TOGETHER"];
  return [...missions]
    .filter(mission => !mission.completed && !mission.pending)
    .sort((a, b) => {
      const aRank = priority.indexOf(a.code.toUpperCase());
      const bRank = priority.indexOf(b.code.toUpperCase());
      return (aRank < 0 ? priority.length : aRank) - (bRank < 0 ? priority.length : bRank);
    })[0] ?? null;
}
