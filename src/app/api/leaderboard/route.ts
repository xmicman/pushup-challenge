import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDailyTarget, isAdaptationPeriod, todayKey } from "@/lib/challenge"

export async function GET() {
  const users = await prisma.user.findMany({
    include: { logs: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  })

  const leaderboard = users.map((user) => {
    const logsByDay: Record<string, number> = {}
    for (const log of user.logs) {
      const day = log.createdAt.toISOString().slice(0, 10)
      logsByDay[day] = (logsByDay[day] ?? 0) + log.amount
    }

    const today = todayKey()
    const todayTotal = logsByDay[today] ?? 0
    const totalPushups = Object.values(logsByDay).reduce((s, v) => s + v, 0)

    const daysActive = Object.entries(logsByDay).filter(
      ([day, total]) => total > 0 && day <= today
    ).length

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      strikes: user.strikes,
      eliminated: user.eliminated,
      eliminatedAt: user.eliminatedAt,
      joinedAt: user.createdAt,
      todayTotal,
      totalPushups,
      daysActive,
      todayTarget: getDailyTarget(new Date()),
      inAdaptation: isAdaptationPeriod(new Date()),
    }
  })

  leaderboard.sort((a, b) => {
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1
    if (b.daysActive !== a.daysActive) return b.daysActive - a.daysActive
    return b.totalPushups - a.totalPushups
  })

  return NextResponse.json(leaderboard)
}
