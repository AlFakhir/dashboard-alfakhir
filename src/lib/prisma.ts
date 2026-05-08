import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  
  // Hanya gunakan adapter Neon jika URL ada dan mengarah ke Neon
  if (connectionString && connectionString.includes("neon.tech")) {
    try {
      const pool = new Pool({ connectionString })
      const adapter = new PrismaNeon(pool as any)
      return new PrismaClient({
        adapter: adapter as any,
        log: ["error"],
      })
    } catch (e) {
      console.error("Prisma Neon Adapter error, falling back to standard:", e)
    }
  }

  // Fallback ke client standar jika bukan Neon atau gagal inisialisasi
  return new PrismaClient({
    log: ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
