import { ExternalLink } from 'lucide-react'

import { CategoryBadge } from '@/components/CategoryBadge'
import { ExerciseFigure } from '@/components/ExerciseFigure'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { videoUrlFor } from '@/data/exercises'
import type { Exercise } from '@/data/types'

export function ExerciseSheet({
  exercise,
  onOpenChange,
}: {
  exercise: Exercise | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={exercise !== null} onOpenChange={onOpenChange}>
      <DialogContent side="bottom">
        {exercise && (
          <>
            <DialogHeader>
              <CategoryBadge category={exercise.category} />
              <DialogTitle className="text-3xl">{exercise.name}</DialogTitle>
              <DialogDescription>
                {exercise.nameEn && <span>{exercise.nameEn} · </span>}
                {exercise.kind === 'time' ? 'A tempo' : 'A ripetizioni'}
                {exercise.perSide && ' · per lato'}
              </DialogDescription>
            </DialogHeader>
            <ExerciseFigure
              exerciseId={exercise.id}
              variant="coach"
              label={`Schema di: ${exercise.name}`}
              className="aspect-[4/3] w-full rounded-lg border"
            />
            <div>
              <h3 className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Come si fa
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                {exercise.cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            </div>
            {exercise.why && (
              <div>
                <h3 className="mb-1 text-xs font-semibold tracking-wider text-accent uppercase">Perché</h3>
                <p>{exercise.why}</p>
              </div>
            )}
            {exercise.equipment && (
              <p className="text-sm text-muted-foreground">Serve: {exercise.equipment}</p>
            )}
            <Button size="lg" variant="outline" asChild>
              <a href={videoUrlFor(exercise)} target="_blank" rel="noreferrer">
                <ExternalLink /> Guarda un video
              </a>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
