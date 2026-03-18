import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  // Use 303 so the browser follows with GET (avoids POST /login -> 405)
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
