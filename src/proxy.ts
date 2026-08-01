import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken = request.cookies.get("authjs.session-token")
    || request.cookies.get("__Secure-authjs.session-token")

  if (pathname.startsWith("/admin") && !sessionToken) {
    return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), request.url))
  }

  if ((pathname.startsWith("/perfil") || pathname.startsWith("/chat") || pathname.startsWith("/universidad") || pathname.startsWith("/tutor-academico") || pathname.startsWith("/tutor-empresa") || pathname.startsWith("/notificaciones") || pathname.startsWith("/calendario")) && !sessionToken) {
    return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|login|register|recuperar|restablecer|pasantias).*)"],
}
