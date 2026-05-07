"use client"

import { usePathname } from "next/navigation"
import { GraduationCap } from "lucide-react"

export function BrandLogo({ role }: { role: string }) {
  const pathname = usePathname()
  
  const currentPath = pathname.toLowerCase()
  const currentRole = role?.toLowerCase() || ""

  const isSD = currentPath.includes("sd") || currentRole.includes("sd")
  const isSMP = currentPath.includes("smp") || currentRole.includes("smp")

  if (isSMP) {
    return (
      <>
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
          <img src="/emblem-smp.png" alt="Emblem SMP" className="w-full h-full object-contain p-1.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-black tracking-tight leading-none uppercase text-white">AL FAKHIR</span>
        </div>
      </>
    )
  }

  if (isSD) {
    return (
      <>
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
          <img src="/emblem-sd.png" alt="Emblem SD" className="w-full h-full object-contain p-1.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-black tracking-tight leading-none uppercase text-white">AL FAKHIR</span>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/20">
        <GraduationCap className="h-6 w-6 text-slate-900" />
      </div>
      <div className="flex flex-col">
        <span className="text-[14px] font-black tracking-tight leading-none uppercase text-white">AL FAKHIR</span>
      </div>
    </>
  )
}
