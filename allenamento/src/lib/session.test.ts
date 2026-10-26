import { describe, expect, it } from 'vitest'

import type { Session } from '@/data/types'
import { buildSteps, estimateDurationSec, workStepCount } from './session'

const session: Session = {
  id: 'x',
  name: 'Test',
  focus: '',
  blocks: [
    {
      title: 'Circuito',
      rounds: 2,
      restBetweenItems: 0,
      restBetweenRounds: 60,
      items: [
        { exerciseId: 'f1', reps: 10 },
        { exerciseId: 'e1', seconds: 30 },
      ],
    },
    {
      title: 'Stretching',
      rounds: 1,
      items: [{ exerciseId: 's1', seconds: 30 }],
    },
  ],
}

describe('buildSteps', () => {
  it('ripete i giri e inserisce i recuperi', () => {
    const steps = buildSteps(session)
    expect(steps.map((s) => (s.kind === 'work' ? s.exercise.id : `${s.label}:${s.seconds}`))).toEqual([
      'f1',
      'Recupero:5', // 0 s ma serve tempo per mettersi in posizione
      'e1',
      'Recupero:60',
      'f1',
      'Recupero:5',
      'e1',
      'Recupero:30',
      's1',
      'Cambia lato:5',
      's1',
    ])
  })

  it('segna il lato negli esercizi a tempo per lato', () => {
    const sides = buildSteps(session)
      .filter((s) => s.kind === 'work' && s.exercise.id === 's1')
      .map((s) => (s.kind === 'work' ? s.side : undefined))
    expect(sides).toEqual(['sinistro', 'destro'])
  })

  it('la versione mini fa un solo giro', () => {
    expect(workStepCount(buildSteps(session, { mini: true }))).toBe(4)
    expect(workStepCount(buildSteps(session))).toBe(6)
  })

  it('aggiunge la preparazione se si parte con un esercizio a tempo', () => {
    const steps = buildSteps({ ...session, blocks: [session.blocks[1]] })
    expect(steps[0]).toEqual({ kind: 'rest', seconds: 10, label: 'Preparati' })
  })

  it('stima la durata', () => {
    const mini = estimateDurationSec(buildSteps(session, { mini: true }))
    const full = estimateDurationSec(buildSteps(session))
    expect(mini).toBeGreaterThan(0)
    expect(full).toBeGreaterThan(mini)
  })
})
