import { describe, expect, it } from 'vitest'

import type { Entry, EntryType, Plan } from '@/data/types'
import { computeStats, weekTarget } from './streak'

const plan: Plan = {
  name: 'test',
  isExample: true,
  sessions: [],
  phases: [
    { label: 'uno', weeks: 2, sessionsPerWeek: 2, rotation: ['a', 'b'] },
    { label: 'due', weeks: 2, sessionsPerWeek: 3, rotation: ['a', 'b', 'c'] },
  ],
}

// 2026-10-26 è un lunedì
const START = '2026-10-26'

let clock = 0
function entry(type: EntryType, date: string, sessionId?: string): Entry {
  clock += 1
  return { id: String(clock), type, date, createdAt: clock, sessionId }
}

describe('weekTarget', () => {
  it('usa le sessioni della fase', () => {
    expect(weekTarget(plan, START, '2026-10-26')).toBe(2)
    expect(weekTarget(plan, START, '2026-11-09')).toBe(3)
    // dopo l'ultima fase resta l'ultima
    expect(weekTarget(plan, START, '2027-03-01')).toBe(3)
  })

  it('riduce la prima settimana se si parte a metà', () => {
    // sabato: restano 2 giorni su 7
    expect(weekTarget(plan, '2026-10-31', '2026-10-26')).toBe(1)
  })
})

describe('computeStats', () => {
  it('conta gli allenamenti, non i giorni', () => {
    const entries = [entry('workout', '2026-10-27', 'a'), entry('workout', '2026-10-29', 'b')]
    const stats = computeStats(entries, plan, START, '2026-10-30')
    expect(stats.streak).toBe(2)
    expect(stats.week.done).toBe(2)
    expect(stats.week.complete).toBe(true)
  })

  it('conta al massimo un allenamento al giorno', () => {
    const entries = [entry('workout', '2026-10-27', 'a'), entry('ride', '2026-10-27')]
    const stats = computeStats(entries, plan, START, '2026-10-27')
    expect(stats.streak).toBe(1)
    expect(stats.week.done).toBe(1)
  })

  it('azzera la streak se la settimana finisce sotto obiettivo', () => {
    const entries = [
      entry('workout', '2026-10-27', 'a'),
      entry('workout', '2026-10-29', 'b'),
      entry('workout', '2026-11-03', 'a'),
    ]
    // settimana del 2 novembre: 1 su 2, si chiude domenica 8
    expect(computeStats(entries, plan, START, '2026-11-08').streak).toBe(3)
    expect(computeStats(entries, plan, START, '2026-11-09').streak).toBe(0)
    expect(computeStats(entries, plan, START, '2026-11-09').best).toBe(3)
  })

  it('il freeze copre un allenamento mancante', () => {
    const entries = [
      entry('workout', '2026-10-27', 'a'),
      entry('workout', '2026-10-29', 'b'),
      entry('workout', '2026-11-03', 'a'),
      entry('freeze', '2026-11-05'),
    ]
    const stats = computeStats(entries, plan, START, '2026-11-09')
    expect(stats.streak).toBe(3)
  })

  it('"non mi va" azzera subito', () => {
    const entries = [
      entry('workout', '2026-10-27', 'a'),
      entry('workout', '2026-10-29', 'b'),
      entry('skip', '2026-11-03'),
    ]
    const stats = computeStats(entries, plan, START, '2026-11-03')
    expect(stats.streak).toBe(0)
    expect(stats.best).toBe(2)
    expect(stats.skippedToday).toBe(true)
  })

  it('dopo un salto la streak riparte', () => {
    const entries = [
      entry('workout', '2026-10-27', 'a'),
      entry('skip', '2026-10-28'),
      entry('workout', '2026-10-29', 'b'),
    ]
    expect(computeStats(entries, plan, START, '2026-10-29').streak).toBe(1)
  })

  it('calcola quanti allenamenti mancano e i giorni rimasti', () => {
    const entries = [entry('workout', '2026-11-10', 'a')]
    // martedì 10 novembre, fase due (3 a settimana), allenato oggi
    const stats = computeStats(entries, plan, START, '2026-11-10')
    expect(stats.week.target).toBe(3)
    expect(stats.week.needed).toBe(2)
    expect(stats.week.daysLeft).toBe(5)
    expect(stats.activeToday).toBe(true)
  })

  it('un giro registrato prima dell\'inizio conta ma non sposta le settimane', () => {
    // inizio lunedì 26, giro domenica 25
    const entries = [entry('ride', '2026-10-25'), entry('workout', '2026-10-26', 'a')]
    const stats = computeStats(entries, plan, START, '2026-10-26')
    expect(stats.phase.weekNumber).toBe(1)
    expect(stats.streak).toBe(2)
    expect(stats.week.target).toBe(2)
  })

  it('alterna le sessioni della fase', () => {
    expect(computeStats([], plan, START, '2026-10-26').nextSessionId).toBe('a')
    const entries = [entry('workout', '2026-10-27', 'a')]
    expect(computeStats(entries, plan, START, '2026-10-28').nextSessionId).toBe('b')
    // nella fase due si riparte dalla prima sessione
    expect(computeStats(entries, plan, START, '2026-11-09').nextSessionId).toBe('a')
    expect(computeStats(entries, plan, START, '2026-11-09').phase.index).toBe(1)
  })
})
