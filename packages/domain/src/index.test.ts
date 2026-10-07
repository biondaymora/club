import { describe, expect, it } from "vitest";
import { isValidLedgerAmount } from "./index";

describe("isValidLedgerAmount", () => {
  it("accepts signed whole ledger movements", () => {
    expect(isValidLedgerAmount(1)).toBe(true);
    expect(isValidLedgerAmount(-250)).toBe(true);
  });

  it("rejects zero and fractional movements", () => {
    expect(isValidLedgerAmount(0)).toBe(false);
    expect(isValidLedgerAmount(1.5)).toBe(false);
  });
});

