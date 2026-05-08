import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isPublicPage = 
    nextUrl.pathname.startsWith("/academic") || 
    nextUrl.pathname.startsWith("/form") ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/api/public") ||
    nextUrl.pathname.startsWith("/logo") ||
    nextUrl.pathname === "/";

  // Jika tidak ada sesi dan bukan halaman publik, arahkan ke login
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
