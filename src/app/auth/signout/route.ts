import { NextRequest, NextResponse } from "next/server";
import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Write to the response directly, not the read-only cookie store
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          // Delete from the response directly
          response.cookies.set({ name, value: "", ...options });
          response.cookies.delete(name);
        },
      },
    }
  );

  await supabase.auth.signOut();

  return response;
}
