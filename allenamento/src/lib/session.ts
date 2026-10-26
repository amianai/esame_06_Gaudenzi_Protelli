import { getExercise } from '@/data/exercises'
import type { Exercise, Session } from '@/data/types'

export type Side = 'sinistro' | 'destro'

export interface WorkStep {
  kind: 'work'
  exercise: Exercise
  reps?: number
  seconds?: number
  side?: Side
  blockTitle: string
  round: number
  rounds: number
}

export interface RestStep {
  kind: 'rest'
  seconds: number
  label: 'Recupero' | 'Cambia lato' | 'Preparati'
}

export type Step = WorkStep | RestStep

/** Tempo minimo per arrivare in posizione prima di un esercizio a tempo. */
const MIN_PREP_SEC = 5
const FIRST_PREP_SEC = 10
const SIDE_SWITCH_SEC = 5
const SEC_PER_REP = 3

/**
 * Trasforma una sessione in una sequenza piatta di passi: lavoro e recuperi.
 * La versione mini fa un solo giro di ogni blocco.
 */
export function buildSteps(session: Session, options: { mini?: boolean } = {}): Step[] {
  const steps: Step[] = []

  session.blocks.forEach((block, blockIndex) => {
    const rounds = options.mini ? 1 : block.rounds
    const isLastBlock = blockIndex === session.blocks.length - 1

    for (let round = 1; round <= rounds; round++) {
      block.items.forEach((item, itemIndex) => {
        const exercise = getExercise(item.exerciseId)
        const sides: (Side | undefined)[] =
          exercise.perSide && exercise.kind === 'time' ? ['sinistro', 'destro'] : [undefined]

        sides.forEach((side, sideIndex) => {
          steps.push({
            kind: 'work',
            exercise,
            reps: item.reps,
            seconds: item.seconds,
            side,
            blockTitle: block.title,
            round,
            rounds,
          })

          if (sideIndex < sides.length - 1) {
            steps.push({ kind: 'rest', seconds: SIDE_SWITCH_SEC, label: 'Cambia lato' })
          } else if (itemIndex < block.items.length - 1) {
            steps.push({ kind: 'rest', seconds: block.restBetweenItems ?? 15, label: 'Recupero' })
          } else if (round < rounds) {
            steps.push({ kind: 'rest', seconds: block.restBetweenRounds ?? 60, label: 'Recupero' })
          } else if (!isLastBlock) {
            steps.push({ kind: 'rest', seconds: block.restAfter ?? 30, label: 'Recupero' })
          }
        })
      })
    }
  })

  // Prima di un esercizio a tempo serve qualche secondo per mettersi in posizione.
  const result: Step[] = []
  steps.forEach((step, index) => {
    const next = steps[index + 1]
    if (step.kind === 'rest') {
      const nextIsTimed = next?.kind === 'work' && next.seconds !== undefined
      const seconds = nextIsTimed ? Math.max(step.seconds, MIN_PREP_SEC) : step.seconds
      if (seconds > 0) result.push({ ...step, seconds })
    } else {
      result.push(step)
    }
  })

  const first = result[0]
  if (first?.kind === 'work' && first.seconds !== undefined) {
    result.unshift({ kind: 'rest', seconds: FIRST_PREP_SEC, label: 'Preparati' })
  }
  return result
}

export function estimateDurationSec(steps: Step[]): number {
  return steps.reduce((total, step) => {
    if (step.kind === 'rest') return total + step.seconds
    if (step.seconds !== undefined) return total + step.seconds
    const reps = (step.reps ?? 10) * (step.exercise.perSide ? 2 : 1)
    return total + reps * SEC_PER_REP + 5
  }, 0)
}

export function workStepCount(steps: Step[]): number {
  return steps.filter((s) => s.kind === 'work').length
}

/** Esercizi distinti della sessione, nell'ordine in cui compaiono. */
export function sessionExercises(session: Session): Exercise[] {
  const seen = new Set<string>()
  const list: Exercise[] = []
  for (const block of session.blocks) {
    for (const item of block.items) {
      if (!seen.has(item.exerciseId)) {
        seen.add(item.exerciseId)
        list.push(getExercise(item.exerciseId))
      }
    }
  }
  return list
}

export function targetLabel(step: { reps?: number; seconds?: number; exercise: Exercise }): string {
  if (step.seconds !== undefined) {
    const perSide = step.exercise.perSide ? ' per lato' : ''
    return `${step.seconds} s${perSide}`
  }
  const perSide = step.exercise.perSide ? ' per lato' : ''
  return `${step.reps ?? '-'} rip.${perSide}`
}
