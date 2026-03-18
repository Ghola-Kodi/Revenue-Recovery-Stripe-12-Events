import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold">RevEng Dashboard</span>
        <form action="/api/auth/signout" method="post">
          <button
            className="text-xs rounded border border-slate-600 px-3 py-1"
            formAction="/api/auth/signout"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="px-6 py-4">{children}</main>
    </div>
  );
}
