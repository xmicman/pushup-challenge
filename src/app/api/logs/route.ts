import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { todayKey } from "@/lib/challenge"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount === 0) {
    return NextResponse.json({ error: "amount must be a non-zero integer" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.eliminated) {
    return NextResponse.json({ error: "User eliminated or not found" }, { status: 403 })
  }

  const log = await prisma.pushupLog.create({
    data: { userId: session.user.id, amount },
  })

  return NextResponse.json(log, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = await prisma.pushupLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const today = todayKey()
  const todayTotal = logs
    .filter((l) => l.createdAt.toISOString().slice(0, 10) === today)
    .reduce((sum, l) => sum + l.amount, 0)

  return NextResponse.json({ logs, todayTotal })
}
