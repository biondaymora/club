import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import ClubDashboard from "../club-dashboard";
import { parseDemoScenario } from "../../../lib/club-entry";

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().optional(), scenario: z.enum(["new", "returning", "subscriber"]).optional() });

const rewards = [
  { id: "11111111-1111-4111-8111-111111111111", code: "TARJETA_20000", title: "Tarjeta de regalo de $20.000", description: "Una ayuda para elegir tu próxima pieza. Valor y puntos de ejemplo, sujetos a aprobación.", points_cost: 600, stock: null },
  { id: "22222222-2222-4222-8222-222222222222", code: "KIT_DE_CUIDADO", title: "Kit de cuidado", description: "Un gesto para acompañar el cuero que amas.", points_cost: 850, stock: 8 },
  { id: "33333333-3333-4333-8333-333333333333", code: "PANOLETA", title: "Pañoleta Bionda y Mora", description: "Un detalle para acompañar tu estilo. Su disponibilidad real está por definir.", points_cost: 1200, stock: null },
  { id: "44444444-4444-4444-8444-444444444444", code: "TARJETA_50000", title: "Tarjeta de regalo de $50.000", description: "Para acercarte a una nueva elección. Valor y puntos de ejemplo, sujetos a aprobación.", points_cost: 1500, stock: null }
];

export default async function ClubDemoPage() {
  const raw = (await cookies()).get("bm_beta_profile")?.value;
  if (!raw) redirect("/registro");
  let parsed: unknown;
  try { parsed = JSON.parse(decodeURIComponent(raw)); } catch { redirect("/registro"); }
  const result = profileSchema.safeParse(parsed);
  if (!result.success) redirect("/registro");
  const profile = result.data;
  const scenario = parseDemoScenario(profile.scenario);
  const returning = scenario === "returning";
  const missions = [
    { id: "welcome-profile", code: "WELCOME_PROFILE", title: "Cuéntanos cómo caminas", description: "Completa tus preferencias para que podamos acompañarte mejor.", points_reward: 100, completed: returning },
    { id: "care-card", code: "CARE_CARD", title: "Cuida la historia que llevas", description: "Descubre el ritual de cuidado para el cuero que te acompaña.", points_reward: 50, completed: returning },
    { id: "second-step", code: "SECOND_STEP", title: "Tu segunda caminata", description: "Vuelve a elegir una pieza cuando llegue el momento para ti.", points_reward: 250 },
    { id: "complete-look", code: "COMPLETE_THE_LOOK", title: "Un gesto que acompaña", description: "Encuentra un accesorio para complementar una pieza que ya amas.", points_reward: 150 },
    { id: "honest-review", code: "HONEST_REVIEW", title: "Cuenta cómo te fue", description: "Una reseña sincera ayuda a otra mujer a elegir con confianza.", points_reward: 150 },
    { id: "real-walk", code: "REAL_WALK", title: "Una historia real", description: "Comparte un momento auténtico con tu pieza, si te nace hacerlo.", points_reward: 300 },
    { id: "walk-together", code: "WALK_TOGETHER", title: "Camina junto a una amiga", description: "Invita a una amiga a descubrir una pieza que también la acompañe.", points_reward: 300 }
  ];
  const ledger = returning ? [{ id: "welcome", event_type: "earn", amount: 150, occurred_at: new Date().toISOString(), metadata: { source: "intro" } }, { id: "purchase", event_type: "earn", amount: 1090, occurred_at: new Date(Date.now() - 86400000 * 8).toISOString(), metadata: { source: "sample-purchase" } }] : [];
  return <ClubDashboard demo demoScenario={scenario} user={{ id: `beta-preview-${scenario}`, email: profile.email ?? "", name: profile.name }} account={{ id: "preview-account", points_balance: returning ? 1240 : 0, tier_code: "Esencia" }} rewards={rewards} missions={missions} ledger={ledger} />;
}
