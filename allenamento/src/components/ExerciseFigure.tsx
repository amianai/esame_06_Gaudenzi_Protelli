import { useEffect, useMemo, useRef } from 'react'

import { FIGURES } from '@/data/figures'
import { renderCoach, renderPicto } from '@/lib/figure/render'
import { frameBox } from '@/lib/figure/rig'
import { cn } from '@/lib/utils'

/**
 * Omino animato dell'esercizio.
 * `picto` = pittogramma, da guardare da lontano durante l'esercizio.
 * `coach` = schema da allenatore, per l'anteprima e la scheda dell'esercizio.
 */
export function ExerciseFigure({
  exerciseId,
  variant,
  paused = false,
  label,
  className,
}: {
  exerciseId: string
  variant: 'picto' | 'coach'
  paused?: boolean
  label: string
  className?: string
}) {
  const spec = FIGURES[exerciseId]
  const box = useMemo(() => (spec ? frameBox(spec) : null), [spec])
  const ref = useRef<SVGSVGElement>(null)
  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const svg = ref.current
    if (!spec || !box || !svg) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = variant === 'coach' ? renderCoach : renderPicto
    let clock = 0
    let last: number | null = null
    let raf = 0
    const frame = (now: number) => {
      if (last !== null && !pausedRef.current && !still) clock += Math.min(0.1, (now - last) / 1000)
      last = now
      svg.innerHTML = draw(spec, clock, box)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [spec, box, variant])

  if (!spec || !box) return null
  return (
    <svg
      ref={ref}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      className={cn('figure', className)}
      role="img"
      aria-label={label}
    />
  )
}
