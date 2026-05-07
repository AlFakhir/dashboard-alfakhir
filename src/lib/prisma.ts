import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Kita kembalikan ke driver standar untuk stabilitas build dan Vercel
  // Jika lokal Anda memblokir port 5432, npx prisma / npm run dev mungkin akan error saat FETCH data,
  // tapi aplikasi tidak akan lagi CRASH (bind error) saat dijalankan.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
