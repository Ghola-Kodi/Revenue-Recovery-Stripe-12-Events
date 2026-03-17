import { createServerClient } from "@/lib/supabase/server";

export async function calculateSignals(userId: string | null) {
  const supabase = createServerClient();

  // demo placeholder - in real app calculate from events table
  return {
    authorizationRate: 91,
    paymentFailureRate: 9,
    recoveryRate: 11,
    disputeRate: 1,
    dunningExitCompliance: 60,
    paymentMethodDistribution: { card: 90, bank: 10 },
    healthScore: 58,
  };
}
