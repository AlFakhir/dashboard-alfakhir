import { auth } from "@/lib/auth"
import { getCandidatesByLevel } from "@/lib/data-service"
import { redirect } from "next/navigation"
import AdminCandidatesClient from "../../candidates/admin-candidates-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kandidat SD - Al Fakhir",
}

export default async function AdminSdCandidatesPage() {
  const session = await auth()
  if (!session || !["admin", "admin_sd"].includes(session.user?.role as string)) redirect("/login")

  const candidates = await getCandidatesByLevel("SD")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Daftar Kandidat SD</h1>
        <p className="text-slate-400">Daftar calon siswa tingkat Sekolah Dasar.</p>
      </div>
      
      <AdminCandidatesClient candidates={candidates as any} />
    </div>
  )
}
