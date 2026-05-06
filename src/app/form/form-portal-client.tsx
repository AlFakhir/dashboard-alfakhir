"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, ArrowRight, MapPin, Users, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ROOMS } from "@/lib/constants"

interface Candidate {
  id: string
  name: string
  level: string
  room: string | null
}

interface Props {
  candidates: Candidate[]
}

export default function FormPortalClient({ candidates }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [level, setLevel] = useState<string | null>(null)
  const [room, setRoom] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [role, setRole] = useState<"parent" | "student">("parent")

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => c.level === level && c.room === room)
  }, [candidates, level, room])

  const handleStart = () => {
    if (selectedId) {
      router.push(`/form/${selectedId}${role === "student" ? "?role=student" : ""}`)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 mb-10">
        <div className="h-16 w-16 bg-slate-900 rounded-[22px] flex items-center justify-center mx-auto shadow-2xl rotate-3">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Portal Observasi</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">TA 2026/2027 • Al Fakhir Modern Islamic School</p>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center px-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
              step >= s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-300"
            )}>
              {s}
            </div>
            {s < 3 && <div className={cn("w-12 h-1 bg-slate-100 rounded-full", step > s && "bg-slate-900")} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
        {/* Step 1: Level & Room (Dropdown Version) */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  <Users className="h-3 w-3" /> Pilih Unit Sekolah
                </label>
                <div className="relative group">
                  <select
                    value={level || ""}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 text-[15px] font-black italic text-slate-900 appearance-none outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>Klik untuk memilih unit...</option>
                    <option value="SD">UNIT SD (Sekolah Dasar)</option>
                    <option value="SMP">UNIT SMP (Sekolah Menengah Pertama)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  <MapPin className="h-3 w-3" /> Pilih Ruangan Observasi
                </label>
                <div className="relative group">
                  <select
                    value={room || ""}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 text-[15px] font-black italic text-slate-900 appearance-none outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>Klik untuk memilih ruangan...</option>
                    {ROOMS.map((r) => (
                      <option key={r} value={r}>RUANGAN {r}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-16 rounded-[24px] bg-slate-900 hover:bg-black text-white font-black italic shadow-2xl shadow-slate-900/30 disabled:opacity-20 transition-all hover:-translate-y-1 active:scale-95"
              disabled={!level || !room}
              onClick={() => setStep(2)}
            >
              CARI NAMA SISWA <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Select Name */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <UserCircle className="h-3 w-3" /> Pilih Nama Anda
              </label>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">
                    Tidak ada siswa terdaftar di {level} {room}
                  </div>
                ) : (
                  filteredCandidates.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "w-full p-5 rounded-2xl border-2 text-left transition-all",
                        selectedId === c.id ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 hover:border-slate-300"
                      )}
                    >
                      <div className="font-black italic uppercase text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{level} • {room}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold" onClick={() => setStep(1)}>
                Kembali
              </Button>
              <Button 
                style={{ flex: 2 }}
                className="h-14 rounded-2xl bg-slate-900 text-white font-black italic shadow-xl disabled:opacity-30 flex items-center justify-center"
                disabled={!selectedId}
                onClick={() => setStep(3)}
              >
                PILIH NAMA <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Role */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Terpilih</p>
              <h3 className="text-2xl font-black italic text-slate-900 uppercase">{candidates.find(c => c.id === selectedId)?.name}</h3>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siapa yang mengisi?</label>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setRole("parent")}
                  className={cn(
                    "p-6 rounded-[28px] border-2 text-center transition-all flex flex-col items-center gap-2",
                    role === "parent" ? "border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-900/30 -translate-y-1" : "border-slate-100 bg-slate-50 text-slate-400"
                  )}
                >
                  <Users className="h-6 w-6 mb-1" />
                  <span className="font-black italic uppercase tracking-tight">Orang Tua Calon Siswa</span>
                </button>
                {level === "SMP" && (
                  <button
                    onClick={() => setRole("student")}
                    className={cn(
                      "p-6 rounded-[28px] border-2 text-center transition-all flex flex-col items-center gap-2",
                      role === "student" ? "border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-900/30 -translate-y-1" : "border-slate-100 bg-slate-50 text-slate-400"
                    )}
                  >
                    <GraduationCap className="h-6 w-6 mb-1" />
                    <span className="font-black italic uppercase tracking-tight">Calon Siswa Sendiri</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold" onClick={() => setStep(2)}>
                Ganti Nama
              </Button>
              <Button 
                style={{ flex: 2 }}
                className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black italic shadow-xl shadow-emerald-500/20 flex items-center justify-center"
                onClick={handleStart}
              >
                MULAI OBSERVASI <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center space-y-2 pb-10">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">Al Fakhir Modern Islamic School</p>
        <p className="text-[10px] text-slate-400 font-medium">Developer by Feri</p>
      </div>
    </div>
  )
}
