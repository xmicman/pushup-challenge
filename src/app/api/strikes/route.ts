import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CHALLENGE_START, isAdaptationPeriod, MAX_STRIKES } from "@/lib/challenge"

// Called by a cron job at 00:05 each day to process previous day's strikes
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  if (new Date(yesterdayKey) < CHALLENGE_START) {
    return NextResponse.json({ skipped: "before challenge start" })
  }

  if (isAdaptationPeriod(yesterday)) {
    return NextResponse.json({ skipped: "adaptation period" })
  }

  const activeUsers = await prisma.user.findMany({
    where: { eliminated: false },
    include: {
      logs: {
        where: {
          createdAt: {
            gte: new Date(`${yesterdayKey}T00:00:00.000Z`),
            lt: new Date(`${yesterdayKey}T23:59:59.999Z`),
          },
        },
      },
    },
  })

  const eliminated: string[] = []
  const striked: string[] = []

  for (const user of activeUsers) {
    const total = user.logs.reduce((s, l) => s + l.amount, 0)
    if (total <= 0) {
      const newStrikes = user.strikes + 1
      if (newStrikes >= MAX_STRIKES) {
        await prisma.user.update({
          where: { id: user.id },
          data: { strikes: newStrikes, eliminated: true, eliminatedAt: new Date() },
        })
        eliminated.push(user.id)
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { strikes: newStrikes },
        })
        striked.push(user.id)
      }
    }
  }

  return NextResponse.json({ date: yesterdayKey, eliminated, striked })
}
