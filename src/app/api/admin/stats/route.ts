import { auth } from "@/lib/auth"
import { getAdminStats } from "@/lib/google-sheets"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const stats = await getAdminStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[GET /api/admin/stats]", error)
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 })
  }
}
