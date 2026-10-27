import { GROUND as G, type FigureSpec, type Limb } from '@/lib/figure/rig'

/*
 * Movimento dell'omino per ogni esercizio: due pose chiave e i tempi.
 * Di profilo, guardando a destra (tranne il jumping jack, di fronte).
 * Angoli: 0 = destra, 90 = giù, 180 = sinistra, 270 = su.
 */

const STAND: Limb = { a: 90, b: 90, c: 15 }
const HANG: Limb = { a: 92, b: 90, c: 90 }
const ATTACK_DECOR: FigureSpec['decor'] = [
  { kind: 'line', a: [0.41, 0.805], b: [0.63, 0.805], tone: 'moto' },
  { kind: 'line', a: [0.715, 0.475], b: [0.805, 0.375], tone: 'moto', front: true },
]

export const FIGURES: Record<string, FigureSpec> = {
  // Stretching
  s1: {
    frames: [
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 275 }, { target: [0.68, 0.035], bend: 1, c: 330 }] },
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 245 }, { target: [0.672, 0.03], bend: 1, c: 330 }] },
    ],
    hold: [0.8, 0.8],
    move: 1.2,
    phases: ['Tieni', 'Tira', 'Tieni', 'Molla'],
  },
  s2: {
    frames: [
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 85 }, { target: [0.69, 0.115], bend: 1, c: 60 }] },
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 115 }, { target: [0.675, 0.11], bend: 1, c: 60 }] },
    ],
    hold: [0.8, 0.8],
    move: 1.2,
    phases: ['Tieni', 'Tira', 'Tieni', 'Molla'],
  },
  s3: {
    frames: [
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, STAND], arms: [{ target: [0.3, -0.07], bend: -1, c: 270 }, { a: 95, b: 95, c: 95 }] },
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 276, neck: 278, legs: [{ a: 96, b: 96, c: 15 }, { a: 96, b: 96, c: 15 }], arms: [{ target: [0.3, -0.07], bend: -1, c: 270 }, { a: 95, b: 95, c: 95 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Avanti', 'Tieni', 'Indietro'],
    decor: [{ kind: 'line', a: [0.29, -0.2], b: [0.29, G], tone: 'prop' }],
  },
  s5: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 0, b: 90, c: 0 }, { a: 100, b: 180, c: 175 }], arms: [{ a: 95, b: 90, c: 90 }, { a: 95, b: 90, c: 90 }] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 268, neck: 270, legs: [{ a: 355, b: 100, c: 0 }, { a: 105, b: 180, c: 175 }], arms: [{ a: 95, b: 90, c: 90 }, { a: 95, b: 90, c: 90 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Avanti', 'Tieni', 'Torna'],
    key: 'hip',
  },
  s7: {
    frames: [
      { root: [0.46, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 95, b: 255, c: 180 }], arms: [{ a: 30, b: 10, c: 10 }, { target: [0.39, 0.36], bend: 1, c: 100 }] },
      { root: [0.46, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 100, b: 250, c: 180 }], arms: [{ a: 30, b: 10, c: 10 }, { target: [0.375, 0.36], bend: 1, c: 100 }] },
    ],
    hold: [0.8, 0.8],
    move: 1.2,
    phases: ['Tieni', 'Tira', 'Tieni', 'Molla'],
  },
  s8: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 300, neck: 300, legs: [{ a: 34, b: 105, c: 0 }, { a: 128, b: 128, c: 10 }], arms: [{ target: [0.79, 0.22], bend: 1, c: 270 }, { target: [0.79, 0.22], bend: 1, c: 270 }] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 304, neck: 304, legs: [{ a: 38, b: 110, c: 0 }, { a: 126, b: 126, c: 10 }], arms: [{ target: [0.79, 0.22], bend: 1, c: 270 }, { target: [0.79, 0.22], bend: 1, c: 270 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Spingi', 'Tieni', 'Molla'],
    decor: [{ kind: 'line', a: [0.8, -0.05], b: [0.8, G], tone: 'prop' }],
  },

  // Mobilità
  m1: {
    frames: [
      { root: [0.42, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 85, b: 0, c: 320 }, { a: 95, b: 0, c: 320 }] },
      { root: [0.42, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 85, b: 0, c: 40 }, { a: 95, b: 0, c: 40 }] },
    ],
    hold: [0.05, 0.05],
    move: 0.5,
    phases: ['Ruota', 'Ruota', 'Ruota', 'Ruota'],
  },
  m2: {
    frames: [
      { root: [0.36, 0.62], anchor: 'hip', torso: 352, bend: 30, neck: 60, legs: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }], arms: [{ target: [0.66, G], bend: -1, c: 0 }, { target: [0.66, G], bend: -1, c: 0 }] },
      { root: [0.36, 0.62], anchor: 'hip', torso: 352, bend: -24, neck: 320, legs: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }], arms: [{ target: [0.66, G], bend: -1, c: 0 }, { target: [0.66, G], bend: -1, c: 0 }] },
    ],
    hold: [0.5, 0.5],
    move: 1.4,
    phases: ['Gatto', 'Inarca', 'Mucca', 'Arrotonda'],
  },
  m3: {
    frames: [
      { root: [0.4, 0.81], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 200, b: 160, c: 180 }, { a: 200, b: 160, c: 180 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 10, b: 0, c: 0 }] },
      { root: [0.4, 0.81], anchor: 'hip', torso: -15, neck: -25, legs: [{ a: 200, b: 160, c: 180 }, { a: 200, b: 160, c: 180 }], arms: [{ a: -170, b: -170, c: -170 }, { a: 10, b: 0, c: 0 }] },
    ],
    hold: [0.4, 0.6],
    move: 1.6,
    linear: true,
    phases: ['Chiuso', 'Apri', 'Aperto', 'Chiudi'],
    trace: 'wrist',
  },
  m5: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 352, neck: 5, legs: [{ a: 0, b: 100, c: 0 }, { a: 152, b: 152, c: 160 }], arms: [{ target: [0.72, G], bend: 1, c: 0 }, { a: 95, b: 95, c: 95 }] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 350, neck: 300, legs: [{ a: 0, b: 100, c: 0 }, { a: 152, b: 152, c: 160 }], arms: [{ target: [0.72, G], bend: 1, c: 0 }, { a: 270, b: 270, c: 270 }] },
    ],
    hold: [0.4, 0.6],
    move: 1.3,
    phases: ['Giù', 'Apri', 'Su', 'Chiudi'],
  },
  m7: {
    frames: [
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, STAND], arms: [{ a: 90, b: 90, c: 90 }, { a: 90, b: 90, c: 90 }] },
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 330, neck: 335, legs: [{ a: 65, b: 100, c: 15 }, { a: 65, b: 100, c: 15 }], arms: [{ a: 95, b: 92, c: 92 }, { a: 95, b: 92, c: 92 }] },
    ],
    hold: [0.4, 0.5],
    move: 1.2,
    phases: ['Su', 'Piegati', 'Giù', 'Risali'],
    decor: [{ kind: 'stick' }],
    key: 'hip',
  },

  // Enduro
  e1: {
    frames: [
      { root: [0.5, 0.79], anchor: 'ankle', torso: 318, neck: 300, legs: [{ a: 35, b: 115, c: 0 }, { a: 35, b: 115, c: 0 }], arms: [{ target: [0.77, 0.43], bend: -1 }, { target: [0.77, 0.43], bend: -1 }] },
      { root: [0.5, 0.79], anchor: 'ankle', torso: 322, neck: 302, legs: [{ a: 25, b: 122, c: 0 }, { a: 25, b: 122, c: 0 }], arms: [{ target: [0.77, 0.43], bend: -1 }, { target: [0.77, 0.43], bend: -1 }] },
    ],
    hold: [0.15, 0.15],
    move: 0.45,
    ground: false,
    phases: ['Tieni', 'Assorbi', 'Assorbi', 'Tieni'],
    decor: ATTACK_DECOR,
    key: 'knee',
  },
  e2: {
    frames: [
      { root: [0.42, 0.8], anchor: 'hip', torso: 180, neck: 180, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
      { root: [0.42, 0.8], anchor: 'hip', torso: 180, neck: 180, legs: [{ a: 297, b: 70, c: 0 }, { a: 297, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
    ],
    hold: [0.6, 1.2],
    move: 0.4,
    phases: ['Rilassa', 'Stringi', 'Stringi', 'Rilassa'],
    decor: [{ kind: 'cushion' }],
  },
  e3: {
    frames: [
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 75, b: 95, c: 15 }, { a: 105, b: 100, c: 25 }], arms: [{ a: 92, b: 90, c: 90 }, { a: 88, b: 90, c: 90 }] },
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 105, b: 100, c: 25 }, { a: 75, b: 95, c: 15 }], arms: [{ a: 88, b: 90, c: 90 }, { a: 92, b: 90, c: 90 }] },
    ],
    hold: [0, 0],
    move: 0.55,
    phases: ['Cammina', 'Cammina', 'Cammina', 'Cammina'],
    decor: [{ kind: 'bags' }],
  },
  e11: {
    frames: [
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 0, b: 90, c: 15 }], arms: [{ a: 60, b: 30, c: 30 }, { a: 120, b: 150, c: 150 }] },
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 273, neck: 272, legs: [STAND, { a: 8, b: 92, c: 15 }], arms: [{ a: 55, b: 25, c: 25 }, { a: 125, b: 155, c: 155 }] },
    ],
    hold: [0.3, 0.3],
    move: 1.4,
    phases: ['Tieni', 'Tieni', 'Tieni', 'Tieni'],
  },
  e12: {
    frames: [
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 95, b: 92, c: 15 }], arms: [HANG, HANG] },
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 355, neck: 355, legs: [{ a: 80, b: 95, c: 15 }, { a: 178, b: 178, c: 100 }], arms: [{ a: 88, b: 90, c: 90 }, { a: 88, b: 90, c: 90 }] },
    ],
    hold: [0.4, 0.5],
    move: 1.3,
    phases: ['Su', 'Scendi', 'Giù', 'Risali'],
    key: 'hip',
  },

  // Flex
  f1: {
    frames: [
      { root: [0.86, G - 0.065], anchor: 'ankle', torso: 197, neck: 197, legs: [{ a: 17, b: 17, c: 95 }, { a: 17, b: 17, c: 95 }], arms: [{ target: [0.13, G], bend: -1, c: 180 }, { target: [0.13, G], bend: -1, c: 180 }] },
      { root: [0.86, G - 0.065], anchor: 'ankle', torso: 185, neck: 190, legs: [{ a: 5, b: 5, c: 95 }, { a: 5, b: 5, c: 95 }], arms: [{ target: [0.13, G], bend: -1, c: 180 }, { target: [0.13, G], bend: -1, c: 180 }] },
    ],
    hold: [0.5, 0.25],
    move: 1,
    phases: ['Su', 'Scendi', 'Giù', 'Spingi'],
    key: 'elbow',
    trace: 'shoulder',
  },
  f6: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 50, b: 95, c: 0 }, { target: [0.25, 0.83], bend: -1, c: 20 }], arms: [HANG, HANG] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 272, neck: 272, legs: [{ a: 0, b: 98, c: 0 }, { target: [0.25, 0.83], bend: -1, c: 20 }], arms: [HANG, HANG] },
    ],
    hold: [0.4, 0.3],
    move: 1.1,
    phases: ['Su', 'Scendi', 'Giù', 'Spingi'],
    key: 'knee',
    trace: 'hip',
  },
  f8: {
    frames: [
      { root: [0.86, 0.795], anchor: 'ankle', torso: 186, neck: 190, legs: [{ a: 6, b: 6, c: 95 }, { a: 6, b: 6, c: 95 }], arms: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }] },
      { root: [0.86, 0.795], anchor: 'ankle', torso: 187, neck: 191, legs: [{ a: 7, b: 7, c: 95 }, { a: 7, b: 7, c: 95 }], arms: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }] },
    ],
    hold: [1.2, 1.2],
    move: 1.6,
    phases: ['Tieni', 'Tieni', 'Tieni', 'Tieni'],
    key: 'hip',
  },
  f9: {
    frames: [
      { root: [0.42, 0.8], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 270, b: 180, c: 270 }, { a: 270, b: 180, c: 270 }], arms: [{ a: 270, b: 270, c: 270 }, { a: 270, b: 270, c: 270 }] },
      { root: [0.42, 0.8], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 185, b: 185, c: 180 }, { a: 270, b: 180, c: 270 }], arms: [{ a: 270, b: 270, c: 270 }, { a: 340, b: 350, c: 350 }] },
    ],
    hold: [0.5, 0.5],
    move: 1.2,
    phases: ['Pronto', 'Allunga', 'Tieni', 'Torna'],
  },
  f11: {
    frames: [
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 86, b: 90, c: 0 }, { a: 94, b: 90, c: 180 }], arms: [{ a: 80, b: 85, c: 85 }, { a: 100, b: 95, c: 95 }] },
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 70, b: 75, c: 0 }, { a: 110, b: 105, c: 180 }], arms: [{ a: 300, b: 290, c: 285 }, { a: 240, b: 250, c: 255 }] },
    ],
    hold: [0, 0],
    move: 0.35,
    phases: ['Salta', 'Salta', 'Salta', 'Salta'],
  },
}
