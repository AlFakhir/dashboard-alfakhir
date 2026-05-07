import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || ""
  const isLocalNeon = process.env.NODE_ENV === "development" && connectionString.includes("neon.tech")

  // JIKA DI LOKAL (KALI LINUX)
  if (isLocalNeon) {
    neonConfig.webSocketConstructor = ws
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool as any)
    
    return new PrismaClient({
      adapter: adapter as any,
      log: ["error", "warn"],
    })
  }

  // JIKA DI VERCEL / PRODUKSI (Gunakan driver standar)
  return new PrismaClient({
    log: ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
