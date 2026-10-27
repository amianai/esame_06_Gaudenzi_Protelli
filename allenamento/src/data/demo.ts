import { addDays, mondayOf } from '@/lib/dates'
import { phaseForWeek } from '@/lib/streak'
import { PLAN } from './plan'
import type { BodyZone, Entry, Feeling } from './types'

/*
 * Dati di esempio: circa 3 mesi simulati di uso dell'app da parte di un principiante.
 * Servono a vedere come appaiono streak, storico e giri in moto dopo un po' di tempo.
 * La storia: inizio faticoso, un freeze per un imprevisto, un salto per pigrizia,
 * una settimana persa, poi una streak lunga. In moto gli avambracci reggono sempre di più.
 */

type DemoEvent =
  | { day: number; type: 'workout' | 'mini'; feeling: Feeling; note?: string }
  | {
      day: number
      type: 'ride'
      minutes: number
      fatigue: Partial<Record<BodyZone, number>>
      pumpAfterMin?: number
      note?: string
    }
  | { day: number; type: 'freeze' | 'skip'; note?: string }

// Una riga per settimana; `day`: 0 = lunedì … 6 = domenica. L'ultima è la settimana corrente.
const WEEKS: DemoEvent[][] = [
  [
    { day: 1, type: 'workout', feeling: 'duro', note: 'Prima volta: 10 flessioni e già stanco' },
    { day: 3, type: 'workout', feeling: 'duro' },
    {
      day: 6,
      type: 'ride',
      minutes: 45,
      fatigue: { avambracci: 9, braccia: 7, spalle: 6, schiena: 7, gambe: 5 },
      pumpAfterMin: 10,
      note: 'Primo giro nei campi, avambracci di pietra',
    },
  ],
  [
    { day: 1, type: 'workout', feeling: 'troppo', note: 'Il circuito gambe mi ha distrutto' },
    { day: 4, type: 'workout', feeling: 'duro' },
    { day: 5, type: 'ride', minutes: 60, fatigue: { avambracci: 8, braccia: 7, spalle: 5, schiena: 6, gambe: 5 }, pumpAfterMin: 12 },
  ],
  [
    { day: 0, type: 'workout', feeling: 'duro' },
    { day: 2, type: 'mini', feeling: 'giusto', note: 'Poco tempo, ho fatto la mini' },
    { day: 4, type: 'workout', feeling: 'duro' },
    { day: 6, type: 'ride', minutes: 60, fatigue: { avambracci: 8, braccia: 6, spalle: 5, schiena: 6, gambe: 4 }, pumpAfterMin: 14 },
  ],
  [
    { day: 1, type: 'workout', feeling: 'giusto' },
    { day: 3, type: 'freeze', note: "Ho accompagnato i miei all'aeroporto" },
    { day: 5, type: 'workout', feeling: 'duro' },
  ],
  [
    { day: 0, type: 'workout', feeling: 'giusto' },
    { day: 2, type: 'skip' },
    { day: 3, type: 'workout', feeling: 'giusto', note: 'Ieri ho saltato, oggi ho recuperato' },
    { day: 5, type: 'workout', feeling: 'duro' },
    { day: 6, type: 'ride', minutes: 90, fatigue: { avambracci: 7, braccia: 6, spalle: 5, schiena: 5, gambe: 5 }, pumpAfterMin: 18 },
  ],
  [
    { day: 1, type: 'workout', feeling: 'giusto' },
    { day: 3, type: 'workout', feeling: 'giusto' },
    { day: 5, type: 'workout', feeling: 'duro' },
  ],
  [
    { day: 0, type: 'workout', feeling: 'giusto' },
    { day: 2, type: 'workout', feeling: 'giusto' },
    {
      day: 6,
      type: 'ride',
      minutes: 120,
      fatigue: { avambracci: 7, braccia: 5, spalle: 5, schiena: 6, gambe: 6 },
      pumpAfterMin: 20,
      note: 'Giro lungo in collina',
    },
  ],
  [{ day: 1, type: 'workout', feeling: 'giusto', note: 'Settimana piena di impegni, solo questo' }],
  [
    { day: 0, type: 'mini', feeling: 'giusto', note: 'Si riparte' },
    { day: 2, type: 'workout', feeling: 'duro' },
    { day: 4, type: 'workout', feeling: 'giusto' },
    { day: 6, type: 'ride', minutes: 60, fatigue: { avambracci: 6, braccia: 5, spalle: 4, schiena: 5, gambe: 4 }, pumpAfterMin: 22 },
  ],
  [
    { day: 1, type: 'workout', feeling: 'giusto' },
    { day: 3, type: 'workout', feeling: 'giusto' },
    { day: 5, type: 'ride', minutes: 90, fatigue: { avambracci: 5, braccia: 4, spalle: 4, schiena: 4, gambe: 4 }, pumpAfterMin: 25 },
  ],
  [
    { day: 0, type: 'workout', feeling: 'giusto' },
    { day: 2, type: 'workout', feeling: 'facile' },
    { day: 4, type: 'workout', feeling: 'giusto' },
    {
      day: 6,
      type: 'ride',
      minutes: 120,
      fatigue: { avambracci: 5, braccia: 4, spalle: 4, schiena: 5, gambe: 5 },
      pumpAfterMin: 28,
      note: 'Sassi e salita, avambracci ok fino a metà giro',
    },
  ],
  [
    { day: 1, type: 'workout', feeling: 'facile', note: "15 flessioni di fila, all'inizio erano 10" },
    { day: 3, type: 'workout', feeling: 'giusto' },
    { day: 5, type: 'ride', minutes: 90, fatigue: { avambracci: 4, braccia: 3, spalle: 3, schiena: 4, gambe: 4 }, pumpAfterMin: 30 },
  ],
  [
    { day: 0, type: 'workout', feeling: 'giusto' },
    { day: 2, type: 'mini', feeling: 'facile' },
    { day: 4, type: 'workout', feeling: 'giusto' },
    { day: 6, type: 'ride', minutes: 75, fatigue: { avambracci: 4, braccia: 3, spalle: 3, schiena: 3, gambe: 4 }, pumpAfterMin: 32 },
  ],
  [{ day: 0, type: 'workout', feeling: 'giusto' }],
]

/** Generatore pseudo-casuale con seme fisso: i dati di esempio sono sempre gli stessi. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function localTime(date: string, hours: number, minutes: number): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, hours, minutes).getTime()
}

/**
 * Crea le registrazioni di esempio fino a ieri, con l'ultima settimana che coincide con quella corrente.
 * Salta i giorni in cui ci sono già registrazioni vere.
 */
export function buildDemo(today: string, existing: Entry[]): { startDate: string; entries: Entry[] } {
  const startDate = addDays(mondayOf(today), -(WEEKS.length - 1) * 7)
  const taken = new Set(existing.map((e) => e.date))
  const random = seeded(42)
  const entries: Entry[] = []
  let phaseIndex = -1
  let sessionsInPhase = 0

  WEEKS.forEach((events, week) => {
    const { index, phase } = phaseForWeek(PLAN, week)
    if (index !== phaseIndex) {
      phaseIndex = index
      sessionsInPhase = 0
    }

    for (const event of events) {
      const date = addDays(startDate, week * 7 + event.day)
      if (date >= today || taken.has(date)) continue

      const createdAt = localTime(date, 18 + Math.floor(random() * 3), Math.floor(random() * 60))
      const base = { id: `demo-${date}-${event.type}`, date, createdAt, demo: true, note: event.note }

      if (event.type === 'workout' || event.type === 'mini') {
        const sessionId = phase.rotation[sessionsInPhase % phase.rotation.length]
        sessionsInPhase++
        const minutes = event.type === 'mini' ? 8 + random() * 3 : 17 + random() * 9
        entries.push({
          ...base,
          type: event.type,
          sessionId,
          durationSec: Math.round(minutes * 60),
          feeling: event.feeling,
        })
      } else if (event.type === 'ride') {
        entries.push({
          ...base,
          type: 'ride',
          ride: { minutes: event.minutes, fatigue: event.fatigue, pumpAfterMin: event.pumpAfterMin },
        })
      } else {
        entries.push({ ...base, type: event.type })
      }
    }
  })

  return { startDate, entries }
}
