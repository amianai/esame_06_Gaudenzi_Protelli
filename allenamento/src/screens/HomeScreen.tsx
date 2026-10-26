import { useEffect, useMemo, useState } from 'react'
import { Check, Clock, Flame, Motorbike, Play, Settings, Snowflake, Trophy } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'

import { CategoryBadge } from '@/components/CategoryBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { WeekDots } from '@/components/WeekDots'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getSession } from '@/data/plan'
import type { Entry, Session } from '@/data/types'
import { formatDuration, formatLong } from '@/lib/dates'
import { useStats } from '@/lib/hooks'
import { buildSteps, estimateDurationSec, sessionExercises, workStepCount } from '@/lib/session'
import type { WeekStatus } from '@/lib/streak'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { SkipSheet } from './SkipSheet'

function weekMessage(week: WeekStatus): { text: string; tone: 'ok' | 'warn' | 'bad' } {
  if (week.complete) {
    return {
      text: week.done > week.target ? 'Obiettivo superato' : 'Obiettivo della settimana raggiunto',
      tone: 'ok',
    }
  }
  const slack = week.daysLeft - week.needed
  const n = week.needed === 1 ? 'Ne manca 1' : `Ne mancano ${week.needed}`
  const d = week.daysLeft === 1 ? 'resta 1 giorno' : `restano ${week.daysLeft} giorni`
  if (slack > 0) return { text: `${n}, ${d}`, tone: 'ok' }
  if (slack === 0) return { text: `${n} e ${d}: niente margine`, tone: 'warn' }
  if (slack === -1 && !week.freezeUsed) {
    return { text: `${n} e ${d}: ti serve il freeze (solo per imprevisti)`, tone: 'warn' }
  }
  return { text: 'Obiettivo non più raggiungibile: lunedì la streak riparte da zero', tone: 'bad' }
}

function entryLabel(entry: Entry): string {
  switch (entry.type) {
    case 'workout':
    case 'mini': {
      const name = getSession(entry.sessionId ?? '')?.name ?? 'Allenamento'
      const mini = entry.type === 'mini' ? ' (mini)' : ''
      const time = entry.durationSec ? ` · ${formatDuration(entry.durationSec)}` : ''
      return `${name}${mini}${time}`
    }
    case 'ride':
      return `Giro in moto · ${entry.ride?.minutes ?? 0} min`
    case 'freeze':
      return 'Freeze usato'
    case 'skip':
      return 'Allenamento saltato'
  }
}

function useSessionSummary(session: Session) {
  return useMemo(() => {
    const full = buildSteps(session)
    const mini = buildSteps(session, { mini: true })
    const exercises = sessionExercises(session)
    return {
      minutes: Math.round(estimateDurationSec(full) / 60),
      miniMinutes: Math.round(estimateDurationSec(mini) / 60),
      exerciseCount: exercises.length,
      categories: [...new Set(exercises.map((e) => e.category))],
    }
  }, [session])
}

export function HomeScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { today, stats } = useStats()
  const entries = useAppStore((s) => s.entries)
  const active = useAppStore((s) => s.active)
  const startSession = useAppStore((s) => s.startSession)
  const clearActive = useAppStore((s) => s.clearActive)

  const [skipKey, setSkipKey] = useState(0)
  const [skipOpen, setSkipOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const flash = (location.state as { flash?: string } | null)?.flash
  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(() => navigate('.', { replace: true, state: null }), 4000)
    return () => window.clearTimeout(timer)
  }, [flash, navigate])

  const session = getSession(stats.nextSessionId) ?? getSession('a')!
  const summary = useSessionSummary(session)
  const activeSession = active ? getSession(active.sessionId) : undefined
  const activeTotal = useMemo(
    () => (activeSession ? workStepCount(buildSteps(activeSession, { mini: active?.mini })) : 0),
    [activeSession, active?.mini],
  )
  const activeDone = useMemo(() => {
    if (!activeSession || !active) return 0
    return buildSteps(activeSession, { mini: active.mini })
      .slice(0, active.stepIndex)
      .filter((s) => s.kind === 'work').length
  }, [activeSession, active])

  const todayEntries = entries.filter((e) => e.date === today)
  const message = weekMessage(stats.week)
  const freezeToday = todayEntries.some((e) => e.type === 'freeze')
  const skipToday = todayEntries.some((e) => e.type === 'skip')

  const start = (mini: boolean) => {
    startSession(session.id, mini)
    navigate('/sessione')
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="safe-top flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatLong(today)}</p>
          <p className="font-display text-xl font-semibold tracking-wide uppercase">
            Settimana {stats.phase.weekNumber} · {stats.phase.phase.label}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="-mr-2" asChild>
          <Link to="/impostazioni" aria-label="Impostazioni">
            <Settings className="size-6" />
          </Link>
        </Button>
      </header>

      {flash && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {flash}
        </div>
      )}

      {/* Streak */}
      <Card className="gap-5">
        <CardContent className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Flame
              className={cn('size-14', stats.streak > 0 ? 'fill-accent/25 text-accent' : 'text-muted-foreground')}
            />
            <div>
              <div className="font-display text-7xl leading-none font-extrabold tabular">{stats.streak}</div>
              <div className="text-sm text-muted-foreground">
                {stats.streak === 1 ? 'allenamento di fila' : 'allenamenti di fila'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Trophy className="size-4" /> Record {stats.best}
          </div>
        </CardContent>
        <div className="border-t" />
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Questa settimana</span>
            <span className="font-display text-xl font-bold tabular">
              {stats.week.done}/{stats.week.target}
            </span>
          </div>
          <WeekDots week={stats.week} />
          <p
            className={cn(
              'text-sm',
              message.tone === 'ok' && 'text-muted-foreground',
              message.tone === 'warn' && 'text-accent',
              message.tone === 'bad' && 'text-destructive',
            )}
          >
            {message.text}
          </p>
        </CardContent>
      </Card>

      {/* Oggi */}
      {active && activeSession ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">In corso</h2>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="font-display text-3xl leading-tight font-bold uppercase">
                {activeSession.name}
                {active.mini && <span className="text-muted-foreground"> · mini</span>}
              </div>
              <Progress value={(activeDone / Math.max(1, activeTotal)) * 100} />
              <p className="text-sm text-muted-foreground">
                {activeDone} di {activeTotal} esercizi fatti
              </p>
            </CardContent>
          </Card>
          <Button size="xl" className="w-full" onClick={() => navigate('/sessione')}>
            <Play className="size-6 fill-current" /> Riprendi
          </Button>
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setCancelOpen(true)}>
            Annulla l'allenamento
          </Button>
        </section>
      ) : stats.activeToday ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Oggi</h2>
          <Card className="border-primary/40">
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-6" strokeWidth={3} />
                </span>
                <span className="font-display text-3xl font-bold uppercase">Fatto per oggi</span>
              </div>
              <ul className="text-sm text-muted-foreground">
                {todayEntries
                  .filter((e) => e.type !== 'skip' && e.type !== 'freeze')
                  .map((e) => (
                    <li key={e.id}>{entryLabel(e)}</li>
                  ))}
              </ul>
              <p className="text-sm">Ora recupera: domani i muscoli sono più forti.</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" variant="outline" onClick={() => start(false)}>
              <Play /> Extra
            </Button>
            <Button size="lg" variant="outline" className="text-accent" onClick={() => navigate('/giro')}>
              <Motorbike /> Giro in moto
            </Button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">
            {stats.week.complete ? 'Oggi · extra' : 'Oggi'}
          </h2>
          {(freezeToday || skipToday) && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {freezeToday ? (
                <>
                  <Snowflake className="size-4 text-freeze" /> Oggi hai usato il freeze. Se riesci, allenati lo stesso.
                </>
              ) : (
                'Oggi hai saltato. La streak riparte dal prossimo allenamento.'
              )}
            </p>
          )}
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Sessione {session.id.toUpperCase()}
                </p>
                <div className="font-display text-4xl leading-none font-bold uppercase">{session.name}</div>
                <p className="mt-1.5 text-sm text-muted-foreground">{session.focus}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-muted-foreground" /> ~{summary.minutes} min
                </span>
                <span className="text-muted-foreground">{summary.exerciseCount} esercizi</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.categories.map((c) => (
                  <CategoryBadge key={c} category={c} />
                ))}
              </div>
            </CardContent>
          </Card>
          <Button size="xl" className="h-20 w-full text-3xl" onClick={() => start(false)}>
            <Play className="size-7 fill-current" /> Inizia
          </Button>
          <div className="grid grid-cols-2 gap-3">
            {!stats.week.complete && !freezeToday && !skipToday ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setSkipKey((k) => k + 1)
                  setSkipOpen(true)
                }}
              >
                Oggi non riesco
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={() => start(true)}>
                Mini · {summary.miniMinutes} min
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-accent" onClick={() => navigate('/giro')}>
              <Motorbike /> Giro in moto
            </Button>
          </div>
        </section>
      )}

      <SkipSheet
        key={skipKey}
        open={skipOpen}
        onOpenChange={setSkipOpen}
        stats={stats}
        today={today}
        miniMinutes={summary.miniMinutes}
        onMini={() => {
          setSkipOpen(false)
          start(true)
        }}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annullare l'allenamento?"
        description="Quello che hai fatto finora non viene salvato."
        cancelLabel="No, lo riprendo dopo"
        confirmLabel="Sì, annulla"
        destructive
        onConfirm={() => {
          clearActive()
          setCancelOpen(false)
        }}
      />
    </div>
  )
}
