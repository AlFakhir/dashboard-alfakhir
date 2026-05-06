import { auth } from "@/lib/auth"
import { getDashboardStats } from "@/lib/data-service"
import { redirect } from "next/navigation"
import AdminOverviewClient from "../admin-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard SMP - Al Fakhir",
}

export default async function AdminSmpPage() {
  const session = await auth()
  if (!session || !["admin", "admin_smp"].includes(session.user?.role as string)) redirect("/login")

  const stats = await getDashboardStats("SMP")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Unit SMP Islam Modern</h1>
        <p className="text-slate-400">Monitoring progres observasi dan kuesioner unit SMP.</p>
      </div>
      
      <AdminOverviewClient stats={stats} role={session.user.role} />
    </div>
  )
}
