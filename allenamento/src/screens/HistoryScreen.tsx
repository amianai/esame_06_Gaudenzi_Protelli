import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Motorbike, Snowflake, Trash2, X, Zap } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Button } from '@/components/ui/button'
import { getSession } from '@/data/plan'
import type { Entry, Feeling } from '@/data/types'
import { addDays, diffDays, formatDuration, formatLong, formatMonth, mondayOf } from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import { isActivity } from '@/lib/streak'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
const FEELING_LABEL: Record<Feeling, string> = {
  facile: 'Facile',
  giusto: 'Giusto',
  duro: 'Duro',
  troppo: 'Troppo duro',
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const index = y * 12 + (m - 1) + delta
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

type DayKind = 'workout' | 'mini' | 'ride' | 'freeze' | 'skip' | null

function dayKind(list: Entry[]): DayKind {
  for (const kind of ['workout', 'mini', 'ride', 'freeze', 'skip'] as const) {
    if (list.some((e) => e.type === kind)) return kind
  }
  return null
}

function EntryCard({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  let icon = <Check className="size-5" strokeWidth={3} />
  let title = ''
  const details: string[] = []

  switch (entry.type) {
    case 'workout':
    case 'mini':
      icon = entry.type === 'mini' ? <Zap className="size-5" /> : <Check className="size-5" strokeWidth={3} />
      title = `${getSession(entry.sessionId ?? '')?.name ?? 'Allenamento'}${entry.type === 'mini' ? ' · mini' : ''}`
      if (entry.durationSec) details.push(formatDuration(entry.durationSec))
      if (entry.feeling) details.push(FEELING_LABEL[entry.feeling])
      break
    case 'ride': {
      icon = <Motorbike className="size-5" />
      title = 'Giro in moto'
      details.push(`${entry.ride?.minutes ?? 0} min`)
      const zones = Object.entries(entry.ride?.fatigue ?? {}).map(
        ([zone, value]) => `${zone.charAt(0).toUpperCase()}${zone.slice(1)} ${value}`,
      )
      if (zones.length) details.push(zones.join(', '))
      if (entry.ride?.pumpAfterMin) details.push(`avambracci duri dopo ${entry.ride.pumpAfterMin} min`)
      break
    }
    case 'freeze':
      icon = <Snowflake className="size-5" />
      title = 'Freeze'
      break
    case 'skip':
      icon = <X className="size-5" />
      title = 'Saltato'
      break
  }

  return (
    <li className="flex items-start gap-3 rounded-xl border bg-card p-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          entry.type === 'workout' && 'bg-primary text-primary-foreground',
          entry.type === 'mini' && 'border-2 border-primary text-primary',
          entry.type === 'ride' && 'bg-accent text-accent-foreground',
          entry.type === 'freeze' && 'border-2 border-freeze/60 text-freeze',
          entry.type === 'skip' && 'border-2 border-destructive/60 text-destructive',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {title}
          {entry.demo && (
            <span className="ml-2 rounded border border-dashed border-accent/50 px-1.5 py-0.5 text-[11px] font-medium text-accent">
              esempio
            </span>
          )}
        </p>
        {details.length > 0 && <p className="text-sm text-muted-foreground">{details.join(' · ')}</p>}
        {entry.note && <p className="mt-1 text-sm italic">“{entry.note}”</p>}
      </div>
      <Button variant="ghost" size="icon" className="-mr-1 text-muted-foreground" aria-label="Elimina" onClick={onDelete}>
        <Trash2 className="size-5" />
      </Button>
    </li>
  )
}

export function HistoryScreen() {
  const today = useToday()
  const entries = useAppStore((s) => s.entries)
  const removeEntry = useAppStore((s) => s.removeEntry)
  const [month, setMonth] = useState(today.slice(0, 7))
  const [selected, setSelected] = useState(today)
  const [toDelete, setToDelete] = useState<Entry | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of [...entries].sort((a, b) => a.createdAt - b.createdAt)) {
      map.set(e.date, [...(map.get(e.date) ?? []), e])
    }
    return map
  }, [entries])

  const first = `${month}-01`
  const nextFirst = `${shiftMonth(month, 1)}-01`
  const gridStart = mondayOf(first)
  const gridEnd = addDays(mondayOf(addDays(nextFirst, -1)), 6)
  const cells = Array.from({ length: diffDays(gridStart, gridEnd) + 1 }, (_, i) => addDays(gridStart, i))

  const monthEntries = entries.filter((e) => e.date >= first && e.date < nextFirst)
  const activeDays = new Set(monthEntries.filter(isActivity).map((e) => e.date)).size
  const rides = monthEntries.filter((e) => e.type === 'ride').length
  const minutes = Math.round(
    monthEntries.reduce(
      (sum, e) => sum + (e.durationSec ?? 0) / 60 + (e.type === 'ride' ? (e.ride?.minutes ?? 0) : 0),
      0,
    ),
  )

  const selectedEntries = byDate.get(selected) ?? []

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader title="Storico" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'giorni attivi', value: activeDays },
          { label: 'giri in moto', value: rides },
          { label: 'minuti', value: minutes },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3">
            <div className="font-display text-3xl font-bold tabular">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Mese precedente" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
            <ChevronLeft />
          </Button>
          <span className="font-display text-xl font-bold uppercase">{formatMonth(first)}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mese successivo"
            disabled={month >= today.slice(0, 7)}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="pb-1 text-xs font-semibold text-muted-foreground">
              {d}
            </span>
          ))}
          {cells.map((day) => {
            const list = byDate.get(day) ?? []
            const kind = dayKind(list)
            const inMonth = day >= first && day < nextFirst
            const hasRide = list.some((e) => e.type === 'ride')
            return (
              <button
                key={day}
                onClick={() => setSelected(day)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-lg',
                  !inMonth && 'opacity-30',
                  day === selected && 'bg-secondary',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular',
                    day === today && !kind && 'ring-1 ring-foreground',
                    kind === 'workout' && 'bg-primary text-primary-foreground',
                    kind === 'mini' && 'border-2 border-primary text-primary',
                    kind === 'ride' && 'bg-accent text-accent-foreground',
                    kind === 'freeze' && 'border-2 border-freeze/60 text-freeze',
                    kind === 'skip' && 'border-2 border-destructive/60 text-destructive',
                  )}
                >
                  {Number(day.slice(8))}
                </span>
                <span className={cn('mt-0.5 size-1.5 rounded-full', hasRide && kind !== 'ride' ? 'bg-accent' : 'bg-transparent')} />
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-primary" /> allenamento</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-primary" /> mini</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-accent" /> moto</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-freeze/60" /> freeze</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-destructive/60" /> saltato</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">{formatLong(selected)}</h2>
        {selectedEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Niente in questo giorno.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedEntries.map((e) => (
              <EntryCard key={e.id} entry={e} onDelete={() => setToDelete(e)} />
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminare?"
        description="Sparisce dallo storico e la streak viene ricalcolata."
        cancelLabel="No, tienilo"
        confirmLabel="Elimina"
        destructive
        onConfirm={() => {
          if (toDelete) removeEntry(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
