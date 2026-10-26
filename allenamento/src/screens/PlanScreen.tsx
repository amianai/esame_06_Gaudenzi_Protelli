import { useState } from 'react'
import { ChevronRight, Clock, Info } from 'lucide-react'

import { CategoryDot } from '@/components/CategoryBadge'
import { ExerciseSheet } from '@/components/ExerciseSheet'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getExercise } from '@/data/exercises'
import { PLAN } from '@/data/plan'
import type { Exercise } from '@/data/types'
import { useStats } from '@/lib/hooks'
import { buildSteps, estimateDurationSec, targetLabel } from '@/lib/session'
import { cn } from '@/lib/utils'

export function PlanScreen() {
  const { stats } = useStats()
  const [info, setInfo] = useState<Exercise | null>(null)

  const phases = PLAN.phases.map((phase, index) => {
    const from = 1 + PLAN.phases.slice(0, index).reduce((sum, p) => sum + p.weeks, 0)
    const isLast = index === PLAN.phases.length - 1
    return { ...phase, index, range: isLast ? `Dalla settimana ${from}` : `Settimane ${from}-${from + phase.weeks - 1}` }
  })

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader title="Scheda" />

      {PLAN.isExample && (
        <div className="flex gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <Info className="size-5 shrink-0 text-accent" />
          <p>
            <span className="font-semibold text-accent">Scheda di esempio.</span> Presa dalla ricerca
            sull'enduro, senza attrezzi. La sostituiamo con quella vera.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Fasi</h2>
        <ol className="flex flex-col gap-2">
          {phases.map((p) => (
            <li
              key={p.label}
              className={cn(
                'flex items-center justify-between rounded-xl border p-3',
                p.index === stats.phase.index && 'border-primary/50 bg-primary/5',
              )}
            >
              <div>
                <p className="font-semibold">
                  {p.label}
                  {p.index === stats.phase.index && <span className="ml-2 text-xs text-primary">ADESSO</span>}
                </p>
                <p className="text-sm text-muted-foreground">{p.range}</p>
              </div>
              <span className="font-display text-2xl font-bold">{p.sessionsPerWeek}×</span>
            </li>
          ))}
        </ol>
      </section>

      {PLAN.sessions.map((session) => {
        const minutes = Math.round(estimateDurationSec(buildSteps(session)) / 60)
        const isNext = session.id === stats.nextSessionId
        return (
          <Card key={session.id} className={cn(isNext && 'border-primary/50')}>
            <CardHeader>
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Sessione {session.id.toUpperCase()}
                {isNext && <span className="ml-2 text-primary">· la prossima</span>}
              </p>
              <div className="font-display text-3xl leading-none font-bold uppercase">{session.name}</div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> ~{minutes} min · {session.focus}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {session.blocks.map((block) => (
                <div key={block.title}>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {block.title}
                    {block.rounds > 1 && ` · ${block.rounds} ${block.items.length > 1 ? 'giri' : 'serie'}`}
                  </p>
                  <ul className="flex flex-col">
                    {block.items.map((item) => {
                      const exercise = getExercise(item.exerciseId)
                      return (
                        <li key={item.exerciseId}>
                          <button
                            className="flex w-full items-center gap-3 rounded-lg py-2 text-left hover:bg-secondary"
                            onClick={() => setInfo(exercise)}
                          >
                            <CategoryDot category={exercise.category} />
                            <span className="flex-1">{exercise.name}</span>
                            <span className="text-sm text-muted-foreground tabular">
                              {targetLabel({ ...item, exercise })}
                            </span>
                            <ChevronRight className="size-4 text-muted-foreground" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <ExerciseSheet exercise={info} onOpenChange={(open) => !open && setInfo(null)} />
    </div>
  )
}
