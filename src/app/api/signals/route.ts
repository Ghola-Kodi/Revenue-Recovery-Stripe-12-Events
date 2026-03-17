import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { calculateSignals } from "@/lib/signals/calculate-signals";

export async function GET() {
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id ?? null;

  const signals = await calculateSignals(userId);
  return NextResponse.json(signals);
}
