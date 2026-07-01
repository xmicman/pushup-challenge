import { getDailyTarget, getDayNumber } from "@/lib/challenge"
import LeaderboardTable from "@/components/LeaderboardTable"

export const revalidate = 60

export default function Home() {
  const today = new Date()
  const dayNum = getDayNumber(today)
  const target = getDailyTarget(today)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">💪 Pushup Challenge</h1>
        <p className="text-gray-500">
          Den <span className="font-semibold text-gray-800">{dayNum}</span> — dnešní cíl:{" "}
          <span className="font-semibold text-gray-800">{target} kliků</span>
        </p>
      </div>
      <LeaderboardTable />
    </div>
  )
}
