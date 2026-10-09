import { describe, expect, it } from "vitest";
import { actionCategories, demoExtraMissions, missionCopy, missionGuide, nextReward, recommendedMission, rewardGap, rewardGoal, visibleRewards, type Mission, type Reward } from "./club-journey";

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

  it("respeta una meta elegida y cambia de meta después de un canje de muestra", () => {
    expect(rewardGoal(rewards, 0, "cashback")?.id).toBe("cashback");
    expect(rewardGoal(rewards, 1240, "shipping", ["shipping"])?.id).toBe("cashback");
    expect(rewardGoal(rewards, 1800, null)?.id).toBe("shipping");
  });

  it("filtra el catálogo sin alterar la lista original y expande solo la vista general", () => {
    const catalog: Reward[] = Array.from({ length: 8 }, (_, index) => ({ id: String(index), code: String(index), title: String(index), description: "", points_cost: index + 1, stock: null, category: index % 2 ? "piezas" : "tarjetas" }));
    expect(visibleRewards(catalog, "todas", false).map(item => item.id)).toEqual(["0", "1", "2", "3", "4", "5"]);
    expect(visibleRewards(catalog, "todas", true)).toHaveLength(8);
    expect(visibleRewards(catalog, "piezas", false).map(item => item.id)).toEqual(["1", "3", "5", "7"]);
    expect(catalog).toHaveLength(8);
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

  it("mantiene categorías abiertas y acciones demo con reglas explícitas", () => {
    expect(actionCategories.map(category => category.id)).toEqual(["elige", "comparte", "invita", "encuentros"]);
    expect(demoExtraMissions.map(mission => missionGuide(mission.code).category)).toEqual(["elige", "comparte", "comparte", "comparte", "invita", "encuentros"]);
    expect(demoExtraMissions.every(mission => missionGuide(mission.code).repeatable)).toBe(true);
    expect(missionGuide("FAIR_VISIT").requiresEvent).toBe(true);
    expect(missionGuide("WELCOME_PROFILE").repeatable).toBe(false);
    expect(missionGuide("HONEST_REVIEW").frequency).toContain("compra distinta");
  });

  it("explica cada tarea antes de abrirla y separa requisito de historia", () => {
    const codes = ["WELCOME_PROFILE", "CARE_CARD", "SECOND_STEP", "COMPLETE_THE_LOOK", "RETURN_PURCHASE", "HONEST_REVIEW", "REAL_WALK", "VIDEO_STORY", "STYLE_TESTIMONIAL", "CARE_TIP", "WALK_TOGETHER", "FRIEND_TESTIMONIAL", "FAIR_VISIT"];
    for (const code of codes) {
      const copy = missionCopy({ id: code, code, title: "Sin título", description: "Sin requisito", points_reward: 0 });
      expect(copy.title).not.toBe("Sin título");
      expect(copy.requirement).not.toBe("Sin requisito");
      expect(copy.story.length).toBeGreaterThan(10);
    }
    expect(missionCopy({ id: "review", code: "HONEST_REVIEW", title: "", description: "", points_reward: 0 }).requirement).toContain("enlace público");
    expect(missionCopy({ id: "referral", code: "WALK_TOGETHER", title: "", description: "", points_reward: 0 }).requirement).toContain("primera compra válida");
    const review: Mission = { id: "review", code: "HONEST_REVIEW", title: "", description: "", points_reward: 150 };
    expect(missionCopy(review).requirement).toContain("una sola vez por cuenta");
    expect(missionCopy(review, true).requirement).toContain("Una por compra");
  });
});
