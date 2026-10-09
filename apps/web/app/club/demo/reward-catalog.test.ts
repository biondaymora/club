import { describe, expect, it } from "vitest";
import { rewardCategories } from "../club-journey";
import { demoRewards, rewardIdeas } from "./reward-catalog";

describe("catálogo de recompensas de muestra", () => {
  it("mantiene opciones únicas, ordenadas y categorizadas", () => {
    expect(demoRewards.length).toBeGreaterThanOrEqual(10);
    expect(new Set(demoRewards.map(reward => reward.id)).size).toBe(demoRewards.length);
    expect(new Set(demoRewards.map(reward => reward.code)).size).toBe(demoRewards.length);
    expect(demoRewards.map(reward => reward.points_cost)).toEqual([...demoRewards.map(reward => reward.points_cost)].sort((a, b) => a - b));
    expect(demoRewards.every(reward => rewardCategories.some(category => category.id === reward.category))).toBe(true);
  });

  it("deja las ideas aspiracionales sin costo ni canje", () => {
    expect(rewardIdeas.length).toBeGreaterThanOrEqual(6);
    expect(rewardIdeas.every(idea => !Object.hasOwn(idea, "points_cost") && !Object.hasOwn(idea, "stock"))).toBe(true);
    expect(demoRewards.every(reward => !reward.title.toLowerCase().includes("bota"))).toBe(true);
  });
});
