"use client"

import { useEffect, useState } from "react"

type Entry = {
  id: string
  name: string | null
  image: string | null
  strikes: number
  eliminated: boolean
  todayTotal: number
  totalPushups: number
  daysActive: number
  todayTarget: number
  inAdaptation: boolean
}

export default function LeaderboardTable() {
  const [data, setData] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <p className="text-gray-400 text-sm">Načítám žebříček…</p>
  if (!data.length) return <p className="text-gray-400 text-sm">Zatím se nikdo nepřihlásil.</p>

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Jméno</th>
            <th className="text-right px-4 py-3">Dnes</th>
            <th className="text-right px-4 py-3">Celkem</th>
            <th className="text-right px-4 py-3">Dny</th>
            <th className="text-center px-4 py-3">Striky</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr
              key={entry.id}
              className={`border-b border-gray-50 last:border-0 ${entry.eliminated ? "opacity-40" : ""}`}
            >
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {entry.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.image} alt="" width={24} height={24} className="rounded-full" />
                  )}
                  <span className={entry.eliminated ? "line-through text-gray-400" : "font-medium text-gray-900"}>
                    {entry.name ?? "Anonym"}
                  </span>
                  {entry.eliminated && <span className="text-xs text-red-400 ml-1">OUT</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className={entry.todayTotal >= entry.todayTarget ? "text-green-600 font-semibold" : "text-gray-700"}>
                  {entry.todayTotal}
                </span>
                <span className="text-gray-300"> / {entry.todayTarget}</span>
              </td>
              <td className="px-4 py-3 text-right text-gray-700">{entry.totalPushups}</td>
              <td className="px-4 py-3 text-right text-gray-700">{entry.daysActive}</td>
              <td className="px-4 py-3 text-center">
                {Array.from({ length: 2 }).map((_, si) => (
                  <span key={si} className={si < entry.strikes ? "text-red-500" : "text-gray-200"}>●</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
