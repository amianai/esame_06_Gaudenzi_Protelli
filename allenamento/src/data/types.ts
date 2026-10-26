export type Category = 'stretching' | 'mobilita' | 'enduro' | 'flex'

export interface Exercise {
  id: string
  name: string
  /** Nome inglese, usato anche per cercare il video. */
  nameEn?: string
  category: Category
  /** `reps` = si conta, `time` = si tiene per un tempo. */
  kind: 'reps' | 'time'
  /** Va fatto su entrambi i lati (a tempo: un timer per lato). */
  perSide?: boolean
  /** Come si fa, frasi brevi. */
  cues: string[]
  /** Perché serve, soprattutto in moto. */
  why?: string
  equipment?: string
  videoUrl?: string
}

export interface BlockItem {
  exerciseId: string
  reps?: number
  seconds?: number
}

/**
 * Un blocco è un gruppo di esercizi ripetuto `rounds` volte.
 * Con un solo esercizio sono serie normali, con più esercizi è un circuito.
 */
export interface Block {
  title: string
  rounds: number
  items: BlockItem[]
  /** Recupero tra un esercizio e il successivo dello stesso giro (secondi). */
  restBetweenItems?: number
  /** Recupero tra un giro e l'altro (secondi). */
  restBetweenRounds?: number
  /** Recupero prima del blocco successivo (secondi). */
  restAfter?: number
}

export interface Session {
  id: string
  name: string
  focus: string
  blocks: Block[]
}

export interface Phase {
  label: string
  weeks: number
  sessionsPerWeek: number
  /** Ordine in cui si alternano le sessioni. */
  rotation: string[]
}

export interface Plan {
  name: string
  /** True finché la scheda è quella di esempio e non quella vera. */
  isExample: boolean
  sessions: Session[]
  phases: Phase[]
}

export type EntryType = 'workout' | 'mini' | 'ride' | 'freeze' | 'skip'

export type Feeling = 'facile' | 'giusto' | 'duro' | 'troppo'

export type BodyZone = 'avambracci' | 'braccia' | 'spalle' | 'schiena' | 'gambe'

export interface RideLog {
  minutes: number
  /** Fatica da 0 a 10 per zona; solo le zone indicate. */
  fatigue: Partial<Record<BodyZone, number>>
  /** Dopo quanti minuti si sono induriti gli avambracci. */
  pumpAfterMin?: number
}

export interface Entry {
  id: string
  type: EntryType
  /** Giorno locale, YYYY-MM-DD. */
  date: string
  createdAt: number
  sessionId?: string
  durationSec?: number
  feeling?: Feeling
  note?: string
  ride?: RideLog
}
