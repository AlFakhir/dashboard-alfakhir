"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, QrCode, MessageSquare, UserCheck, Clock } from "lucide-react"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/layout/brand-logo"

interface HeaderProps {
  session: any
  isPortal?: boolean
}

export function Header({ session, isPortal }: HeaderProps) {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname === "/admin") return "Ringkasan Utama"
    if (pathname === "/admin/candidates") return "Seluruh Kandidat"
    if (pathname === "/admin/questions") return "Manajemen Soal Observasi"
    if (pathname === "/admin/academic") return "Manajemen Soal Akademik"
    if (pathname === "/admin/sd") return "Dashboard SD"
    if (pathname === "/admin/smp") return "Dashboard SMP"
    if (pathname === "/interviewer") return "Kandidat Saya"
    return "Halaman"
  }

  const name = session.user?.name || "User"
  const role = session.user?.role || "interviewer"

  const [showQR, setShowQR] = useState(false)
  const [origin, setOrigin] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNew, setHasNew] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return // Diam saja jika gagal (biasanya karena server restart/dev mode)

      const data = await res.json()
      
      if (Array.isArray(data)) {
        setNotifications(prev => {
          if (prev.length > 0 && data.length > 0 && data[0].id !== prev[0].id) {
            setHasNew(true)
          }
          return data
        })
      }
    } catch (error) {
      // Hanya log error jika benar-benar fatal, diam saja di mode dev
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  if (isPortal) {
    return (
      <div className="flex items-center gap-4">
        {/* QR Portal Utama */}
        <button 
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <QrCode size={16} />
          <span className="text-[11px] font-black uppercase tracking-tight">QR Portal</span>
        </button>

        {/* Bell with Notification Center */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications)
              setHasNew(false)
            }}
            className={cn(
              "w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all relative",
              showNotifications && "bg-white/10 text-white"
            )}
          >
            <Bell size={18} />
            {hasNew && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0D1B2A] animate-pulse" />
            )}
          </button>
          {/* Dropdown remains the same */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-[320px] bg-white border border-slate-100 rounded-[28px] shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between text-slate-900">
                <span className="text-[13px] font-black uppercase tracking-tight italic">Aktivitas Terkini</span>
                <Badge variant="muted" className="text-[9px] font-black bg-white border-slate-200">{notifications.length}</Badge>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-[12px] text-slate-400 font-medium">Belum ada aktivitas baru</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-3 items-start group cursor-default text-left">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        notif.type === 'note' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {notif.type === 'note' ? <UserCheck size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors">{notif.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{notif.description}</div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                          <Clock size={8} /> {new Date(notif.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="text-right flex flex-col items-end">
            <div className="text-[13px] font-bold text-white leading-tight">
              {session.user?.name?.replace('SMPI ', '').replace('SD ', '')}
            </div>
            <div className="text-[10px] font-bold text-gold uppercase tracking-widest mt-1 opacity-70">ADMINISTRATOR</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[14px] font-black border-2 border-gold/30">
            {session.user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <SignOutButton />

        {/* Global QR Dialog */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="max-w-2xl rounded-[32px] shadow-2xl p-0 overflow-hidden border-none">
            <div className="bg-slate-900 p-8 text-center">
              <DialogTitle className="text-[20px] font-black text-white uppercase tracking-tighter italic mb-2">
                Pusat Akses Portal QR
              </DialogTitle>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Scan untuk langsung menuju halaman portal
              </p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-10 bg-white">
              {/* Portal Observasi */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-50 p-5 rounded-[32px] border-2 border-slate-100 shadow-sm mb-5">
                  <QRCodeSVG 
                    value={`${origin}/form`} 
                    size={160}
                    level="H"
                  />
                </div>
                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic mb-1">Portal Observasi</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Formulir Mandiri Siswa & Ortu</p>
              </div>

              {/* Portal Akademik */}
              <div className="flex flex-col items-center">
                <div className="bg-blue-50 p-5 rounded-[32px] border-2 border-blue-100 shadow-sm mb-5">
                  <QRCodeSVG 
                    value={`${origin}/academic`} 
                    size={160}
                    level="H"
                  />
                </div>
                <h4 className="text-[13px] font-black text-blue-600 uppercase tracking-tight italic mb-1">Portal Akademik</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Ujian Seleksi Akademik</p>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
              <Button 
                className="bg-slate-900 hover:bg-black text-white font-black italic h-12 px-10 rounded-xl shadow-xl transition-all"
                onClick={() => setShowQR(false)}
              >
                Selesai
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <header className="h-[60px] bg-white border-b border-[#E2E8F0] sticky top-0 z-40 flex items-center justify-between px-7 shrink-0">
      {/* LEFT: Breadcrumb / Page title */}
      <div>
        <h1 className="text-[16px] font-semibold text-[#0F172A] m-0">
          {getPageTitle()}
        </h1>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        {/* Status pill */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#FFFBEB] border border-[#FEF3C7] rounded-full">
          <div className="h-[7px] w-[7px] rounded-full bg-gold status-dot" />
          <span className="text-[12px] font-medium text-[#92400E]">
            Sistem Aktif
          </span>
        </div>

        {/* QR Portal Utama */}
        <button 
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg shadow-slate-900/20"
        >
          <QrCode size={16} />
          <span className="text-[11px] font-bold uppercase tracking-tight">QR Portal</span>
        </button>

        {/* Bell with Notification Center */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications)
              setHasNew(false)
            }}
            className={cn(
              "w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-50 transition-all relative",
              showNotifications && "bg-slate-50 border-slate-300 text-slate-900"
            )}
          >
            <Bell size={18} />
            {hasNew && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-[320px] bg-white border border-slate-100 rounded-[28px] shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic">Aktivitas Terkini</span>
                <Badge variant="muted" className="text-[9px] font-black bg-white border-slate-200">{notifications.length}</Badge>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-[12px] text-slate-400 font-medium">Belum ada aktivitas baru</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-3 items-start group cursor-default">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        notif.type === 'note' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {notif.type === 'note' ? <UserCheck size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors">{notif.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{notif.description}</div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                          <Clock size={8} /> {new Date(notif.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#E2E8F0]" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right flex flex-col items-end">
            <div className="text-[13px] font-bold text-[#0F172A] leading-tight">
              {name.replace('SMPI ', '').replace('SD ', '')}
            </div>
            <div className="text-[11px] font-medium bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full mt-1">
              {role.includes("admin") ? "Administrator" : "Pewawancara"}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#ECFDF5] text-[#065F46] flex items-center justify-center text-[14px] font-bold border-2 border-[#A7F3D0]">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut size={16} />
        </button>
      </div>

    </header>
  )
}
