import { useState, type ReactNode } from 'react'
import { Minus, Motorbike, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { ScreenHeader } from '@/components/ScreenHeader'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { BodyZone } from '@/data/types'
import { addDays } from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const ZONES: { id: BodyZone; label: string }[] = [
  { id: 'avambracci', label: 'Avambracci' },
  { id: 'braccia', label: 'Braccia' },
  { id: 'spalle', label: 'Spalle' },
  { id: 'schiena', label: 'Schiena' },
  { id: 'gambe', label: 'Gambe' },
]

const DURATIONS = [30, 45, 60, 90, 120]

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button variant={selected ? 'default' : 'outline'} className="h-11 flex-1 px-2" onClick={onClick}>
      {children}
    </Button>
  )
}

/** Registra un giro in moto: conta come allenamento e tiene il diario della fatica. */
export function RideScreen() {
  const navigate = useNavigate()
  const today = useToday()
  const addEntry = useAppStore((s) => s.addEntry)
  const entries = useAppStore((s) => s.entries)

  const [day, setDay] = useState<'oggi' | 'ieri'>('oggi')
  const [minutes, setMinutes] = useState(60)
  const [fatigue, setFatigue] = useState<Partial<Record<BodyZone, number>>>({})
  const [pumpAfter, setPumpAfter] = useState('')
  const [note, setNote] = useState('')

  const date = day === 'oggi' ? today : addDays(today, -1)
  const alreadyActive = entries.some(
    (e) => e.date === date && (e.type === 'workout' || e.type === 'mini' || e.type === 'ride'),
  )

  const save = () => {
    const pump = Number.parseInt(pumpAfter, 10)
    addEntry({
      type: 'ride',
      date,
      note: note.trim() || undefined,
      ride: {
        minutes,
        fatigue,
        pumpAfterMin: Number.isFinite(pump) && pump > 0 ? pump : undefined,
      },
    })
    navigate('/', {
      replace: true,
      state: {
        flash: alreadyActive
          ? 'Giro salvato nel diario.'
          : 'Giro salvato: conta come allenamento per la streak.',
      },
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 pb-8">
      <ScreenHeader title="Giro in moto" back />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Quando</h2>
        <div className="flex gap-2">
          <Chip selected={day === 'oggi'} onClick={() => setDay('oggi')}>
            Oggi
          </Chip>
          <Chip selected={day === 'ieri'} onClick={() => setDay('ieri')}>
            Ieri
          </Chip>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Durata</h2>
        <div className="flex items-center justify-between rounded-xl border bg-card p-2">
          <Button variant="ghost" size="icon" aria-label="Meno 5 minuti" onClick={() => setMinutes((m) => Math.max(5, m - 5))}>
            <Minus />
          </Button>
          <span className="font-display text-5xl font-bold tabular">
            {minutes}
            <span className="ml-1 text-2xl text-muted-foreground">min</span>
          </span>
          <Button variant="ghost" size="icon" aria-label="Più 5 minuti" onClick={() => setMinutes((m) => m + 5)}>
            <Plus />
          </Button>
        </div>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <Chip key={d} selected={minutes === d} onClick={() => setMinutes(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Quanto sono stanchi? (facoltativo)</h2>
          <p className="text-sm text-muted-foreground">0 = niente, 10 = distrutti. Tocca solo quelli che vuoi segnare.</p>
        </div>
        {ZONES.map((zone) => {
          const value = fatigue[zone.id]
          return (
            <div key={zone.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{zone.label}</span>
                <span className={cn('font-display text-2xl font-bold tabular', value === undefined && 'text-muted-foreground')}>
                  {value ?? '–'}
                </span>
              </div>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[value ?? 0]}
                className={cn(value === undefined && 'opacity-50')}
                onValueChange={([v]) => setFatigue((f) => ({ ...f, [zone.id]: v }))}
                aria-label={zone.label}
              />
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Dopo quanti minuti si sono induriti gli avambracci?</h2>
        <div className="flex items-center gap-3">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="–"
            value={pumpAfter}
            onChange={(e) => setPumpAfter(e.target.value.replace(/\D/g, ''))}
            className="h-12 w-24 rounded-md border border-input bg-transparent px-3 text-center font-display text-2xl font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <span className="text-muted-foreground">minuti (lascia vuoto se non è successo)</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Note</h2>
        <Textarea placeholder="Terreno, come ti sei sentito, cosa è andato bene…" value={note} onChange={(e) => setNote(e.target.value)} />
      </section>

      <Button size="xl" variant="accent" className="w-full" onClick={save}>
        <Motorbike className="size-7" /> Salva giro
      </Button>
    </div>
  )
}
