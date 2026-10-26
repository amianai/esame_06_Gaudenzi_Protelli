import type { Plan } from './types'

/**
 * SCHEDA DI ESEMPIO, da sostituire con quella vera.
 * Sessioni A/B/C prese dalla ricerca sull'enduro, versione senza attrezzi.
 */
export const PLAN: Plan = {
  name: 'Scheda di esempio',
  isExample: true,
  phases: [
    { label: 'Adattamento', weeks: 2, sessionsPerWeek: 2, rotation: ['a', 'b'] },
    { label: 'Base', weeks: 2, sessionsPerWeek: 3, rotation: ['a', 'b', 'c'] },
    { label: 'Costruzione', weeks: 4, sessionsPerWeek: 3, rotation: ['a', 'b', 'c'] },
  ],
  sessions: [
    {
      id: 'a',
      name: 'Parte alta e presa',
      focus: 'Mobilità, spinta, posizione in moto e avambracci',
      blocks: [
        {
          title: 'Riscaldamento',
          rounds: 1,
          restBetweenItems: 10,
          items: [
            { exerciseId: 'm1', seconds: 40 },
            { exerciseId: 'm2', reps: 8 },
            { exerciseId: 'm3', reps: 6 },
          ],
        },
        {
          title: 'Circuito',
          rounds: 3,
          restBetweenItems: 20,
          restBetweenRounds: 60,
          items: [
            { exerciseId: 'f1', reps: 10 },
            { exerciseId: 'e1', seconds: 30 },
            { exerciseId: 'f8', seconds: 30 },
          ],
        },
        {
          title: 'Presa',
          rounds: 2,
          restBetweenRounds: 45,
          items: [{ exerciseId: 'e3', seconds: 30 }],
        },
        {
          title: 'Defaticamento',
          rounds: 1,
          restBetweenItems: 5,
          items: [
            { exerciseId: 's1', seconds: 30 },
            { exerciseId: 's2', seconds: 30 },
            { exerciseId: 's3', seconds: 30 },
          ],
        },
      ],
    },
    {
      id: 'b',
      name: 'Gambe, equilibrio e core',
      focus: 'Stare in piedi sulle pedane a lungo',
      blocks: [
        {
          title: 'Riscaldamento',
          rounds: 1,
          restBetweenItems: 10,
          items: [
            { exerciseId: 'm7', reps: 10 },
            { exerciseId: 'm5', reps: 5 },
          ],
        },
        {
          title: 'Equilibrio',
          rounds: 2,
          restBetweenRounds: 20,
          items: [{ exerciseId: 'e11', seconds: 30 }],
        },
        {
          title: 'Circuito gambe',
          rounds: 3,
          restBetweenItems: 20,
          restBetweenRounds: 60,
          items: [
            { exerciseId: 'f6', reps: 8 },
            { exerciseId: 'e1', seconds: 30 },
            { exerciseId: 'e2', seconds: 20 },
          ],
        },
        {
          title: 'Core',
          rounds: 2,
          restBetweenItems: 20,
          restBetweenRounds: 45,
          items: [
            { exerciseId: 'f9', reps: 8 },
            { exerciseId: 'f8', seconds: 30 },
          ],
        },
        {
          title: 'Defaticamento',
          rounds: 1,
          restBetweenItems: 5,
          items: [
            { exerciseId: 's5', seconds: 30 },
            { exerciseId: 's7', seconds: 30 },
            { exerciseId: 's8', seconds: 30 },
          ],
        },
      ],
    },
    {
      id: 'c',
      name: 'Energia ed enduro',
      focus: 'Cardio a intervalli, posizione in moto e stretching lungo',
      blocks: [
        {
          title: 'Cardio',
          rounds: 6,
          restBetweenRounds: 30,
          items: [{ exerciseId: 'f11', seconds: 30 }],
        },
        {
          title: 'Circuito enduro',
          rounds: 2,
          restBetweenItems: 20,
          restBetweenRounds: 60,
          items: [
            { exerciseId: 'e1', seconds: 40 },
            { exerciseId: 'e12', reps: 6 },
            { exerciseId: 'f1', reps: 10 },
          ],
        },
        {
          title: 'Stretching lungo',
          rounds: 1,
          restBetweenItems: 5,
          items: [
            { exerciseId: 's1', seconds: 30 },
            { exerciseId: 's2', seconds: 30 },
            { exerciseId: 's3', seconds: 30 },
            { exerciseId: 's5', seconds: 30 },
            { exerciseId: 's8', seconds: 30 },
          ],
        },
      ],
    },
  ],
}

export function getSession(id: string) {
  return PLAN.sessions.find((s) => s.id === id)
}
