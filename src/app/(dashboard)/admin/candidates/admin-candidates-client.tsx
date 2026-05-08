"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  Download,
  Filter,
  Trash2,
  QrCode,
  ArrowRight,
  Edit,
  RefreshCw
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { ITEMS_PER_PAGE, INTERVIEWERS, ROOMS } from "@/lib/constants"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import { addCandidate, deleteCandidate, updateCandidateInterviewer, updateCandidateRoom, updateCandidate, updateCandidateStatus } from "@/lib/actions"

interface Candidate {
  id: string
  name: string
  email?: string
  level: string
  status: string
  createdAt: Date
  room?: string
  selectedInterviewer?: string | null
  parentPhone?: string | null
  correctedName?: string | null
}

interface Props {
  candidates: Candidate[]
}

const thStyle = "px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.05em] text-center whitespace-nowrap border-b border-[#E2E8F0]"
const tdCenterStyle = "px-4 py-3.5 text-[13px] text-[#475569] text-center whitespace-nowrap border-b border-[#F1F5F9]"

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "RESPONSE_RECEIVED":
      return <Badge variant="success">Formulir Masuk</Badge>
    case "PENDING":
      return <Badge variant="muted">Belum Ada Formulir</Badge>
    case "REVIEWED":
      return <Badge variant="info">Selesai</Badge>
    default:
      return <Badge variant="warning">Menunggu</Badge>
  }
}

export default function AdminCandidatesClient({ candidates: initialCandidates }: Props) {
  const router = useRouter()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)
  const [statusFilter, setStatusFilter] = useState("Semua Status")
  const [levelFilter, setLevelFilter] = useState("Semua Jenjang")
  const [origin, setOrigin] = useState("")
  const [role, setRole] = useState("parent")
  const [targetDelete, setTargetDelete] = useState<Candidate | null>(null)
  const [targetReset, setTargetReset] = useState<Candidate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Real-time polling
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/candidates')
        if (res.ok) {
          const data = await res.json()
          setCandidates(data)
        }
      } catch (e) {
        console.error("Polling error:", e)
      }
    }

    const interval = setInterval(poll, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "Semua Status" || 
        (statusFilter === "Formulir Masuk" && c.status === "RESPONSE_RECEIVED") ||
        (statusFilter === "Belum Ada" && c.status === "PENDING") ||
        (statusFilter === "Selesai" && c.status === "REVIEWED")
      const matchesLevel = levelFilter === "Semua Jenjang" || c.level === levelFilter
      
      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [candidates, search, statusFilter, levelFilter])

  const exportToCSV = () => {
    const headers = ["Nama", "Jenjang", "Ruangan", "Status", "Tanggal"]
    const data = filtered.map(c => [
      c.name,
      c.level,
      c.room || "-",
      c.status,
      formatDate(c.createdAt)
    ])
    
    const csvContent = [headers, ...data].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `kandidat_al_fakhir_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#0F172A] m-0 italic uppercase tracking-tight">Daftar Seluruh Kandidat</h2>
          <p className="text-[13px] text-[#94A3B8] m-0 mt-1 font-medium">Monitoring data real-time untuk Unit SD & SMP</p>
        </div>
        <div className="flex gap-2.5">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="h-10 border-[#E2E8F0] bg-white text-[#475569] rounded-xl px-4 text-[13px] font-semibold hover:bg-slate-50 transition-all"
          >
            <Download size={16} className="mr-2" />
            Ekspor CSV
          </Button>
          <Button 
            onClick={() => setIsAddingCandidate(true)}
            className="h-10 bg-slate-900 hover:bg-black text-white rounded-xl px-5 text-[13px] font-bold shadow-lg shadow-slate-900/20"
          >
            <Plus size={18} className="mr-2" />
            Tambah Siswa Baru
          </Button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder="Cari nama kandidat..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 text-[13px] text-[#0F172A] outline-none bg-[#F8FAFC] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 border border-[#E2E8F0] rounded-xl px-3 text-[13px] font-bold text-[#475569] bg-[#F8FAFC] cursor-pointer outline-none hover:border-[#CBD5E1] transition-all min-w-[150px]"
        >
          <option>Semua Status</option>
          <option>Formulir Masuk</option>
          <option>Belum Ada</option>
          <option>Selesai</option>
        </select>
        <select 
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1) }}
          className="h-10 border border-[#E2E8F0] rounded-xl px-3 text-[13px] font-bold text-[#475569] bg-[#F8FAFC] cursor-pointer outline-none hover:border-[#CBD5E1] transition-all min-w-[150px]"
        >
          <option>Semua Jenjang</option>
          <option>SD</option>
          <option>SMP</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className={cn(thStyle, "w-12")}>#</th>
                <th className={cn(thStyle, "text-left")}>Nama Kandidat</th>
                <th className={cn(thStyle, "w-24")}>Jenjang</th>
                <th className={cn(thStyle, "w-32")}>Ruangan</th>
                <th className={cn(thStyle, "w-48")}>Pewawancara</th>
                <th className={cn(thStyle, "w-36")}>Status</th>
                <th className={cn(thStyle, "w-40")}>Tanggal</th>
                <th className={cn(thStyle, "w-32")}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center text-[#94A3B8]">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <Search size={40} className="text-slate-200" />
                    </div>
                    <div className="text-[15px] font-bold text-[#475569] mb-1">Tidak ada data siswa ditemukan</div>
                    <div className="text-[13px]">Coba ubah filter atau tambah data siswa baru</div>
                  </td>
                </tr>
              ) : (
                paginated.map((c, i) => (
                  <tr 
                    key={c.id} 
                    className={cn(
                      "transition-all duration-300 group border-b border-[#F1F5F9]",
                      c.level === "SD" ? "hover:bg-blue-50/30" : "hover:bg-purple-50/30"
                    )}
                  >
                    <td className={tdCenterStyle}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[13px] text-[#0F172A] group-hover:text-primary transition-colors">
                        {c.correctedName || c.name}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 font-black uppercase tracking-widest">
                        {c.parentPhone ? (
                          <span className="text-emerald-600">📱 {c.parentPhone}</span>
                        ) : (
                          "Belum Ada No. HP"
                        )}
                      </div>
                    </td>
                    <td className={tdCenterStyle}>
                      <select 
                        defaultValue={c.level}
                        onChange={async (e) => {
                          await updateCandidate(c.id, { level: e.target.value as any })
                        }}
                        className={cn(
                          "w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2 py-1 text-[11px] font-bold outline-none focus:border-primary transition-all cursor-pointer",
                          c.level === "SD" ? "text-sd" : "text-smp"
                        )}
                      >
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                      </select>
                    </td>
                    <td className={tdCenterStyle}>
                      <select 
                        defaultValue={c.room || ""}
                        onChange={async (e) => {
                          await updateCandidateRoom(c.id, e.target.value)
                        }}
                        className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-1 py-1 text-[11px] font-bold text-[#475569] outline-none focus:border-primary transition-all"
                      >
                        <option value="">-</option>
                        {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className={tdCenterStyle}>
                      <select 
                        defaultValue={c.selectedInterviewer || ""}
                        onChange={async (e) => {
                          await updateCandidateInterviewer(c.id, e.target.value)
                        }}
                        className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2 py-1 text-[11px] font-bold text-[#475569] outline-none focus:border-primary transition-all"
                      >
                        <option value="">Pilih...</option>
                        {INTERVIEWERS.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                    </td>
                    <td className={tdCenterStyle}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className={cn(tdCenterStyle, "text-[12px] text-[#94A3B8]")}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td className={tdCenterStyle}>
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setEditingCandidate(c)}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#94A3B8] hover:text-primary transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => setSelectedCandidate(c)}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#94A3B8] hover:text-primary transition-all"
                          title="QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                        <button 
                          onClick={() => setTargetReset(c)}
                          className="w-8 h-8 rounded-lg border border-amber-100 bg-white flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-all"
                          title="Reset Status"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button 
                          onClick={() => setTargetDelete(c)}
                          className="w-8 h-8 rounded-lg border border-[#FEE2E2] bg-white flex items-center justify-center text-[#EF4444] hover:bg-[#FEE2E2] transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Candidate Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={() => setEditingCandidate(null)}>
        <DialogContent className="max-w-md rounded-3xl p-0 bg-white overflow-hidden border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-4 bg-slate-50/50">
            <DialogTitle className="text-[18px] font-black text-[#0F172A] uppercase tracking-tight">
              Edit Data Siswa
            </DialogTitle>
          </DialogHeader>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault()
              if (!editingCandidate) return
              const formData = new FormData(e.currentTarget)
              const name = formData.get("name") as string
              const level = formData.get("level") as any
              
              await updateCandidate(editingCandidate.id, { name, level })
              setEditingCandidate(null)
              router.refresh()
            }}
            className="p-8 space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
              <input 
                name="name"
                defaultValue={editingCandidate?.name}
                required
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-[14px] outline-none focus:border-primary transition-all bg-slate-50/50 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Jenjang</label>
              <select 
                name="level"
                defaultValue={editingCandidate?.level}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-[14px] outline-none focus:border-primary transition-all bg-slate-50/50 font-bold"
              >
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setEditingCandidate(null)}
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-500 font-bold"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-xs rounded-2xl p-8 bg-white overflow-hidden relative">
          <DialogTitle className="text-center text-[18px] font-bold text-[#0F172A] mb-6">
            Akses Formulir Observasi
          </DialogTitle>
          
          <div className="flex flex-col items-center">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 w-full">
              <button 
                onClick={() => setRole("parent")}
                className={cn(
                  "flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                  role === "parent" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                )}
              >
                Orang Tua
              </button>
              {selectedCandidate?.level === "SMP" && (
                <button 
                  onClick={() => setRole("student")}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                    role === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                  )}
                >
                  Calon Siswa
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-3xl border-4 border-[#F1F5F9] shadow-xl mb-6 min-h-[200px] flex items-center justify-center">
              {origin && (
                <QRCodeSVG 
                  value={`https://dashboard-alfakhir.vercel.app/form/${selectedCandidate?.id}${role === "student" ? "?role=student" : ""}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>
            
            <div className="text-center space-y-2 mb-8">
              <div className="text-[15px] font-bold text-[#0F172A] uppercase tracking-tight">
                {selectedCandidate?.name}
              </div>
              <div className="px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-[11px] font-black rounded-full inline-block uppercase tracking-widest">
                LINK FORM {role === "student" ? "SISWA" : "ORANG TUA"}
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20"
              onClick={() => {
                const url = `https://dashboard-alfakhir.vercel.app/form/${selectedCandidate?.id}${role === "student" ? "?role=student" : ""}`;
                navigator.clipboard.writeText(url);
                setSelectedCandidate(null);
                setRole("parent"); // Reset
              }}
            >
              Salin Link {role === "student" ? "Siswa" : "Orang Tua"}
            </Button>
            
            <p className="mt-4 text-[11px] text-[#94A3B8] font-medium">
              Link ini digunakan oleh orang tua/siswa untuk mengisi data observasi.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddingCandidate} onOpenChange={setIsAddingCandidate}>
        <DialogContent className="max-w-md rounded-[32px] p-0 bg-white overflow-hidden border-none shadow-2xl">
          <DialogHeader className="px-10 pt-10 pb-6 bg-slate-50/50">
            <DialogTitle className="text-[24px] font-black text-[#0F172A] uppercase tracking-tighter italic">
              Tambah Siswa Baru
            </DialogTitle>
          </DialogHeader>
          
          <form className="p-10 space-y-6" onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const name = formData.get("name") as string
            const level = formData.get("level") as string
            const room = formData.get("room") as string
            const selectedInterviewer = formData.get("selectedInterviewer") as string
            
            if (name && level) {
              const res = await addCandidate({ name, level, room, selectedInterviewer })
              if (res.success) {
                setIsAddingCandidate(false)
                router.refresh()
              } else {
                alert(res.error)
              }
            }
          }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap Siswa</label>
              <input 
                name="name"
                required
                placeholder="Contoh: Abdullah Hakim..."
                className="w-full h-14 border-2 border-slate-100 rounded-2xl px-5 text-[15px] font-bold outline-none focus:border-primary transition-all bg-slate-50/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Unit Sekolah</label>
                <select 
                  name="level"
                  required
                  className="w-full h-14 border-2 border-slate-100 rounded-2xl px-4 text-[15px] font-bold outline-none focus:border-primary transition-all bg-slate-50/30 cursor-pointer"
                >
                  <option value="SD">Unit SD</option>
                  <option value="SMP">Unit SMP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ruangan</label>
                <select 
                  name="room"
                  required
                  className="w-full h-14 border-2 border-slate-100 rounded-2xl px-4 text-[15px] font-bold outline-none focus:border-primary transition-all bg-slate-50/30 cursor-pointer"
                >
                  <option value="">Pilih...</option>
                  {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pewawancara Terpilih</label>
              <select 
                name="selectedInterviewer"
                required
                className="w-full h-14 border-2 border-slate-100 rounded-2xl px-4 text-[15px] font-bold outline-none focus:border-primary transition-all bg-slate-50/30 cursor-pointer"
              >
                <option value="">Pilih Pewawancara...</option>
                {INTERVIEWERS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            <div className="pt-6 flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingCandidate(false)}
                className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-400 uppercase tracking-widest text-[12px]"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[12px] shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1"
              >
                Simpan Data
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!targetDelete} onOpenChange={() => !isDeleting && setTargetDelete(null)}>
        <DialogContent className="max-w-md rounded-[32px] p-10 bg-white border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
            <Trash2 size={40} />
          </div>
          <h2 className="text-[24px] font-black text-[#0F172A] uppercase tracking-tighter italic mb-3">Hapus Kandidat?</h2>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-10">
            Anda akan menghapus data <span className="font-bold text-slate-900">{targetDelete?.name}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-12 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
              onClick={() => setTargetDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button 
              className="h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
              disabled={isDeleting}
              onClick={async () => {
                if (!targetDelete) return
                setIsDeleting(true)
                const res = await deleteCandidate(targetDelete.id)
                setIsDeleting(false)
                if (res.success) {
                  setCandidates(prev => prev.filter(c => c.id !== targetDelete.id))
                  setTargetDelete(null)
                  toast.success("Kandidat berhasil dihapus")
                } else {
                  toast.error(res.error || "Gagal menghapus")
                }
              }}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={!!targetReset} onOpenChange={() => !isResetting && setTargetReset(null)}>
        <DialogContent className="max-w-md rounded-[32px] p-10 bg-white border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <RefreshCw size={40} />
          </div>
          <h2 className="text-[24px] font-black text-[#0F172A] uppercase tracking-tighter italic mb-3">Reset Status?</h2>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-10">
            Kembalikan status <span className="font-bold text-slate-900">{targetReset?.name}</span> ke 'Pending' agar bisa mengisi formulir kembali?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-12 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
              onClick={() => setTargetReset(null)}
              disabled={isResetting}
            >
              Batal
            </Button>
            <Button 
              className="h-12 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
              disabled={isResetting}
              onClick={async () => {
                if (!targetReset) return
                setIsResetting(true)
                const res = await updateCandidateStatus(targetReset.id, "PENDING")
                setIsResetting(false)
                if (res.success) {
                  setTargetReset(null)
                  router.refresh()
                  toast.success("Status berhasil di-reset")
                } else {
                  toast.error("Gagal me-reset status")
                }
              }}
            >
              {isResetting ? "Memproses..." : "Ya, Reset"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
