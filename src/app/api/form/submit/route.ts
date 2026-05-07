import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const { candidateId, selectedInterviewer, answers, role } = await req.json()
    const email = session?.user?.email || null

    if (!candidateId || !answers) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // 1. Simpan semua jawaban dalam satu transaksi
    const answerEntries = Object.entries(answers).map(([questionId, value]) => ({
      candidateId,
      questionId,
      value: value as string,
    }))

    await prisma.$transaction(async (tx) => {
      // Hapus hanya jawaban untuk kategori yang sedang diisi (agar tidak menimpa peran lain)
      const categoryToClear = role === "student" ? "SISWA" : "ORANG TUA"

      await (tx as any).formAnswer.deleteMany({
        where: { 
          candidateId,
          question: {
            category: categoryToClear
          }
        },
      })

      // Simpan jawaban baru
      await (tx as any).formAnswer.createMany({
        data: answerEntries,
      })

      // 2. Update status kandidat dan simpan siapa pewawancaranya serta email pengirim
      await (tx as any).candidate.update({
        where: { id: candidateId },
        data: {
          status: "RESPONSE_RECEIVED",
          selectedInterviewer: selectedInterviewer,
          ...(role === "student" 
            ? { studentEmail: email } 
            : { parentEmail: email }
          )
        },
      })
    })
    
    // 3. Trigger AI Summary (Gemini) in background or after transaction
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { formAnswers: { include: { question: true } } }
      })
      
      if (candidate) {
        const { generateCandidateSummary } = await import("@/lib/gemini")
        
        const formResponse: Record<string, string> = {}
        candidate.formAnswers.forEach((ans: any) => {
          formResponse[ans.question.text] = ans.value
        })
        
        const summary = await generateCandidateSummary(
          formResponse,
          candidate.name,
          candidate.level as any,
          candidate.level === "SD" ? "Orang Tua" : "Siswa"
        )
        
        await prisma.aiSummary.upsert({
          where: { candidateId },
          update: { summary },
          create: { candidateId, summary }
        })
      }
    } catch (aiError) {
      console.error("AI Summarization failed but form was saved:", aiError)
      // We don't fail the whole request if AI fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 })
  }
}
