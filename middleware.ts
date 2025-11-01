import { NextResponse, type NextRequest } from "next/server"

const SESSION_COOKIE_NAME = "admin_session"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow access to login page, login/logout APIs, and static files
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  // Protect all dashboard routes - require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/dashboard/:path*",
}


