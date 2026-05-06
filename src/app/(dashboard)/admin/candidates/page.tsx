import { auth } from "@/lib/auth"
import { getCandidates, getAllNotes } from "@/lib/google-sheets"
import { redirect } from "next/navigation"
import AdminCandidatesClient from "./admin-candidates-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Semua Kandidat",
}

export default async function AdminCandidatesPage() {
  const session = await auth()
  if (!session || !session.user?.role?.startsWith("admin")) redirect("/login")

  const candidates = await getCandidates()
  const notes = await getAllNotes()
  const noteMap = new Map(notes.map((n) => [n.candidateId, n]))

  const enriched = candidates.map((c) => ({
    ...c,
    note: noteMap.get(c.id) || null,
    hasNote: noteMap.has(c.id),
    createdAt: c.submittedAt ? new Date(c.submittedAt) : new Date(),
    daysSinceForm: c.submittedAt
      ? Math.floor(
          (Date.now() - new Date(c.submittedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
  }))

  return <AdminCandidatesClient candidates={enriched} />
}
