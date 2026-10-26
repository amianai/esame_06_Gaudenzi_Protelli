import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Entry } from '@/data/types'
import { todayISO } from '@/lib/dates'

export interface ActiveSession {
  sessionId: string
  mini: boolean
  stepIndex: number
  startedAt: number
}

export interface Settings {
  /** Bip a fine timer. Spento di default: mentre ti alleni ascolti i tuoi podcast. */
  sound: boolean
  vibration: boolean
}

interface PersistedState {
  startDate: string
  entries: Entry[]
  active: ActiveSession | null
  settings: Settings
}

interface AppState extends PersistedState {
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => Entry
  updateEntry: (id: string, patch: Partial<Entry>) => void
  removeEntry: (id: string) => void
  startSession: (sessionId: string, mini: boolean) => void
  setStepIndex: (stepIndex: number) => void
  clearActive: () => void
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  importBackup: (data: unknown) => boolean
  resetAll: () => void
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function initialState(): PersistedState {
  return {
    startDate: todayISO(),
    entries: [],
    active: null,
    settings: { sound: false, vibration: false },
  }
}

function isBackup(data: unknown): data is PersistedState {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return typeof d.startDate === 'string' && Array.isArray(d.entries)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState(),

      addEntry: (data) => {
        const entry: Entry = { ...data, id: newId(), createdAt: Date.now() }
        set((s) => ({ entries: [...s.entries, entry] }))
        return entry
      },
      updateEntry: (id, patch) =>
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      startSession: (sessionId, mini) =>
        set({ active: { sessionId, mini, stepIndex: 0, startedAt: Date.now() } }),
      setStepIndex: (stepIndex) =>
        set((s) => (s.active ? { active: { ...s.active, stepIndex } } : {})),
      clearActive: () => set({ active: null }),

      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

      importBackup: (data) => {
        if (!isBackup(data)) return false
        set({
          startDate: data.startDate,
          entries: data.entries,
          settings: { ...initialState().settings, ...data.settings },
          active: null,
        })
        return true
      },
      resetAll: () => set(initialState()),
    }),
    {
      name: 'allenamento-v0',
      version: 1,
      partialize: (s): PersistedState => ({
        startDate: s.startDate,
        entries: s.entries,
        active: s.active,
        settings: s.settings,
      }),
    },
  ),
)

export function exportBackup(): string {
  const { startDate, entries, settings } = useAppStore.getState()
  return JSON.stringify({ app: 'allenamento', version: 1, startDate, entries, settings }, null, 2)
}
