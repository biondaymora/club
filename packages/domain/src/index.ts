export type LedgerEventType = "earn" | "redeem" | "reverse" | "expire" | "adjustment";

/** Amounts are integer minor currency units / whole points; never floats. */
export function isValidLedgerAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount !== 0;
}

