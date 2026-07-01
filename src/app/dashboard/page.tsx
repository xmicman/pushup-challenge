import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getDailyTarget, getDayNumber, todayKey } from "@/lib/challenge"
import LogForm from "@/components/LogForm"
import AuditLog from "@/components/AuditLog"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { logs: { orderBy: { createdAt: "desc" }, take: 50 } },
  })
  if (!user) redirect("/login")

  const today = new Date()
  const todayStr = todayKey()
  const dayNum = getDayNumber(today)
  const target = getDailyTarget(today)

  const todayTotal = user.logs
    .filter((l) => l.createdAt.toISOString().slice(0, 10) === todayStr)
    .reduce((s, l) => s + l.amount, 0)

  const done = todayTotal >= target

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tvůj dashboard</h1>
        <p className="text-gray-500">Den {dayNum} — cíl: {target} kliků</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Dnes" value={todayTotal} sub={`/ ${target}`} highlight={done} />
        <Stat label="Striky" value={`${user.strikes} / 2`} highlight={user.strikes > 0} />
        <Stat label="Stav" value={user.eliminated ? "OUT" : "Aktivní"} highlight={user.eliminated} />
      </div>

      {!user.eliminated && <LogForm />}

      <AuditLog logs={user.logs.map((l) => ({
        id: l.id,
        amount: l.amount,
        createdAt: l.createdAt.toISOString(),
      }))} />
    </div>
  )
}

function Stat({ label, value, sub, highlight }: {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-red-500" : "text-gray-900"}`}>
        {value}
        {sub && <span className="text-sm font-normal text-gray-400 ml-1">{sub}</span>}
      </p>
    </div>
  )
}
