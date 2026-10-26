import { Snowflake } from 'lucide-react'

import type { WeekStatus } from '@/lib/streak'
import { cn } from '@/lib/utils'

/** Un pallino per allenamento previsto: pieno se fatto, fiocco se coperto dal freeze. */
export function WeekDots({ week }: { week: WeekStatus }) {
  const total = Math.max(week.target, week.done)
  const dots = Array.from({ length: total }, (_, i) => {
    if (i < week.done) return 'done'
    if (week.freezeUsed && i === week.done) return 'freeze'
    return 'todo'
  })
  return (
    <div className="flex items-center gap-1.5" aria-label={`${week.done} allenamenti su ${week.target}`}>
      {dots.map((kind, i) => (
        <span
          key={i}
          className={cn(
            'flex size-6 items-center justify-center rounded-full border-2',
            kind === 'done' && 'border-primary bg-primary',
            kind === 'freeze' && 'border-freeze/60 text-freeze',
            kind === 'todo' && 'border-border',
          )}
        >
          {kind === 'freeze' && <Snowflake className="size-3.5" />}
        </span>
      ))}
    </div>
  )
}
