import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

export function ScreenHeader({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="safe-top flex items-center gap-2 pb-2">
      {back && (
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          aria-label="Indietro"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
        >
          <ArrowLeft className="size-6" />
        </Button>
      )}
      <h1 className="flex-1 font-display text-3xl font-bold uppercase">{title}</h1>
      {right}
    </header>
  )
}
