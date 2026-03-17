import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildMiniAudit } from "@/lib/audit/build-mini-audit";

export async function GET() {
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id ?? null;
  const report = await buildMiniAudit(userId);
  return NextResponse.json(report);
}
