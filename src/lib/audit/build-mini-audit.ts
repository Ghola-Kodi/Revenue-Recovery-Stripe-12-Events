import { createServerClient } from "@/lib/supabase/server";

export async function buildMiniAudit(userId: string | null) {
  const supabase = createServerClient();
  // placeholder: read last 30 days of events scoped by userId

  return {
    summary: "Demo mini audit for synthetic data",
    signals: [
      { key: "authorization_rate", value: 91, severity: "amber" },
      { key: "recovery_rate", value: 11, severity: "red" },
    ],
    revenueAtRisk: 12000,
    fixes: [
      "Implement invoice.upcoming handler for expiring cards",
      "Wire invoice.payment_succeeded to exit dunning sequences",
    ],
  };
}
