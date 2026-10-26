import { CATEGORIES } from '@/data/exercises'
import type { Category } from '@/data/types'
import { cn } from '@/lib/utils'

export function CategoryDot({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: CATEGORIES[category].color }}
    />
  )
}

export function CategoryBadge({
  category,
  size = 'sm',
  className,
}: {
  category: Category
  size?: 'sm' | 'lg'
  className?: string
}) {
  const { label, color } = CATEGORIES[category]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border font-semibold uppercase',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px] tracking-wide' : 'px-3.5 py-1 text-sm tracking-wider',
        className,
      )}
      style={{ color, borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
    >
      <CategoryDot category={category} className={size === 'lg' ? 'size-3' : undefined} />
      {label}
    </span>
  )
}
