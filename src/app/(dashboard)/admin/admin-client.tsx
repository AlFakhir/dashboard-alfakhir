"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import Link from "next/link"
import {
  UserPlus,
  History,
  CheckCircle2,
  Clock,
  MoreVertical,
  LayoutGrid,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate, getAcademicYear } from "@/lib/utils"

interface Props {
  stats: {
    total: number
    pending: number
    received: number
    reviewed: number
    completed: number
    notesTotal: number
    recentObservations: any[]
    chartData: any[]
    monthlyTarget: number
    progressPercentage: number
    statusItems: any[]
  }
}

function StatCard({ icon: Icon, color, value, label }: any) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="flex flex-col items-end flex-1">
        <div className="text-[36px] font-bold text-[#0F172A] leading-none mb-1.5 tabular-nums tracking-tighter">
          {value}
        </div>
        <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest text-right">
          {label}
        </div>
      </div>
    </div>
  )
}

export default function AdminOverviewClient({ stats: initialStats, role = "admin" }: Props & { role?: string }) {
  const [stats, setStats] = useState(initialStats)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const level = role === "admin_sd" ? "SD" : role === "admin_smp" ? "SMP" : ""
        const res = await fetch(`/api/admin/stats${level ? `?level=${level}` : ""}`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        // Silent error for polling
      }
    }

    const interval = setInterval(fetchStats, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [role])

  const getTitle = () => {
    if (role === "admin_sd") return "Dashboard Unit SD"
    if (role === "admin_smp") return "Dashboard Unit SMP"
    return "Ringkasan Pusat"
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-black text-[#0F172A] m-0 tracking-tight italic uppercase">
            {getTitle()}
          </h2>
          <p className="text-[14px] text-[#64748B] m-0 mt-1.5 font-bold tracking-widest uppercase opacity-70">
            Al Fakhir Modern Islamic School • TA {getAcademicYear()} • Monitoring Progres
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[12px] font-black text-[#0F172A] tracking-widest uppercase">SISTEM AKTIF</span>
        </div>
      </div>

      {/* STAT CARDS - Refined proportions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={UserPlus} 
          color="bg-[#E0F2F1] text-[#26A69A]" 
          value={stats.total} 
          label="KANDIDAT BARU" 
        />
        <StatCard 
          icon={History} 
          color="bg-[#E3F2FD] text-[#42A5F5]" 
          value={stats.notesTotal} 
          label="SELESAI OBSERVASI" 
        />
        <StatCard 
          icon={CheckCircle2} 
          color="bg-[#E8F5E9] text-[#66BB6A]" 
          value={stats.completed} 
          label="DITERIMA" 
        />
        <StatCard 
          icon={Clock} 
          color="bg-[#FFEBEE] text-[#EF5350]" 
          value={stats.pending} 
          label="TERTUNDA" 
        />
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Bar Chart Card */}
        <div className="lg:col-span-9 bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[18px] font-bold text-[#0F172A]">Bar Chart Kandidat Baru & Selesai</h3>
            <div className="flex gap-6 text-[13px] font-bold">
              <div className="flex items-center gap-2 text-[#26A69A]">
                <div className="w-8 h-2.5 rounded bg-[#26A69A]" /> Baru
              </div>
              <div className="flex items-center gap-2 text-[#42A5F5]">
                <div className="w-8 h-2.5 rounded bg-[#42A5F5]" /> Selesai
              </div>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={[0, 15]}
                  ticks={[0, 5, 10, 15]}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Bar dataKey="baru" fill="#26A69A" barSize={22} radius={[3, 3, 0, 0]} />
                <Bar dataKey="selesai" fill="#42A5F5" barSize={22} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Target Card Card */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 shadow-sm">
            <h3 className="text-[12px] font-extrabold text-[#475569] uppercase tracking-widest mb-6">
              TARGET OBSERVASI BULAN INI
            </h3>
            <div className="text-[56px] font-black text-[#0F172A] leading-none mb-2 tracking-tighter">
              {stats.monthlyTarget}
            </div>
            <p className="text-[13px] text-[#94A3B8] font-medium mb-8">Target Observasi Bulan Ini</p>
            
            <div className="space-y-3">
              <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#26A69A] rounded-full shadow-sm transition-all duration-1000" 
                  style={{ width: `${stats.progressPercentage}%` }} 
                />
              </div>
              <div className="flex justify-between text-[12px] font-bold text-[#64748B]">
                <span className="tracking-widest">PROGRES</span>
                <span>{stats.progressPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-[15px] font-bold text-[#0F172A]">Status Ringkasan</h3>
            </div>
            <div className="space-y-5">
              {stats.statusItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color} ring-4 ${item.color.replace('bg-', 'ring-')}/10`} />
                  <div className="text-[13px] font-bold text-[#475569] group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Recent Observations */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[18px] font-bold text-[#0F172A]">Observasi Terkini</h3>
            <p className="text-[13px] text-[#94A3B8] mt-1 font-medium">Data input catatan terbaru dari tim pewawancara</p>
          </div>
          <button className="h-10 w-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all border border-[#E2E8F0]">
            <MoreVertical size={18} className="text-[#94A3B8]" />
          </button>
        </div>
        <div className="space-y-3">
          {stats.recentObservations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
              Belum ada data observasi masuk
            </div>
          ) : (
            stats.recentObservations.map((obs) => (
              <Link 
                key={obs.id} 
                href={`/admin/candidates/${obs.candidateId}`}
                className="flex items-center justify-between p-4 border border-[#F1F5F9] rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[14px] text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all shrink-0 italic">
                    {obs.candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-bold text-[#0F172A] truncate uppercase tracking-tight">{obs.candidate.name}</div>
                      <Badge variant="muted" className="text-[9px] font-black uppercase tracking-tighter px-1.5 h-4 border-slate-200 text-slate-400 bg-white">
                        UNIT {obs.candidate.level}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5">
                      <div className="text-[11px] text-[#475569] font-black uppercase tracking-tight flex items-center gap-1.5">
                        <span className="opacity-50">PEWAWANCARA:</span>
                        <span className="text-emerald-600 font-extrabold">{obs.interviewerName}</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                      <div className="text-[11px] text-[#475569] font-black uppercase tracking-tight flex items-center gap-1.5">
                        <span className="opacity-50">RUANGAN:</span>
                        <span className="text-blue-600 font-extrabold">{obs.candidate.room || "-"}</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                      <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">
                        {formatDate(obs.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={obs.recommendation === "Terima" ? "success" : obs.recommendation === "Tolak" ? "danger" : "warning"} 
                    className="px-3 py-1 font-black text-[9px] uppercase tracking-widest"
                  >
                    {obs.recommendation}
                  </Badge>
                  <div className="h-8 w-8 flex items-center justify-center hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 text-slate-300 hover:text-slate-600">
                    <MoreVertical size={14} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      {/* Footer Branding */}
      <div className="mt-12 mb-6 text-center space-y-2 opacity-50">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">Al Fakhir Modern Islamic School</p>
        <p className="text-[10px] text-slate-400 font-medium">Developer by Feri</p>
      </div>
    </div>
  )
}
