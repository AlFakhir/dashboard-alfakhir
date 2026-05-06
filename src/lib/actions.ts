"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Level } from "@prisma/client"

export async function addCandidate(data: { name: string; level: string; room?: string; selectedInterviewer?: string }) {
  try {
    await prisma.candidate.create({
      data: {
        name: data.name,
        level: data.level as Level,
        room: data.room || null,
        selectedInterviewer: data.selectedInterviewer || null,
        status: "PENDING",
      },
    })
    revalidatePath("/admin/candidates")
    revalidatePath("/admin/admin")
    return { success: true }
  } catch (error) {
    console.error("Failed to add candidate:", error)
    return { success: false, error: "Gagal menambahkan kandidat" }
  }
}

export async function deleteCandidate(id: string) {
  try {
    await prisma.candidate.delete({ where: { id } })
    revalidatePath("/admin/candidates")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menghapus kandidat" }
  }
}

export async function syncQuestions(questions: any[]) {
  try {
    // This is handled by the API route currently, but we could do it here too
    // For now, let's just make it a revalidation trigger
    revalidatePath("/admin/questions")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}


export async function updateCandidateInterviewer(id: string, interviewer: string) {
  try {
    await prisma.candidate.update({
      where: { id },
      data: { selectedInterviewer: interviewer },
    })
    revalidatePath("/admin/candidates")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
export async function updateCandidateRoom(id: string, room: string) {
  try {
    await prisma.candidate.update({
      where: { id },
      data: { room: room || null },
    })
    revalidatePath("/admin/candidates")
    revalidatePath("/admin/admin")
    return { success: true }
  } catch (error) {
    console.error("Failed to update candidate room:", error)
    return { success: false, error: "Gagal memperbarui ruangan" }
  }
}
export async function addQuestion(data: { text: string; category: string; level: Level; order: number; type: string; options?: string[] }) {
  try {
    await prisma.formQuestion.create({ 
      data: {
        text: data.text,
        category: data.category,
        level: data.level,
        order: data.order,
        type: data.type,
        options: data.options ? JSON.stringify(data.options) : null
      } 
    })
    revalidatePath("/admin/questions")
    return { success: true }
  } catch (error) {
    console.error("Add question error:", error)
    return { success: false }
  }
}

export async function updateQuestion(id: string, data: { text?: string; category?: string; order?: number; type?: string; options?: string[] }) {
  try {
    await prisma.formQuestion.update({ 
      where: { id }, 
      data: {
        ...data,
        options: data.options ? JSON.stringify(data.options) : undefined
      } 
    })
    revalidatePath("/admin/questions")
    return { success: true }
  } catch (error) {
    console.error("Update question error:", error)
    return { success: false }
  }
}

export async function deleteQuestion(id: string) {
  try {
    await prisma.formQuestion.delete({ where: { id } })
    revalidatePath("/admin/questions")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function updateCandidate(id: string, data: { name?: string; level?: Level }) {
  try {
    await prisma.candidate.update({ where: { id }, data })
    revalidatePath("/admin/candidates")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function updateCandidateStatus(id: string, status: any) {
  try {
    await prisma.candidate.update({
      where: { id },
      data: { status },
    })
    revalidatePath("/admin/candidates")
    revalidatePath("/admin/admin")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
