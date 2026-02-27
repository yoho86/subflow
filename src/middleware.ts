import { type NextRequest, NextResponse } from "next/server";

// Auth middleware — set USE_AUTH=true when Supabase is configured
const USE_AUTH = false;

export async function middleware(request: NextRequest) {
  if (!USE_AUTH) {
    return NextResponse.next();
  }

  const { updateSession } = await import("@/lib/supabase/middleware");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
