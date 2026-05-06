import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch latest 10 activities
    const notes = await prisma.interviewerNote.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { candidate: true }
    })

    const candidates = await prisma.candidate.findMany({
      where: { status: "RESPONSE_RECEIVED" },
      take: 5,
      orderBy: { updatedAt: "desc" }
    })

    const notifications = [
      ...notes.map((n: any) => ({
        id: n.id,
        type: 'note',
        title: 'Hasil Observasi Masuk',
        description: `${n.interviewerName} telah menyelesaikan observasi ${n.candidate.name}`,
        time: n.createdAt,
        candidateId: n.candidateId
      })),
      ...candidates.map((c: any) => ({
        id: c.id + '_form',
        type: 'form',
        title: 'Formulir Masuk',
        description: `Orang Tua/Siswa ${c.name} telah mengirimkan jawaban`,
        time: c.updatedAt,
        candidateId: c.id
      }))
    ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10)

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
