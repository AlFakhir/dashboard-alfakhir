import { prisma } from "@/lib/prisma"
import FormPortalClient from "./form-portal-client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function FormPortalPage() {
  const session = await auth()
  if (!session) {
    redirect("/login?callbackUrl=/form")
  }

  const candidates = await prisma.candidate.findMany({
    where: {
      status: "PENDING"
    },
    select: {
      id: true,
      name: true,
      level: true,
      room: true
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <FormPortalClient candidates={candidates} />
      </div>
    </div>
  )
}
