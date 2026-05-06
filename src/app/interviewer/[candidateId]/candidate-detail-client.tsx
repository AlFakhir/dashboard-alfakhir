"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Candidate, InterviewerNote } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/input"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { SkeletonSummary } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Sparkles,
  Lock,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Props {
  candidate: Candidate
  existingNote: InterviewerNote | null
  savedSummary: string | null
}

const RECOMMENDATION_OPTIONS = [
  { value: "Terima", label: "✅ Terima", color: "success" },
  { value: "Pertimbangkan", label: "⚠️ Pertimbangkan", color: "warning" },
  { value: "Tolak", label: "❌ Tolak", color: "danger" },
] as const

// Simple markdown-to-HTML renderer (ES2017 compatible)
function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^<]*<\/li>)/g, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hlu])/gm, '')
}

export default function CandidateDetailClient({
  candidate,
  existingNote,
  savedSummary,
}: Props) {
  const router = useRouter()

  // Notes form state
  const [observation, setObservation] = useState(existingNote?.observation || "")
  const [academicAssessment, setAcademicAssessment] = useState(existingNote?.academicAssessment || "")
  const [familySupport, setFamilySupport] = useState(existingNote?.familySupport || "")
  const [characterNotes, setCharacterNotes] = useState(existingNote?.characterNotes || "")
  const [otherNotes, setOtherNotes] = useState(existingNote?.otherNotes || "")
  const [recommendation, setRecommendation] = useState<"Terima" | "Pertimbangkan" | "Tolak" | "">(
    (existingNote?.recommendation as any) || ""
  )
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // AI summary state
  const [summary, setSummary] = useState<string | null>(savedSummary)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  const isLocked = existingNote?.isLocked ?? false

  const handleGenerateSummary = async () => {
    const answers = (candidate as any).formAnswers || []
    if (answers.length === 0) {
      toast.error("Tidak ada data formulir untuk diringkas")
      return
    }
    setGeneratingSummary(true)
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          formResponse: answers.reduce((acc: any, curr: any) => {
            acc[curr.question.text] = curr.answer
            return acc
          }, {}),
          candidateName: candidate.name,
          level: candidate.level,
        }),
      })
      if (!res.ok) throw new Error("Gagal generate")
      const data = await res.json()
      setSummary(data.summary)
      toast.success("Ringkasan AI berhasil dibuat!")
    } catch {
      toast.error("Gagal menghasilkan ringkasan AI")
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleSubmitNote = async () => {
    if (!recommendation) {
      toast.error("Pilih rekomendasi terlebih dahulu")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          observation,
          academicAssessment,
          familySupport,
          characterNotes,
          otherNotes,
          recommendation,
          aiSummary: summary || "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan")
      toast.success("Catatan berhasil disimpan dan dikunci!")
      setShowConfirm(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const formEntries = (candidate as any).formAnswers || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{candidate.name}</h1>
            <Badge variant={candidate.level === "SD" ? "info" : "purple"}>
              {candidate.level}
            </Badge>
            {isLocked && (
              <Badge variant="success">
                <Lock className="h-3 w-3" />
                Catatan Terkunci
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pewawancara: <span className="font-medium">{candidate.selectedInterviewer || "Belum ditentukan"}</span>
            {candidate.createdAt && (
              <>
                {" · "}Pendaftaran: {formatDate(candidate.createdAt)}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Notes + Answers */}
        <div className="lg:col-span-3 space-y-6">
          {/* Notes form */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4 text-emerald-500" />
                      Catatan Observasi (Terkunci)
                    </>
                  ) : (
                    "Isi Catatan Observasi"
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLocked ? (
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Catatan telah dikirim</p>
                      <p className="text-xs text-emerald-600">{formatDate(existingNote?.createdAt)}</p>
                    </div>
                  </div>
                  {[
                    { label: "Observasi Umum", value: existingNote?.observation },
                    { label: "Kesiapan Akademik", value: existingNote?.academicAssessment },
                    { label: "Dukungan Keluarga", value: existingNote?.familySupport },
                    { label: "Karakter & Sikap", value: existingNote?.characterNotes },
                    { label: "Catatan Lainnya", value: existingNote?.otherNotes },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
                      <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl leading-relaxed">{value}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rekomendasi Final</p>
                    <Badge variant={existingNote?.recommendation === "Terima" ? "success" : existingNote?.recommendation === "Tolak" ? "danger" : "warning"} className="text-sm px-4 py-1">
                      {existingNote?.recommendation}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea label="Observasi Umum" placeholder="Catatan umum..." value={observation} onChange={(e) => setObservation(e.target.value)} />
                    <Textarea label="Kesiapan Akademik" placeholder="Penilaian akademik..." value={academicAssessment} onChange={(e) => setAcademicAssessment(e.target.value)} />
                    <Textarea label="Dukungan Keluarga" placeholder="Penilaian keluarga..." value={familySupport} onChange={(e) => setFamilySupport(e.target.value)} />
                    <Textarea label="Karakter & Sikap" placeholder="Catatan karakter..." value={characterNotes} onChange={(e) => setCharacterNotes(e.target.value)} />
                    <Textarea label="Catatan Lainnya" placeholder="Catatan tambahan lainnya..." value={otherNotes} onChange={(e) => setOtherNotes(e.target.value)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Rekomendasi Final</p>
                    <div className="flex flex-wrap gap-3">
                      {RECOMMENDATION_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${recommendation === opt.value ? (opt.value === "Terima" ? "border-emerald-400 bg-emerald-50" : opt.value === "Tolak" ? "border-rose-400 bg-rose-50" : "border-amber-400 bg-amber-50") : "border-slate-200 bg-white hover:border-slate-300"}`}>
                          <input type="radio" name="recommendation" value={opt.value} checked={recommendation === opt.value} onChange={() => setRecommendation(opt.value)} className="sr-only" />
                          <span className="text-sm font-semibold">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => setShowConfirm(true)} className="w-full h-12 rounded-xl" disabled={!observation || !academicAssessment || !familySupport || !characterNotes || !recommendation}>
                    <Send className="h-4 w-4" /> Kirim & Kunci Catatan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form responses BELOW Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Jawaban Formulir Observasi</CardTitle>
            </CardHeader>
            <CardContent>
              {formEntries.length === 0 ? (
                <div className="text-center py-10">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">Formulir belum masuk</p>
                </div>
              ) : (
                <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Observasi Orang Tua
                        </h3>
                        {(candidate as any).parentEmail && (
                          <Badge variant="muted" className="text-[10px] border-emerald-100 text-emerald-600 bg-emerald-50/30">
                            Email: {(candidate as any).parentEmail}
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4">
                        {formEntries.filter((e: any) => e.question.category === "ORANG TUA").map((entry: any) => (
                          <div key={entry.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{entry.question.text}</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.answer || entry.value || "Tidak diisi"}</p>
                          </div>
                        ))}
                        {formEntries.filter((e: any) => e.question.category === "ORANG TUA").length === 0 && (
                          <p className="text-xs text-slate-400 italic">Belum ada data observasi orang tua.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> Wawancara Calon Siswa
                        </h3>
                        {(candidate as any).studentEmail && (
                          <Badge variant="muted" className="text-[10px] border-blue-100 text-blue-600 bg-blue-50/30">
                            Email: {(candidate as any).studentEmail}
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4">
                        {formEntries.filter((e: any) => e.question.category === "SISWA").map((entry: any) => (
                          <div key={entry.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{entry.question.text}</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.answer || entry.value || "Tidak diisi"}</p>
                          </div>
                        ))}
                        {formEntries.filter((e: any) => e.question.category === "SISWA").length === 0 && (
                          <p className="text-xs text-slate-400 italic">Belum ada data wawancara siswa.</p>
                        )}
                      </div>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: AI Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  Ringkasan AI (Gemini)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!summary && !generatingSummary ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-xs text-slate-400">Klik tombol di bawah untuk analisis AI</p>
                  <Button onClick={handleGenerateSummary} className="w-full">Generate Ringkasan</Button>
                </div>
              ) : generatingSummary ? (
                <SkeletonSummary />
              ) : (
                <div>
                  <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(summary!) }} />
                  <Button variant="outline" size="sm" onClick={handleGenerateSummary} className="w-full mt-4">Generate Ulang</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Simpan & Kunci</DialogTitle>
            <DialogDescription>
              Catatan tidak dapat diubah setelah dikunci. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Batal</Button>
            <Button onClick={handleSubmitNote} disabled={submitting}>Ya, Simpan & Kunci</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
