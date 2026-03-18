import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

async function signOutAndRedirect(request: Request) {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  // Use 303 so the browser follows with GET (avoids POST /login -> 405)
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

// Support GET as well to avoid 405 if logout is triggered via a link/navigation.
export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
