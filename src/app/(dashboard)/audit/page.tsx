import { createServerClient } from "@/lib/supabase/server";
import { buildMiniAudit } from "@/lib/audit/build-mini-audit";

export default async function AuditPage() {
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  const report = await buildMiniAudit(userId ?? null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mini Audit Report</h1>
      <pre className="rounded bg-slate-900 p-4 text-xs">
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  );
}
