"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LogForm() {
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(amount)
    if (isNaN(n) || n === 0) { setMsg("Zadej nenulové celé číslo."); setStatus("error"); return }
    setStatus("loading")
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: n }),
    })
    if (res.ok) {
      setStatus("ok")
      setAmount("")
      setMsg(`+${n} kliků zaznamenáno!`)
      router.refresh()
    } else {
      const data = await res.json()
      setStatus("error")
      setMsg(data.error ?? "Chyba při ukládání.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Zalogovat kliky (záporné číslo = korekce)
      </label>
      <div className="flex gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="např. 30"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Uložit"}
        </button>
      </div>
      {msg && (
        <p className={`mt-2 text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
          {msg}
        </p>
      )}
    </form>
  )
}
