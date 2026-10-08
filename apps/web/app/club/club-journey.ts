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

type MissionGuide = {
  stage: StageId;
  time: string;
  steps: string[];
  validation: string;
};

const guides: Record<string, MissionGuide> = {
  WELCOME_PROFILE: { stage: "empieza", time: "2 min", steps: ["Cuéntanos qué tipo de piezas te gustan y cómo prefieres usarlas.", "Cuando se habilite tu perfil de estilo, guarda tus preferencias una sola vez."], validation: "Los puntos se asignarán cuando el perfil quede completo y verificado." },
  CARE_CARD: { stage: "empieza", time: "3 min", steps: ["Descubre cómo limpiar y conservar el cuero de tu pieza.", "Guarda la guía para tenerla cerca después de tu compra."], validation: "La lectura se registrará cuando esté disponible la guía dentro del Club." },
  SECOND_STEP: { stage: "disfruta", time: "A tu ritmo", steps: ["Explora la colección cuando quieras encontrar una nueva pieza.", "Tu segunda compra elegible se asociará a tu cuenta del Club."], validation: "Se confirma después del pago y del período de cambios." },
  COMPLETE_THE_LOOK: { stage: "disfruta", time: "A tu ritmo", steps: ["Encuentra un accesorio que acompañe una pieza que ya tienes.", "Compra desde la tienda con el mismo correo asociado al Club."], validation: "Se confirma después del pago y del período de cambios." },
  HONEST_REVIEW: { stage: "comparte", time: "5 min", steps: ["Escribe una reseña sincera de una pieza que compraste.", "Comparte aquí el enlace público para que el equipo pueda revisarla."], validation: "El equipo verifica la compra y la reseña antes de acreditar los puntos. Tu opinión no tiene que ser positiva." },
  REAL_WALK: { stage: "comparte", time: "5 min", steps: ["Cuenta una experiencia honesta con tu pieza, en foto, video o palabras.", "Decide por separado si autorizas que la marca publique tu contenido."], validation: "El equipo revisa la participación antes de asignar puntos. Una reseña crítica también es bienvenida." },
  WALK_TOGETHER: { stage: "circulo", time: "Cuando quieras", steps: ["Recomienda la marca a una amiga sólo si crees que le puede gustar.", "La invitación se vinculará a tu cuenta cuando se habilite el enlace personal."], validation: "Ambas reciben el beneficio cuando la primera compra de tu amiga sea válida y pase el período de cambios." }
};

const fallbackGuide: MissionGuide = {
  stage: "comparte",
  time: "A tu ritmo",
  steps: ["Conoce los detalles de esta acción antes de participar."],
  validation: "El equipo del Club confirmará la participación antes de asignar los puntos."
};

export function missionGuide(code: string): MissionGuide {
  return guides[code.toUpperCase()] ?? fallbackGuide;
}

export function rewardGap(balance: number, cost: number): number {
  return Math.max(0, cost - Math.max(0, balance));
}

export function nextReward(rewards: Reward[], balance: number): Reward | null {
  return [...rewards]
    .filter(reward => reward.stock !== 0 && reward.points_cost > balance)
    .sort((a, b) => a.points_cost - b.points_cost)[0] ?? null;
}

export function recommendedMission(missions: Mission[]): Mission | null {
  const priority = ["HONEST_REVIEW", "REAL_WALK", "WELCOME_PROFILE", "CARE_CARD", "WALK_TOGETHER", "SECOND_STEP", "COMPLETE_THE_LOOK"];
  return [...missions]
    .filter(mission => !mission.completed && !mission.pending)
    .sort((a, b) => {
      const aRank = priority.indexOf(a.code.toUpperCase());
      const bRank = priority.indexOf(b.code.toUpperCase());
      return (aRank < 0 ? priority.length : aRank) - (bRank < 0 ? priority.length : bRank);
    })[0] ?? null;
}
