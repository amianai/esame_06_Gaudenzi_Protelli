// Scheletro 2D dell'omino. Angoli in gradi, convenzione SVG: 0 = destra, 90 = giù, 180 = sinistra, 270 = su.

export type Pt = [number, number]

export const GROUND = 0.86

export const LEN = {
  thigh: 0.24,
  shin: 0.23,
  foot: 0.07,
  spine: 0.15, // la schiena è in due pezzi, così si può curvare
  neck: 0.07,
  head: 0.055,
  upper: 0.15,
  fore: 0.14,
  hand: 0.05,
}

/** Arto con angoli (a = primo segmento, b = secondo, c = piede o mano) oppure con un punto da raggiungere. */
export type Limb = { a: number; b: number; c?: number } | { target: Pt; bend: 1 | -1; c?: number }

export interface Pose {
  /** Punto fisso: la caviglia della gamba vicina oppure l'anca. */
  root: Pt
  anchor: 'ankle' | 'hip'
  /** Direzione anca → spalle. */
  torso: number
  /** Curva della schiena: positiva = schiena rotonda, negativa = inarcata. */
  bend?: number
  neck: number
  /** [vicina, lontana]. Gambe: a = anca→ginocchio, b = ginocchio→caviglia. Braccia: a = spalla→gomito, b = gomito→polso. */
  legs: [Limb, Limb]
  arms: [Limb, Limb]
}

export type Decor =
  | { kind: 'line'; a: Pt; b: Pt; tone: 'moto' | 'prop'; front?: boolean }
  | { kind: 'stick' | 'bags' | 'cushion' }

export interface FigureSpec {
  frames: [Pose, Pose]
  /** Pause sulla prima e sulla seconda posa, in secondi. */
  hold: [number, number]
  /** Durata del passaggio da una posa all'altra. */
  move: number
  /** Scritte delle fasi: ferma sulla prima posa, verso la seconda, ferma sulla seconda, ritorno. */
  phases: [string, string, string, string]
  ground?: boolean
  /** Interpola gli angoli così come sono scritti, anche facendo il giro lungo. */
  linear?: boolean
  decor?: Decor[]
  /** Angolo misurato nello schema da allenatore. */
  key?: 'elbow' | 'knee' | 'hip'
  /** Punto di cui lo schema disegna il percorso. */
  trace?: 'shoulder' | 'wrist' | 'hip' | 'ankle'
}

export interface Chain {
  base: Pt
  mid: Pt
  end: Pt
  tip?: Pt
}

export interface Skeleton {
  hip: Pt
  spine: Pt
  shoulder: Pt
  neck: Pt
  head: Pt
  legs: [Chain, Chain]
  arms: [Chain, Chain]
}

const rad = (deg: number) => (deg * Math.PI) / 180

export function at(p: Pt, deg: number, len: number): Pt {
  return [p[0] + Math.cos(rad(deg)) * len, p[1] + Math.sin(rad(deg)) * len]
}

/** Due segmenti che raggiungono un punto: il gomito (o il ginocchio) si piega dal lato `bend`. */
function ik(base: Pt, target: Pt, l1: number, l2: number, bend: number): [Pt, Pt] {
  const dx = target[0] - base[0]
  const dy = target[1] - base[1]
  const d = Math.max(1e-4, Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-4))
  const angle = Math.atan2(dy, dx)
  const cos = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
  const a = Math.acos(Math.max(-1, Math.min(1, cos))) * bend
  return [
    [base[0] + Math.cos(angle + a) * l1, base[1] + Math.sin(angle + a) * l1],
    [base[0] + Math.cos(angle) * d, base[1] + Math.sin(angle) * d],
  ]
}

function chain(base: Pt, limb: Limb, l1: number, l2: number, tipLen: number): Chain {
  const [mid, end] =
    'target' in limb ? ik(base, limb.target, l1, l2, limb.bend) : [at(base, limb.a, l1), at(at(base, limb.a, l1), limb.b, l2)]
  return { base, mid, end, tip: limb.c === undefined ? undefined : at(end, limb.c, tipLen) }
}

export function solve(p: Pose): Skeleton {
  let hip = p.root
  if (p.anchor === 'ankle') {
    const leg = p.legs[0]
    if ('target' in leg) throw new Error("Con l'appoggio sulla caviglia la gamba vicina va data con gli angoli")
    hip = at(at(p.root, leg.b + 180, LEN.shin), leg.a + 180, LEN.thigh)
  }
  const bend = p.bend ?? 0
  const spine = at(hip, p.torso - bend / 2, LEN.spine)
  const shoulder = at(spine, p.torso + bend / 2, LEN.spine)
  const neck = at(shoulder, p.neck, LEN.neck)
  const head = at(neck, p.neck, LEN.head)
  const leg = (l: Limb) => chain(hip, l, LEN.thigh, LEN.shin, LEN.foot)
  const arm = (l: Limb) => chain(shoulder, l, LEN.upper, LEN.fore, LEN.hand)
  return { hip, spine, shoulder, neck, head, legs: [leg(p.legs[0]), leg(p.legs[1])], arms: [arm(p.arms[0]), arm(p.arms[1])] }
}

function lerpAngle(a: number, b: number, t: number, linear: boolean): number {
  if (linear) return a + (b - a) * t
  const d = ((((b - a + 180) % 360) + 360) % 360) - 180
  return a + d * t
}

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function lerpLimb(a: Limb, b: Limb, t: number, linear: boolean): Limb {
  const c = a.c !== undefined && b.c !== undefined ? lerpAngle(a.c, b.c, t, linear) : a.c
  if ('target' in a && 'target' in b) return { target: lerpPt(a.target, b.target, t), bend: a.bend, c }
  if (!('target' in a) && !('target' in b)) {
    return { a: lerpAngle(a.a, b.a, t, linear), b: lerpAngle(a.b, b.b, t, linear), c }
  }
  return t < 0.5 ? a : b
}

export function lerpPose(a: Pose, b: Pose, t: number, linear = false): Pose {
  return {
    root: lerpPt(a.root, b.root, t),
    anchor: a.anchor,
    torso: lerpAngle(a.torso, b.torso, t, linear),
    bend: lerpAngle(a.bend ?? 0, b.bend ?? 0, t, true),
    neck: lerpAngle(a.neck, b.neck, t, linear),
    legs: [lerpLimb(a.legs[0], b.legs[0], t, linear), lerpLimb(a.legs[1], b.legs[1], t, linear)],
    arms: [lerpLimb(a.arms[0], b.arms[0], t, linear), lerpLimb(a.arms[1], b.arms[1], t, linear)],
  }
}

export function cycleLength(spec: FigureSpec): number {
  return spec.hold[0] + spec.move + spec.hold[1] + spec.move
}

/** Dove siamo nel ciclo: k va da 0 (prima posa) a 1 (seconda posa); phase indica la fase 0-3. */
export function timeline(spec: FigureSpec, time: number): { k: number; phase: 0 | 1 | 2 | 3 } {
  const [h0, h1] = spec.hold
  let t = ((time % cycleLength(spec)) + cycleLength(spec)) % cycleLength(spec)
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x)
  if (t < h0) return { k: 0, phase: 0 }
  t -= h0
  if (t < spec.move) return { k: ease(t / spec.move), phase: 1 }
  t -= spec.move
  if (t < h1) return { k: 1, phase: 2 }
  t -= h1
  return { k: 1 - ease(t / spec.move), phase: 3 }
}

export function poseAt(spec: FigureSpec, time: number): Pose {
  return lerpPose(spec.frames[0], spec.frames[1], timeline(spec, time).k, spec.linear)
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** Inquadratura 4:3 che contiene tutte le pose dell'esercizio. */
export function frameBox(spec: FigureSpec): Box {
  const pts: Pt[] = []
  for (const k of [0, 0.25, 0.5, 0.75, 1]) {
    const s = solve(lerpPose(spec.frames[0], spec.frames[1], k, spec.linear))
    pts.push(s.hip, s.spine, s.shoulder)
    pts.push([s.head[0] - LEN.head, s.head[1] - LEN.head], [s.head[0] + LEN.head, s.head[1] + LEN.head])
    for (const c of [...s.legs, ...s.arms]) {
      pts.push(c.mid, c.end)
      if (c.tip) pts.push(c.tip)
    }
    if (spec.decor?.some((d) => d.kind === 'bags')) pts.push([s.arms[0].end[0], s.arms[0].end[1] + 0.12])
  }
  for (const d of spec.decor ?? []) if (d.kind === 'line') pts.push(d.a, d.b)
  if (spec.ground !== false) pts.push([pts[0][0], GROUND + 0.02])
  const pad = 0.08
  let x0 = Math.min(...pts.map((p) => p[0])) - pad
  let y0 = Math.min(...pts.map((p) => p[1])) - pad
  let w = Math.max(...pts.map((p) => p[0])) + pad - x0
  let h = Math.max(...pts.map((p) => p[1])) + pad - y0
  if (w / h < 4 / 3) {
    x0 -= (h * (4 / 3) - w) / 2
    w = h * (4 / 3)
  } else {
    y0 -= (w / (4 / 3) - h) / 2
    h = w / (4 / 3)
  }
  return { x: x0, y: y0, w, h }
}
