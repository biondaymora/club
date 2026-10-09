export const demoScenarios = ["new", "returning", "subscriber"] as const;
export type DemoScenario = typeof demoScenarios[number];

export function parseDemoScenario(value: unknown): DemoScenario {
  return demoScenarios.find(scenario => scenario === value) ?? "new";
}

export function entryExperience(scenario: DemoScenario) {
  if (scenario === "subscriber") return {
    label: "suscriptora de la web",
    introduction: "Llegaste por nuestro correo. Explora las piezas, elige lo que te inspira y descubre cómo avanzar; suscribirte no suma puntos canjeables.",
    eligibleQuickActions: ["WELCOME_PROFILE"]
  };
  if (scenario === "new") return {
    label: "visitante de feria",
    introduction: "Nos conocimos en vivo. Puedes explorar el Club y elegir tu próxima pieza; una visita solo suma puntos si el equipo la verifica.",
    eligibleQuickActions: ["WELCOME_PROFILE"]
  };
  return {
    label: "clienta que ya compró",
    introduction: "Tu historia con Bionda y Mora ya comenzó. Conoce las acciones que pueden acompañar tu próxima caminata.",
    eligibleQuickActions: ["HONEST_REVIEW", "VIDEO_STORY", "WALK_TOGETHER"]
  };
}
