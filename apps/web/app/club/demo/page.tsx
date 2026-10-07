import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClubDashboard from "../club-dashboard";

type Profile = { name: string; email: string; phone: string };

const rewards = [
  { id: "11111111-1111-4111-8111-111111111111", code: "ENVIO_SIN_COSTO", title: "Envío sin costo", description: "Para que tu próxima elección llegue a ti.", points_cost: 600, stock: null },
  { id: "22222222-2222-4222-8222-222222222222", code: "KIT_DE_CUIDADO", title: "Kit de cuidado", description: "Un gesto para acompañar el cuero que amas.", points_cost: 850, stock: 8 },
  { id: "33333333-3333-4333-8333-333333333333", code: "ACCESO_ANTICIPADO", title: "Acceso anticipado", description: "Conoce la próxima colección antes que nadie.", points_cost: 1200, stock: null },
  { id: "44444444-4444-4444-8444-444444444444", code: "CASHBACK_50000", title: "$50.000 de cashback", description: "Un impulso para tu próxima elección Bionda y Mora.", points_cost: 1500, stock: null }
];

export default async function ClubDemoPage() {
  const raw = (await cookies()).get("bm_beta_profile")?.value;
  if (!raw) redirect("/registro");
  let profile: Profile;
  try { profile = JSON.parse(decodeURIComponent(raw)) as Profile; } catch { redirect("/registro"); }
  const missions = [
    { id: "welcome-profile", code: "WELCOME_PROFILE", title: "Cuéntanos cómo caminas", description: "Completa tus preferencias para que podamos acompañarte mejor.", points_reward: 100 },
    { id: "care-card", code: "CARE_CARD", title: "Cuida la historia que llevas", description: "Descubre el ritual de cuidado para el cuero que te acompaña.", points_reward: 50 },
    { id: "real-walk", code: "REAL_WALK", title: "Una historia real", description: "Comparte un momento auténtico con tu pieza, si te nace hacerlo.", points_reward: 300 },
    { id: "walk-together", code: "WALK_TOGETHER", title: "Camina junto a una amiga", description: "Invita a una amiga a descubrir una pieza que también la acompañe.", points_reward: 300 }
  ];
  return <ClubDashboard demo user={{ id: "beta-preview", email: profile.email, name: profile.name }} account={{ id: "preview-account", points_balance: 1240, tier_code: "Esencia" }} rewards={rewards} missions={missions} ledger={[{ id: "welcome", event_type: "earn", amount: 150, occurred_at: new Date().toISOString(), metadata: {} }, { id: "purchase", event_type: "earn", amount: 1090, occurred_at: new Date(Date.now() - 86400000 * 8).toISOString(), metadata: {} }]} />;
}
