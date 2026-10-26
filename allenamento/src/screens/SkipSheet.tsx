import { useState } from 'react'
import { CalendarClock, Snowflake, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Stats } from '@/lib/streak'
import { useAppStore } from '@/store/useAppStore'

type Stage = 'start' | 'later' | 'why' | 'imprevisto' | 'pigrizia'

function remaining(needed: number, days: number): string {
  const n = needed === 1 ? 'ne manca 1' : `ne mancano ${needed}`
  const d = days === 1 ? 'resta 1 giorno' : `restano ${days} giorni`
  return `${n} e ${d}`
}

/**
 * Il "giorno no": prima propone la versione mini, poi distingue
 * l'imprevisto (vale il freeze) dal "non mi va" (la streak si azzera).
 * Va rimontato (key) a ogni apertura per ripartire dal primo passo.
 */
export function SkipSheet({
  open,
  onOpenChange,
  stats,
  today,
  miniMinutes,
  onMini,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: Stats
  today: string
  miniMinutes: number
  onMini: () => void
}) {
  const addEntry = useAppStore((s) => s.addEntry)
  const [stage, setStage] = useState<Stage>('start')
  const [note, setNote] = useState('')

  const close = () => onOpenChange(false)
  const { week, streak } = stats
  // giorni utili dopo oggi, se oggi non ti alleni
  const daysAfterToday = Math.max(0, week.daysLeft - 1)

  const mini = (
    <Button size="lg" className="w-full" onClick={onMini}>
      <Zap /> Faccio la mini · {miniMinutes} min
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="bottom">
        {stage === 'start' && (
          <>
            <DialogHeader>
              <DialogTitle>Oggi non riesci?</DialogTitle>
              <DialogDescription>
                Prima di saltare: la versione mini dura {miniMinutes} minuti e conta come allenamento.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {mini}
              <Button size="lg" variant="outline" onClick={() => setStage('later')}>
                <CalendarClock /> Lo faccio un altro giorno
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground" onClick={() => setStage('why')}>
                Devo saltare
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'later' && (
          <>
            <DialogHeader>
              <DialogTitle>Ok, lo sposti</DialogTitle>
              <DialogDescription>
                Spostare non è saltare. Questa settimana, oltre a oggi, {remaining(week.needed, daysAfterToday)}.
              </DialogDescription>
            </DialogHeader>
            {week.needed > daysAfterToday && (
              <p className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
                Senza oggi non ci stai dentro: o fai la mini, o la settimana resta scoperta.
              </p>
            )}
            <DialogFooter>
              <Button size="lg" onClick={close}>
                Ok
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setStage('start')}>
                Indietro
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'why' && (
          <>
            <DialogHeader>
              <DialogTitle>Perché salti?</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <button
                className="rounded-xl border p-4 text-left transition-colors hover:bg-secondary"
                onClick={() => setStage('imprevisto')}
              >
                <div className="font-semibold">Imprevisto o impegno</div>
                <div className="text-sm text-muted-foreground">
                  Un viaggio, un impegno, un problema. Si può usare il freeze.
                </div>
              </button>
              <button
                className="rounded-xl border p-4 text-left transition-colors hover:bg-secondary"
                onClick={() => setStage('pigrizia')}
              >
                <div className="font-semibold">Non mi va, sono stanco</div>
                <div className="text-sm text-muted-foreground">Non vale come freeze.</div>
              </button>
            </div>
            <Button size="lg" variant="ghost" onClick={() => setStage('start')}>
              Indietro
            </Button>
          </>
        )}

        {stage === 'imprevisto' && !week.freezeUsed && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Snowflake className="size-6 text-freeze" /> Usi il freeze
              </DialogTitle>
              <DialogDescription>
                Ne hai 1 a settimana. Copre questo allenamento e la streak resta viva.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Cosa è successo? (facoltativo)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter>
              <Button
                size="lg"
                onClick={() => {
                  addEntry({ type: 'freeze', date: today, note: note.trim() || undefined })
                  close()
                }}
              >
                <Snowflake /> Usa il freeze
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setStage('why')}>
                Indietro
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'imprevisto' && week.freezeUsed && (
          <>
            <DialogHeader>
              <DialogTitle>Freeze già usato</DialogTitle>
              <DialogDescription>
                L'hai già usato questa settimana. Puoi ancora recuperare: oltre a oggi,{' '}
                {remaining(week.needed, daysAfterToday)}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {mini}
              <Button size="lg" variant="outline" onClick={close}>
                Ok, recupero
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === 'pigrizia' && (
          <>
            <DialogHeader>
              <DialogTitle>Non vale</DialogTitle>
              <DialogDescription>
                {streak > 0
                  ? `Se salti perché non ti va, la streak di ${streak} si azzera.`
                  : 'Se salti perché non ti va, non usi il freeze.'}{' '}
                La mini dura solo {miniMinutes} minuti.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {mini}
              <Button
                size="lg"
                variant="outline"
                className="border-destructive/50 text-destructive"
                onClick={() => {
                  addEntry({ type: 'skip', date: today })
                  close()
                }}
              >
                Salto lo stesso
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
