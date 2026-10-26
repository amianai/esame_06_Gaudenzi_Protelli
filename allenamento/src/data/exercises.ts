import type { Category, Exercise } from './types'

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  stretching: { label: 'Stretching', color: 'var(--cat-stretching)' },
  mobilita: { label: 'Mobilità', color: 'var(--cat-mobilita)' },
  enduro: { label: 'Enduro', color: 'var(--cat-enduro)' },
  flex: { label: 'Flex', color: 'var(--cat-flex)' },
}

/**
 * Libreria degli esercizi, presa dalla ricerca sull'enduro.
 * Per ora solo quelli fattibili senza attrezzi (o con oggetti di casa).
 */
export const EXERCISES: Exercise[] = [
  // Stretching
  {
    id: 's1',
    name: 'Stretching flessori avambraccio',
    nameEn: 'Wrist flexor stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: [
      'Braccio teso davanti, palmo in su',
      "Con l'altra mano tira indietro le dita",
      'Tensione 5-6 su 10, mai dolore',
    ],
    why: 'Scarica il lato del palmo, quello che stringe manubrio e leve.',
  },
  {
    id: 's2',
    name: 'Stretching estensori avambraccio',
    nameEn: 'Wrist extensor stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: ['Braccio teso davanti, palmo in giù', 'Piega il polso e tira il dorso della mano verso di te'],
    why: "Scarica il dorso dell'avambraccio, che lavora sull'acceleratore.",
  },
  {
    id: 's3',
    name: 'Pettorali alla porta',
    nameEn: 'Doorway chest stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: ['Avambraccio sullo stipite, gomito all’altezza della spalla', 'Fai un passo avanti finché senti il petto'],
    why: 'Apre le spalle chiuse dalla scrivania.',
    equipment: 'Una porta',
  },
  {
    id: 's5',
    name: "Flessori dell'anca",
    nameEn: 'Half-kneeling hip flexor stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: ['Un ginocchio a terra, l’altro piede avanti', 'Stringi il gluteo e porta il bacino in avanti'],
    why: 'Le anche si accorciano stando seduti; servono libere per stare in piedi sulle pedane.',
  },
  {
    id: 's7',
    name: 'Quadricipite in piedi',
    nameEn: 'Standing quad stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: ['Prendi il piede dietro con la mano', 'Ginocchia vicine, bacino dritto'],
  },
  {
    id: 's8',
    name: 'Polpacci al muro',
    nameEn: 'Wall calf stretch',
    category: 'stretching',
    kind: 'time',
    perSide: true,
    cues: ['Mani al muro, una gamba dietro tesa', 'Tallone a terra'],
    why: 'I polpacci assorbono i colpi quando sei in piedi sulle pedane.',
  },

  // Mobilità
  {
    id: 'm1',
    name: 'Mobilità dei polsi',
    nameEn: 'Wrist circles',
    category: 'mobilita',
    kind: 'time',
    cues: ['Cerchi lenti e ampi con i polsi', 'Metà tempo in un senso, metà nell’altro'],
    why: 'Prepara i polsi a gas, frizione e freno.',
  },
  {
    id: 'm2',
    name: 'Gatto-mucca',
    nameEn: 'Cat-cow',
    category: 'mobilita',
    kind: 'reps',
    cues: ['A quattro zampe', 'Inarca la schiena guardando su, poi arrotondala guardando l’ombelico'],
    why: 'Muove la schiena dopo ore seduto.',
  },
  {
    id: 'm3',
    name: 'Rotazione toracica a libro',
    nameEn: 'Open book',
    category: 'mobilita',
    kind: 'reps',
    perSide: true,
    cues: ['Sdraiato su un fianco, ginocchia piegate', 'Apri il braccio sopra come la pagina di un libro'],
    why: 'In moto giri busto e testa per guardare la curva.',
  },
  {
    id: 'm5',
    name: 'Affondo con rotazione',
    nameEn: "World's greatest stretch",
    category: 'mobilita',
    kind: 'reps',
    perSide: true,
    cues: ['Affondo lungo, mano a terra', 'Ruota il busto e porta l’altro braccio verso il soffitto'],
    why: 'Anche, schiena e spalle in un solo movimento.',
  },
  {
    id: 'm7',
    name: "Piegamento all'anca",
    nameEn: 'Hip hinge drill',
    category: 'mobilita',
    kind: 'reps',
    cues: ['Manico di scopa lungo la schiena: testa, schiena e osso sacro lo toccano', 'Porta il sedere indietro, schiena dritta'],
    why: "La posizione d'attacco in moto è un piegamento all'anca, non una schiena curva.",
    equipment: 'Manico di scopa',
  },

  // Enduro
  {
    id: 'e1',
    name: "Posizione d'attacco",
    nameEn: 'Attack position hold',
    category: 'enduro',
    kind: 'time',
    cues: [
      'Piedi alla larghezza delle pedane, ginocchia morbide',
      "Piegati all'anca, petto avanti, schiena dritta",
      'Braccia avanti come sul manubrio, gomiti alti',
    ],
    why: 'È la posizione in piedi sulla moto: le gambe reggono, le mani restano leggere.',
  },
  {
    id: 'e2',
    name: 'Stretta degli adduttori',
    nameEn: 'Adductor squeeze',
    category: 'enduro',
    kind: 'time',
    cues: ['Seduto o sdraiato, cuscino tra le ginocchia', 'Stringi forte e tieni'],
    why: 'Stringere la moto con le ginocchia toglie lavoro alle braccia.',
    equipment: 'Un cuscino',
  },
  {
    id: 'e3',
    name: 'Camminata del contadino',
    nameEn: "Farmer's carry",
    category: 'enduro',
    kind: 'time',
    cues: ['Due borse o uno zaino pesante per mano', 'Cammina dritto, spalle basse, addome stretto'],
    why: 'Allena la presa a resistenza, come tenere il manubrio per tutto il giro.',
    equipment: 'Due borse pesanti (poi manubri)',
  },
  {
    id: 'e11',
    name: 'Appoggio su una gamba',
    nameEn: 'Single-leg stance',
    category: 'enduro',
    kind: 'time',
    perSide: true,
    cues: ['In piedi su una gamba, ginocchio morbido', 'Quando è facile chiudi gli occhi'],
    why: 'Equilibrio per stare in piedi sulla moto che si muove.',
  },
  {
    id: 'e12',
    name: 'Stacco rumeno su una gamba',
    nameEn: 'Single-leg Romanian deadlift',
    category: 'enduro',
    kind: 'reps',
    perSide: true,
    cues: ['Su una gamba, l’altra va indietro', 'Busto e gamba dietro scendono insieme, schiena dritta'],
    why: 'Equilibrio più catena posteriore: anche e schiena forti in piedi.',
  },

  // Flex
  {
    id: 'f1',
    name: 'Flessioni',
    nameEn: 'Push-up',
    category: 'flex',
    kind: 'reps',
    cues: ['Mani sotto le spalle, corpo dritto', 'Petto quasi a terra, poi spingi'],
    why: 'Spalle, petto e tricipiti: spingi e assorbi sul manubrio.',
  },
  {
    id: 'f6',
    name: 'Split squat',
    nameEn: 'Split squat',
    category: 'flex',
    kind: 'reps',
    perSide: true,
    cues: ['Un piede avanti e uno dietro', 'Scendi dritto finché il ginocchio dietro sfiora terra'],
    why: 'Gambe forti per stare in piedi a lungo sulle pedane.',
  },
  {
    id: 'f8',
    name: 'Plank',
    nameEn: 'Front plank',
    category: 'flex',
    kind: 'time',
    cues: ['Avambracci a terra, corpo dritto dalla testa ai talloni', 'Addome e glutei stretti'],
    why: 'Il core tiene il busto in posizione e scarica le braccia.',
  },
  {
    id: 'f9',
    name: 'Dead bug',
    nameEn: 'Dead bug',
    category: 'flex',
    kind: 'reps',
    perSide: true,
    cues: ['Sdraiato, braccia in alto e ginocchia a 90°', 'Allunga braccio e gamba opposti, schiena incollata a terra'],
    why: 'Core che resiste ai colpi senza inarcare la schiena.',
  },
  {
    id: 'f11',
    name: 'Jumping jack',
    nameEn: 'Jumping jacks',
    category: 'flex',
    kind: 'time',
    cues: ['Salta aprendo gambe e braccia, poi chiudi', 'Ritmo costante, respira'],
    why: 'Cardio: in moto il cuore lavora parecchio. Poi lo sostituiamo con la corda.',
  },
]

const byId = new Map(EXERCISES.map((e) => [e.id, e]))

export function getExercise(id: string): Exercise {
  const exercise = byId.get(id)
  if (!exercise) throw new Error(`Esercizio sconosciuto: ${id}`)
  return exercise
}

export function videoUrlFor(exercise: Exercise): string {
  if (exercise.videoUrl) return exercise.videoUrl
  const query = `${exercise.nameEn ?? exercise.name} exercise how to`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
