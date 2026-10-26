// Le date sono stringhe locali YYYY-MM-DD. I calcoli usano UTC per non soffrire l'ora legale.

const DAY_MS = 86_400_000

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function fromUTC(ms: number): string {
  const date = new Date(ms)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(iso: string, days: number): string {
  return fromUTC(toUTC(iso) + days * DAY_MS)
}

/** Giorni da `from` a `to` (positivo se `to` è dopo). */
export function diffDays(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS)
}

/** 0 = lunedì … 6 = domenica */
export function weekdayIndex(iso: string): number {
  return (new Date(toUTC(iso)).getUTCDay() + 6) % 7
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayIndex(iso))
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

function asLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const longFormatter = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortFormatter = new Intl.DateTimeFormat('it-IT', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const monthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' })

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatLong(iso: string): string {
  return capitalize(longFormatter.format(asLocalDate(iso)))
}

export function formatShort(iso: string): string {
  return capitalize(shortFormatter.format(asLocalDate(iso)))
}

export function formatMonth(iso: string): string {
  return capitalize(monthFormatter.format(asLocalDate(iso)))
}

export function formatDuration(totalSec: number): string {
  const min = Math.round(totalSec / 60)
  if (min < 1) return 'meno di 1 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const rest = min % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}

export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.ceil(totalSec))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : String(s)
}
