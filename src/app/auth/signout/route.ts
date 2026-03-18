import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  await supabase.auth.signOut();

  // 303 forces the browser to follow the redirect as a GET
  // This prevents the 405 error on the /login page
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
