import type { Entry, EntryType, Phase, Plan } from '@/data/types'
import { addDays, diffDays, mondayOf, weekDays, weekdayIndex } from './dates'

/*
 * Regole della streak (decise in fase di design):
 * - la streak conta gli allenamenti fatti, non i giorni: i giorni di riposo non la rompono;
 * - ogni settimana (lun-dom) ha un obiettivo di allenamenti, preso dalla fase della scheda;
 * - a fine settimana, se allenamenti + freeze < obiettivo, la streak si azzera;
 * - 1 freeze a settimana, non si accumula, vale solo per un imprevisto;
 * - saltare perché "non mi va" azzera la streak subito;
 * - spostare un allenamento a un altro giorno della stessa settimana non è saltare.
 * Un giro in moto e la versione mini contano come allenamento. Al massimo un allenamento al giorno.
 */

const ACTIVITY_TYPES: ReadonlySet<EntryType> = new Set(['workout', 'mini', 'ride'])

export function isActivity(entry: Entry): boolean {
  return ACTIVITY_TYPES.has(entry.type)
}

export interface PhaseInfo {
  index: number
  phase: Phase
  /** Settimana dall'inizio, a partire da 1. */
  weekNumber: number
  weekInPhase: number
  phaseStartWeek: string
}

export interface WeekStatus {
  start: string
  target: number
  /** Giorni della settimana con almeno un allenamento. */
  done: number
  freezeUsed: boolean
  /** Allenamenti che mancano all'obiettivo (il freeze usato ne copre uno). */
  needed: number
  /** Giorni ancora utili per allenarsi questa settimana, oggi compreso se non ti sei ancora allenato. */
  daysLeft: number
  complete: boolean
}

export interface Stats {
  streak: number
  best: number
  activeToday: boolean
  /** Oggi è stato usato il freeze o dichiarato un salto. */
  skippedToday: boolean
  week: WeekStatus
  phase: PhaseInfo
  nextSessionId: string
}

export function phaseForWeek(plan: Plan, weekIndex: number) {
  let firstWeek = 0
  for (let index = 0; index < plan.phases.length; index++) {
    const phase = plan.phases[index]
    if (weekIndex < firstWeek + phase.weeks || index === plan.phases.length - 1) {
      return { index, phase, firstWeek }
    }
    firstWeek += phase.weeks
  }
  throw new Error('La scheda non ha fasi')
}

/**
 * Obiettivo della settimana. La fase si conta da `planStart`; la prima settimana in cui
 * c'è qualcosa (`firstDay`) è in proporzione ai giorni rimasti.
 */
export function weekTarget(
  plan: Plan,
  planStart: string,
  weekStart: string,
  firstDay: string = planStart,
): number {
  const weekIndex = diffDays(mondayOf(planStart), weekStart) / 7
  const base = phaseForWeek(plan, Math.max(0, weekIndex)).phase.sessionsPerWeek
  if (weekStart === mondayOf(firstDay)) {
    const available = 7 - weekdayIndex(firstDay)
    return Math.ceil((base * available) / 7)
  }
  return base
}

function groupByDate(entries: Entry[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>()
  for (const entry of [...entries].sort((a, b) => a.createdAt - b.createdAt)) {
    const list = map.get(entry.date)
    if (list) list.push(entry)
    else map.set(entry.date, [entry])
  }
  return map
}

export function computeStats(
  entries: Entry[],
  plan: Plan,
  startDate: string,
  today: string,
): Stats {
  const byDate = groupByDate(entries)
  // Un giro registrato con una data precedente all'inizio conta per la streak,
  // ma non sposta le settimane della scheda.
  const start = entries.reduce((min, e) => (e.date < min ? e.date : min), startDate)
  const startWeek = mondayOf(start)
  const planWeek = mondayOf(startDate)
  const currentWeek = mondayOf(today)

  const hasActivity = (day: string) => (byDate.get(day) ?? []).some(isActivity)
  const hasFreeze = (week: string) =>
    weekDays(week).some((day) => (byDate.get(day) ?? []).some((e) => e.type === 'freeze'))
  const activeDays = (week: string) =>
    weekDays(week).filter((day) => day <= today && hasActivity(day)).length

  let running = 0
  let best = 0

  for (let week = startWeek; week <= currentWeek; week = addDays(week, 7)) {
    for (const day of weekDays(week)) {
      if (day > today) break
      let countedToday = false
      for (const entry of byDate.get(day) ?? []) {
        if (isActivity(entry) && !countedToday) {
          running++
          countedToday = true
          best = Math.max(best, running)
        } else if (entry.type === 'skip') {
          running = 0
          countedToday = false
        }
      }
    }
    if (week < currentWeek) {
      const target = weekTarget(plan, startDate, week, start)
      const covered = activeDays(week) + (hasFreeze(week) ? 1 : 0)
      if (covered < target) running = 0
    }
  }

  const todayEntries = byDate.get(today) ?? []
  const activeToday = todayEntries.some(isActivity)
  const skippedToday = todayEntries.some((e) => e.type === 'skip' || e.type === 'freeze')

  const target = weekTarget(plan, startDate, currentWeek, start)
  const done = activeDays(currentWeek)
  const freezeUsed = hasFreeze(currentWeek)
  const needed = Math.max(0, target - done - (freezeUsed ? 1 : 0))
  const daysLeft = 7 - weekdayIndex(today) - (activeToday ? 1 : 0)

  const weekIndex = Math.max(0, diffDays(planWeek, currentWeek) / 7)
  const { index, phase, firstWeek } = phaseForWeek(plan, weekIndex)
  const phaseStartWeek = addDays(planWeek, firstWeek * 7)
  const sessionsInPhase = entries.filter(
    (e) =>
      (e.type === 'workout' || e.type === 'mini') &&
      e.date >= phaseStartWeek &&
      e.sessionId !== undefined &&
      phase.rotation.includes(e.sessionId),
  ).length

  return {
    streak: running,
    best,
    activeToday,
    skippedToday,
    week: {
      start: currentWeek,
      target,
      done,
      freezeUsed,
      needed,
      daysLeft,
      complete: needed === 0,
    },
    phase: {
      index,
      phase,
      weekNumber: weekIndex + 1,
      weekInPhase: weekIndex - firstWeek + 1,
      phaseStartWeek,
    },
    nextSessionId: phase.rotation[sessionsInPhase % phase.rotation.length],
  }
}
