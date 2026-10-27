import { describe, expect, it } from 'vitest'

import { computeStats } from '@/lib/streak'
import { buildDemo } from './demo'
import { PLAN } from './plan'
import type { Entry } from './types'

describe('buildDemo', () => {
  // martedì 27 ottobre 2026
  const today = '2026-10-27'

  it('simula circa 3 mesi fino a ieri', () => {
    const { startDate, entries } = buildDemo(today, [])
    expect(startDate).toBe('2026-07-27')
    expect(entries.every((e) => e.date < today && e.demo)).toBe(true)
    expect(entries.some((e) => e.type === 'ride')).toBe(true)
    expect(entries.some((e) => e.type === 'freeze')).toBe(true)
    expect(entries.some((e) => e.type === 'skip')).toBe(true)
  })

  it('racconta una streak lunga dopo qualche caduta', () => {
    const { startDate, entries } = buildDemo(today, [])
    const stats = computeStats(entries, PLAN, startDate, today)
    expect(stats.streak).toBe(19)
    expect(stats.best).toBe(19)
    expect(stats.phase.weekNumber).toBe(14)
    expect(stats.activeToday).toBe(false)
  })

  it('non tocca i giorni con registrazioni vere', () => {
    const real: Entry = { id: 'vero', type: 'workout', date: '2026-10-26', createdAt: 1, sessionId: 'a' }
    const { entries } = buildDemo(today, [real])
    expect(entries.some((e) => e.date === '2026-10-26')).toBe(false)
  })
})
