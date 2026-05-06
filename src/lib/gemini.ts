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
Kamu adalah asisten evaluasi penerimaan siswa baru yang berpengalaman untuk sekolah Islam Modern Al Fakhir.
Jenjang kandidat: ${level}
Nama kandidat: ${candidateName}

${level === "SMP" ? 
`PENTING: Untuk jenjang SMP, data mencakup jawaban dari ORANG TUA dan CALON SISWA. 
Tugasmu adalah menganalisis kedua perspektif tersebut, melihat keselarasan antara harapan orang tua dan motivasi siswa.` : 
`Data ini berisi jawaban dari ORANG TUA siswa.`
}

Berikut adalah data jawaban formulir observasi:
---
${formattedAnswers}
---

Buatlah ringkasan evaluasi yang komprehensif dalam Bahasa Indonesia dengan format berikut:

## Ringkasan Keseluruhan
[Analisis profil kandidat. Jika SMP, soroti bagaimana dinamika antara jawaban anak dan orang tua.]

## Kekuatan Utama
- [Kekuatan karakter/akademik berdasarkan data]

## Analisis Kesesuaian (SMP Only)
[Hanya jika SMP: Analisis apakah motivasi siswa selaras dengan harapan orang tua dan visi sekolah.]

## Hal yang Perlu Diperhatikan
- [Potensi kendala atau area yang perlu dikonfirmasi saat wawancara]

## Rekomendasi Pertanyaan Wawancara
[Daftar pertanyaan tajam untuk menggali lebih dalam saat tatap muka]

## Skor Kesesuaian
**Skor: [X]/10**
*Alasan: [Penjelasan singkat]*
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
