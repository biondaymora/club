import { z } from "zod";

const demoSnapshotSchema = z.object({
  balance: z.number().int().min(0).max(1_000_000),
  ledgerEntries: z.array(z.object({
    id: z.string().min(1), event_type: z.string().min(1), amount: z.number().int(),
    occurred_at: z.string().datetime(), metadata: z.record(z.unknown())
  })).max(100),
  demoCompletions: z.record(z.number().int().min(0).max(10)),
  demoRedemptions: z.array(z.string().min(1)).max(50),
  goalRewardId: z.string().min(1).nullable()
});

export function readDemoSnapshot(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = demoSnapshotSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
