import { useRef, useState, type ReactNode } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatLong, todayISO } from '@/lib/dates'
import { exportBackup, useAppStore } from '@/store/useAppStore'

function Row({ title, description, control }: { title: string; description?: string; control: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {control}
    </label>
  )
}

export function SettingsScreen() {
  const settings = useAppStore((s) => s.settings)
  const setSetting = useAppStore((s) => s.setSetting)
  const startDate = useAppStore((s) => s.startDate)
  const entries = useAppStore((s) => s.entries)
  const importBackup = useAppStore((s) => s.importBackup)
  const resetAll = useAppStore((s) => s.resetAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const download = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `allenamento-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File) => {
    try {
      const ok = importBackup(JSON.parse(await file.text()))
      setMessage(ok ? 'Backup caricato.' : 'Questo file non è un backup valido.')
    } catch {
      setMessage('Non riesco a leggere il file.')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 pb-8">
      <ScreenHeader title="Impostazioni" back />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Durante l'allenamento</h2>
        <Row
          title="Bip a fine timer"
          description="Spento se ascolti podcast o musica."
          control={<Switch checked={settings.sound} onCheckedChange={(v) => setSetting('sound', v)} />}
        />
        <Row
          title="Vibrazione a fine timer"
          control={<Switch checked={settings.vibration} onCheckedChange={(v) => setSetting('vibration', v)} />}
        />
        <p className="px-1 text-sm text-muted-foreground">
          Lo schermo resta acceso durante l'allenamento, così lo vedi da lontano.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Dati</h2>
        <p className="px-1 text-sm text-muted-foreground">
          I dati restano solo su questo telefono ({entries.length} registrazioni, dal{' '}
          {formatLong(startDate).toLowerCase()}). Fai un backup ogni tanto: servirà anche quando l'app
          cambierà indirizzo.
        </p>
        {/* Nella pagina su claude.ai i download sono bloccati. */}
        {import.meta.env.MODE !== 'artifact' && (
          <Button size="lg" variant="outline" onClick={download}>
            <Download /> Scarica backup
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload /> Carica backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.target.value = ''
          }}
        />
        {message && <p className="px-1 text-sm text-primary">{message}</p>}
        <Button
          size="lg"
          variant="ghost"
          className="text-destructive"
          onClick={() => setResetOpen(true)}
        >
          <Trash2 /> Cancella tutto
        </Button>
      </section>

      <p className="mt-auto text-center text-xs text-muted-foreground">Versione 0 · prototipo</p>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Cancellare tutto?"
        description="Streak, storico e giri spariscono da questo telefono. Non si può annullare."
        cancelLabel="No"
        confirmLabel="Cancella tutto"
        destructive
        onConfirm={() => {
          resetAll()
          setResetOpen(false)
          setMessage('Dati cancellati.')
        }}
      />
    </div>
  )
}
