import { auth } from "@/lib/auth"
import { getDashboardStats } from "@/lib/data-service"
import { redirect } from "next/navigation"
import AdminOverviewClient from "../(dashboard)/admin/admin-client"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function SdPortalPage() {
  const session = await auth()
  if (!session || !["admin", "admin_sd"].includes(session.user?.role as string)) redirect("/login")

  const stats = await getDashboardStats("SD")

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="h-[70px] bg-[#0D1B2A] text-white flex items-center justify-between px-8 sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/sd" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-black tracking-tight leading-none uppercase">AL FAKHIR</span>
              <span className="text-[9px] text-blue-400 font-bold tracking-[0.3em] uppercase mt-1">DASHBOARD UNIT SD</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[13px] font-bold text-white">{session.user?.name}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Administrator SD</span>
          </div>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AdminOverviewClient stats={stats} role="admin_sd" />
      </main>
    </div>
  )
}
