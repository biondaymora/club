import { describe, expect, it } from "vitest";
import { entryExperience, parseDemoScenario } from "./club-entry";

describe("entradas al Club", () => {
  it("acepta la suscripción web como tercera entrada sin asignarle una compra", () => {
    expect(parseDemoScenario("subscriber")).toBe("subscriber");
    expect(entryExperience("subscriber").eligibleQuickActions).not.toContain("HONEST_REVIEW");
    expect(entryExperience("subscriber").introduction).toContain("no suma puntos");
  });

  it("no confía en escenarios inventados", () => {
    expect(parseDemoScenario("returning")).toBe("returning");
    expect(parseDemoScenario("unknown")).toBe("new");
  });
});
