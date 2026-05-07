import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateCandidateSummary(
  formResponse: Record<string, string>,
  candidateName: string,
  level: "SD" | "SMP",
  respondentType: "Orang Tua" | "Siswa"
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

  const formattedAnswers = Object.entries(formResponse)
    .filter(([key]) => !["Timestamp", "Email Address"].includes(key))
    .map(([question, answer]) => `**${question}**: ${answer}`)
    .join("\n")

  const prompt = `
Tugas: Buat ringkasan evaluasi SINGKAT & PADAT untuk calon siswa ${level} bernama ${candidateName}.
Gaya: Profesional, langsung ke poin utama, tanpa basa-basi pembuka/penutup.

${level === "SMP" ? "Analisis keselarasan antara jawaban ORANG TUA dan SISWA." : "Analisis jawaban ORANG TUA."}

Data Jawaban:
${formattedAnswers}

Format Output:
- **Analisis Utama**: (1-2 kalimat inti)
- **Kekuatan**: (Poin-poin singkat)
- **Red Flags/Perhatian**: (Poin-poin singkat)
- **Tanya Saat Wawancara**: (1-2 pertanyaan kunci)
- **Skor Kesesuaian**: [X]/10 (Berikan alasan singkat)
  `.trim()

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function generateBatchSummary(
  candidates: Array<{
    name: string
    level: "SD" | "SMP"
    formResponse: Record<string, string>
  }>
): Promise<Record<string, string>> {
  const summaries: Record<string, string> = {}
  const BATCH_SIZE = 5

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (c) => {
        const summary = await generateCandidateSummary(
          c.formResponse,
          c.name,
          c.level,
          c.level === "SD" ? "Orang Tua" : "Siswa"
        )
        return { name: c.name, summary }
      })
    )

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        summaries[result.value.name] = result.value.summary
      }
    })

    if (i + BATCH_SIZE < candidates.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  return summaries
}
