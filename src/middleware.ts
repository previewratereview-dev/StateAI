import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const requiresAuth = pathname.startsWith("/crm") || pathname === "/login" || pathname === "/admin";
  const isPrefetch = request.headers.has("x-middleware-prefetch") || request.headers.get("purpose") === "prefetch";

  // Performance optimization: skip Supabase getUser query on prefetch links and public routes
  if (!requiresAuth || isPrefetch) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /crm/* routes
  if (pathname.startsWith("/crm") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect /admin → /crm/jobs
  if (pathname === "/admin" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm/jobs";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api/webhooks|api/resend|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
