import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { Check, Flame, Info, Pause, Play, Plus, SkipBack, SkipForward, X } from 'lucide-react'
import { Navigate, useBlocker, useNavigate } from 'react-router'

import { CategoryBadge } from '@/components/CategoryBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ExerciseSheet } from '@/components/ExerciseSheet'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES } from '@/data/exercises'
import { getSession } from '@/data/plan'
import type { Entry, Exercise, Feeling } from '@/data/types'
import { formatClock, formatDuration } from '@/lib/dates'
import { useStats, useToday, useWakeLock } from '@/lib/hooks'
import { buildSteps, targetLabel, workStepCount, type RestStep, type WorkStep } from '@/lib/session'
import { beep, vibrate } from '@/lib/signals'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

/** Conto alla rovescia basato sull'orario, così non perde tempo se il browser rallenta i timer. */
function useCountdown(totalSec: number, paused: boolean, onEnd: () => void) {
  const [remainingMs, setRemainingMs] = useState(totalSec * 1000)
  const [version, setVersion] = useState(0)
  const remainingRef = useRef(totalSec * 1000)
  const onEndRef = useRef(onEnd)

  useEffect(() => {
    onEndRef.current = onEnd
  })

  useEffect(() => {
    if (paused) return
    const end = Date.now() + remainingRef.current
    let fired = false
    const id = window.setInterval(() => {
      const left = Math.max(0, end - Date.now())
      remainingRef.current = left
      setRemainingMs(left)
      if (left === 0 && !fired) {
        fired = true
        onEndRef.current()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [paused, version])

  const addSeconds = (sec: number) => {
    remainingRef.current += sec * 1000
    setRemainingMs(remainingRef.current)
    setVersion((v) => v + 1)
  }

  return { remainingSec: remainingMs / 1000, progress: 1 - remainingMs / (totalSec * 1000), addSeconds }
}

function BigNumber({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'font-display text-[clamp(8rem,42vw,13rem)] leading-[0.85] font-extrabold tabular',
        className,
      )}
    >
      {children}
    </div>
  )
}

function WorkView({
  step,
  paused,
  onTogglePause,
  onDone,
  onInfo,
}: {
  step: WorkStep
  paused: boolean
  onTogglePause: () => void
  onDone: () => void
  onInfo: (exercise: Exercise) => void
}) {
  const { exercise } = step
  const timed = step.seconds !== undefined
  const countdown = useCountdown(step.seconds ?? 0, paused || !timed, onDone)
  const color = CATEGORIES[exercise.category].color

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 pt-3">
        <CategoryBadge category={exercise.category} size="lg" />
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {step.blockTitle}
          {step.rounds > 1 && ` · giro ${step.round}/${step.rounds}`}
        </span>
      </div>

      <h1 className="mt-3 font-display text-[clamp(2.75rem,13vw,4.75rem)] leading-[0.92] font-extrabold uppercase">
        {exercise.name}
      </h1>
      {step.side && (
        <p className="mt-1 font-display text-3xl font-bold text-accent uppercase">Lato {step.side}</p>
      )}

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        {timed ? (
          <>
            <BigNumber className={cn(paused && 'opacity-40')}>{formatClock(countdown.remainingSec)}</BigNumber>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-linear"
                style={{ width: `${Math.min(100, countdown.progress * 100)}%`, backgroundColor: color }}
              />
            </div>
            <p className="mt-2 text-lg text-muted-foreground uppercase">{paused ? 'In pausa' : 'secondi'}</p>
          </>
        ) : (
          <>
            <BigNumber>{step.reps}</BigNumber>
            <p className="mt-1 font-display text-3xl font-semibold text-muted-foreground uppercase">
              ripetizioni{exercise.perSide && ' per lato'}
            </p>
          </>
        )}
      </div>

      <button
        className="mb-4 flex items-start gap-3 rounded-xl border bg-card p-3 text-left"
        onClick={() => onInfo(exercise)}
      >
        <div className="flex-1 space-y-1.5 text-sm">
          <ul className="space-y-0.5 text-muted-foreground">
            {exercise.cues.slice(0, 3).map((cue) => (
              <li key={cue}>· {cue}</li>
            ))}
          </ul>
          {exercise.why && <p className="text-accent">{exercise.why}</p>}
        </div>
        <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      </button>

      {timed ? (
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Button size="xl" variant="secondary" className="h-24 text-3xl" onClick={onTogglePause}>
            {paused ? <Play className="size-8 fill-current" /> : <Pause className="size-8 fill-current" />}
            {paused ? 'Riprendi' : 'Pausa'}
          </Button>
          <Button size="xl" variant="outline" className="h-24" onClick={onDone} aria-label="Fatto, avanti">
            <Check className="size-8" />
          </Button>
        </div>
      ) : (
        <Button size="xl" className="h-28 w-full text-5xl" onClick={onDone}>
          <Check className="size-10" strokeWidth={3} /> Fatto
        </Button>
      )}
    </div>
  )
}

function RestView({
  step,
  next,
  paused,
  onDone,
}: {
  step: RestStep
  next?: WorkStep
  paused: boolean
  onDone: () => void
}) {
  const countdown = useCountdown(step.seconds, paused, onDone)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="font-display text-4xl font-bold tracking-wide text-muted-foreground uppercase">
          {step.label}
        </p>
        <BigNumber className={cn('text-primary', paused && 'opacity-40')}>
          {formatClock(countdown.remainingSec)}
        </BigNumber>
        <Progress value={(1 - countdown.progress) * 100} className="mt-4 h-3" />
      </div>

      {next && (
        <div className="mb-4 rounded-xl border bg-card p-4">
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Prossimo</p>
          <CategoryBadge category={next.exercise.category} />
          <p className="mt-2 font-display text-4xl leading-none font-bold uppercase">{next.exercise.name}</p>
          <p className="mt-1 text-lg text-muted-foreground">
            {targetLabel(next)}
            {next.side && ` · lato ${next.side}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <Button size="xl" variant="secondary" className="h-24" onClick={() => countdown.addSeconds(15)}>
          <Plus className="size-6" /> 15 s
        </Button>
        <Button size="xl" className="h-24 text-3xl" onClick={onDone}>
          <SkipForward className="size-7 fill-current" /> Salta
        </Button>
      </div>
    </div>
  )
}

const FEELINGS: { value: Feeling; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'giusto', label: 'Giusto' },
  { value: 'duro', label: 'Duro' },
  { value: 'troppo', label: 'Troppo duro' },
]

function DoneView({ entry, exerciseCount }: { entry: Entry; exerciseCount: number }) {
  const navigate = useNavigate()
  const { stats } = useStats()
  const current = useAppStore((s) => s.entries.find((e) => e.id === entry.id)) ?? entry
  const updateEntry = useAppStore((s) => s.updateEntry)
  const [noteOpen, setNoteOpen] = useState(false)

  useEffect(() => {
    const colors = ['#c5f82a', '#ff7a1a', '#ffffff']
    const shoot = (x: number) =>
      confetti({ particleCount: 90, spread: 75, startVelocity: 55, origin: { x, y: 0.7 }, colors, disableForReducedMotion: true })
    shoot(0.2)
    const t1 = window.setTimeout(() => shoot(0.8), 250)
    const t2 = window.setTimeout(() => shoot(0.5), 550)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      confetti.reset()
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col items-center gap-6 pt-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-12" strokeWidth={3} />
      </span>
      <div>
        <h1 className="font-display text-7xl font-extrabold text-primary uppercase">Fatto!</h1>
        <p className="text-muted-foreground">
          {current.type === 'mini' ? 'Versione mini' : 'Allenamento completo'} ·{' '}
          {formatDuration(current.durationSec ?? 0)} · {exerciseCount} esercizi
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Flame className="size-12 fill-accent/25 text-accent" />
        <span className="font-display text-6xl font-extrabold tabular">{stats.streak}</span>
        <span className="text-left text-sm text-muted-foreground">
          {stats.streak === 1 ? 'allenamento' : 'allenamenti'}
          <br />
          di fila
        </span>
      </div>

      <div className="w-full">
        <p className="mb-2 text-sm font-semibold">Com'è andata? (facoltativo)</p>
        <div className="grid grid-cols-4 gap-2">
          {FEELINGS.map((f) => (
            <Button
              key={f.value}
              variant={current.feeling === f.value ? 'default' : 'outline'}
              className="h-12 px-1 text-xs whitespace-normal"
              onClick={() =>
                updateEntry(entry.id, { feeling: current.feeling === f.value ? undefined : f.value })
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
        {noteOpen ? (
          <Textarea
            className="mt-3"
            autoFocus
            placeholder="Una nota per la prossima volta"
            defaultValue={current.note}
            onBlur={(e) => updateEntry(entry.id, { note: e.target.value.trim() || undefined })}
          />
        ) : (
          <Button variant="ghost" className="mt-2 text-muted-foreground" onClick={() => setNoteOpen(true)}>
            Aggiungi una nota
          </Button>
        )}
      </div>

      <Button size="xl" className="mt-auto w-full" onClick={() => navigate('/', { replace: true })}>
        Torna alla home
      </Button>
    </div>
  )
}

export function SessionScreen() {
  const navigate = useNavigate()
  const today = useToday()
  const active = useAppStore((s) => s.active)
  const settings = useAppStore((s) => s.settings)
  const setStepIndex = useAppStore((s) => s.setStepIndex)
  const clearActive = useAppStore((s) => s.clearActive)
  const addEntry = useAppStore((s) => s.addEntry)

  const [doneEntry, setDoneEntry] = useState<Entry | null>(null)
  const [doneExercises, setDoneExercises] = useState(0)
  const [exitOpen, setExitOpen] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [info, setInfo] = useState<Exercise | null>(null)
  const leavingRef = useRef(false)

  const session = active ? getSession(active.sessionId) : undefined
  const mini = active?.mini ?? false
  const steps = useMemo(() => (session ? buildSteps(session, { mini }) : []), [session, mini])

  const running = active !== null && doneEntry === null
  useWakeLock(running)

  // Il gesto "indietro" di Android non chiude l'allenamento senza chiedere.
  const blocker = useBlocker(() => running && !leavingRef.current)
  const exitDialogOpen = exitOpen || blocker.state === 'blocked'

  if (doneEntry) {
    return (
      <div className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-4">
        <DoneView entry={doneEntry} exerciseCount={doneExercises} />
      </div>
    )
  }
  if (!active || !session || steps.length === 0) return <Navigate to="/" replace />

  const index = Math.min(active.stepIndex, steps.length - 1)
  const step = steps[index]
  const totalWork = workStepCount(steps)
  const doneWork = steps.slice(0, index).filter((s) => s.kind === 'work').length
  const nextWork = steps.slice(index + 1).find((s): s is WorkStep => s.kind === 'work')
  const paused = userPaused || exitDialogOpen || info !== null

  const signal = (times: number) => {
    if (settings.sound) beep(times)
    if (settings.vibration) vibrate(times === 1 ? 200 : [150, 100, 150])
  }

  const finish = () => {
    const entry = addEntry({
      type: mini ? 'mini' : 'workout',
      date: today,
      sessionId: session.id,
      durationSec: Math.round((Date.now() - active.startedAt) / 1000),
    })
    setDoneExercises(new Set(steps.flatMap((s) => (s.kind === 'work' ? [s.exercise.id] : []))).size)
    setDoneEntry(entry)
    clearActive()
  }

  const goTo = (i: number) => {
    setUserPaused(false)
    if (i >= steps.length) finish()
    else setStepIndex(Math.max(0, i))
  }

  const prevWork = () => {
    for (let i = index - 1; i >= 0; i--) {
      if (steps[i].kind === 'work') return goTo(i)
    }
  }

  const closeExitDialog = () => {
    setExitOpen(false)
    if (blocker.state === 'blocked') blocker.reset()
  }

  const leave = () => {
    leavingRef.current = true
    setExitOpen(false)
    if (blocker.state === 'blocked') blocker.proceed()
    else navigate('/', { replace: true })
  }

  return (
    <div className="safe-top safe-bottom mx-auto flex h-dvh max-w-lg flex-col px-4">
      <header className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="-ml-2" aria-label="Esci" onClick={() => setExitOpen(true)}>
          <X className="size-7" />
        </Button>
        <Progress value={(doneWork / totalWork) * 100} className="flex-1" />
        <span className="w-12 text-right text-sm font-semibold tabular">
          {Math.min(doneWork + 1, totalWork)}/{totalWork}
        </span>
        <Button variant="ghost" size="icon" aria-label="Esercizio precedente" onClick={prevWork} disabled={doneWork === 0}>
          <SkipBack className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="-mr-2" aria-label="Salta" onClick={() => goTo(index + 1)}>
          <SkipForward className="size-5" />
        </Button>
      </header>

      {step.kind === 'work' ? (
        <WorkView
          key={index}
          step={step}
          paused={paused}
          onTogglePause={() => setUserPaused((p) => !p)}
          onDone={() => {
            if (step.seconds !== undefined) signal(1)
            goTo(index + 1)
          }}
          onInfo={setInfo}
        />
      ) : (
        <RestView
          key={index}
          step={step}
          next={nextWork}
          paused={paused}
          onDone={() => {
            signal(2)
            goTo(index + 1)
          }}
        />
      )}

      <ExerciseSheet exercise={info} onOpenChange={(open) => !open && setInfo(null)} />
      <ConfirmDialog
        open={exitDialogOpen}
        onOpenChange={(open) => !open && closeExitDialog()}
        title="Interrompere?"
        description="L'allenamento resta in sospeso: lo riprendi dalla home quando vuoi."
        cancelLabel="Continua l'allenamento"
        confirmLabel="Esci"
        onConfirm={leave}
      />
    </div>
  )
}
