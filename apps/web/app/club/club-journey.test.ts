import { describe, expect, it } from "vitest";
import { nextReward, recommendedMission, rewardGap, type Mission, type Reward } from "./club-journey";

const rewards: Reward[] = [
  { id: "cashback", code: "cashback_50000", title: "Cashback", description: "", points_cost: 1500, stock: null },
  { id: "shipping", code: "free_shipping", title: "Envío", description: "", points_cost: 600, stock: null },
  { id: "soldout", code: "soldout", title: "Agotado", description: "", points_cost: 1300, stock: 0 }
];

describe("camino y beneficios", () => {
  it("muestra la siguiente recompensa alcanzable y los puntos exactos que faltan", () => {
    const reward = nextReward(rewards, 1240);
    expect(reward?.id).toBe("cashback");
    expect(rewardGap(1240, reward!.points_cost)).toBe(260);
    expect(rewardGap(1600, reward!.points_cost)).toBe(0);
  });

  it("recomienda una acción pendiente que no exige una nueva compra", () => {
    const missions: Mission[] = [
      { id: "buy", code: "SECOND_STEP", title: "Comprar", description: "", points_reward: 250 },
      { id: "profile", code: "WELCOME_PROFILE", title: "Perfil", description: "", points_reward: 100, completed: true },
      { id: "story", code: "REAL_WALK", title: "Historia", description: "", points_reward: 300 },
      { id: "care", code: "CARE_CARD", title: "Cuidado", description: "", points_reward: 50, pending: true }
    ];
    expect(recommendedMission(missions)?.id).toBe("story");
  });
});
