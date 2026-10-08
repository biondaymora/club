import { describe, expect, it } from "vitest";
import { localRedirect } from "./local-redirect";

const origin = "https://club.biondaymora.com";

describe("localRedirect", () => {
  it("keeps local club and admin destinations", () => {
    expect(localRedirect("/admin?tab=canjes", origin).href).toBe(`${origin}/admin?tab=canjes`);
  });

  it("rejects external and protocol-relative redirects", () => {
    for (const destination of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) {
      expect(localRedirect(destination, origin).href).toBe(`${origin}/club`);
    }
  });
});
