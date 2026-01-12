import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const session = request.cookies.get("discord_session")
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth")

  // Allow auth pages and API auth routes
  if (isAuthPage || isApiAuth) {
    return NextResponse.next()
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
