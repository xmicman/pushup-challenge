"use client"

type Log = { id: string; amount: number; createdAt: string }

export default function AuditLog({ logs }: { logs: Log[] }) {
  if (!logs.length) return null

  const byDay: Record<string, Log[]> = {}
  for (const log of logs) {
    const day = log.createdAt.slice(0, 10)
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(log)
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Audit log</h2>
      <div className="space-y-4">
        {Object.entries(byDay).map(([day, entries]) => {
          const total = entries.reduce((s, l) => s + l.amount, 0)
          return (
            <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-medium text-gray-600">{day}</span>
                <span className="text-xs font-semibold text-gray-800">Σ {total}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {entries.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2 text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className={`px-4 py-2 text-right font-medium ${log.amount < 0 ? "text-red-500" : "text-gray-700"}`}>
                        {log.amount > 0 ? "+" : ""}{log.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
