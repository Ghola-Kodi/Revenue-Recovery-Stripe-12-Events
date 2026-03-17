import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const start = Date.now();
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("exchangeCodeForSession took", Date.now() - start, "ms");
    if (error) {
      console.error("exchangeCodeForSession error", error);
      const loginUrl = new URL("/login", requestUrl);
      loginUrl.searchParams.set("authError", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl));
}
