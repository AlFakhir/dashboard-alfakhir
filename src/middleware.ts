import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Biarkan semua request lewat. 
  // Proteksi login akan ditangani langsung di dalam layout/page masing-masing 
  // (misalnya di folder /admin atau /interviewer)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
