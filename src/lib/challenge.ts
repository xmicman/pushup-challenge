export const CHALLENGE_START = new Date("2026-07-01T00:00:00.000Z")
export const ADAPTATION_END = new Date("2026-07-07T23:59:59.999Z")
export const INITIAL_PUSHUPS = 10
export const DAILY_INCREMENT = 5
export const MAX_STRIKES = 3

export function getDayNumber(date: Date): number {
  const start = CHALLENGE_START.getTime()
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((d - start) / 86400000) + 1
}

export function getDailyTarget(date: Date): number {
  const day = getDayNumber(date)
  if (day < 1) return INITIAL_PUSHUPS
  return INITIAL_PUSHUPS + (day - 1) * DAILY_INCREMENT
}

export function isAdaptationPeriod(date: Date): boolean {
  return date <= ADAPTATION_END
}

export function getLocalDateKey(date: Date, tzOffset = 0): string {
  const local = new Date(date.getTime() + tzOffset * 60000)
  return local.toISOString().slice(0, 10)
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
