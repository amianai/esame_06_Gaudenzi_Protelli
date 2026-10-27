import {
  GROUND,
  LEN,
  cycleLength,
  poseAt,
  solve,
  timeline,
  type Box,
  type Chain,
  type FigureSpec,
  type Pt,
  type Skeleton,
} from './rig'

// I colori stanno in index.css (classi .fig-*): qui si producono solo le forme SVG.

const f = (n: number) => n.toFixed(4)

/** Segmento affusolato: due cerchi di raggio diverso uniti dalle tangenti. */
function taper(a: Pt, b: Pt, r1: number, r2: number, cls: string): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d = Math.hypot(dx, dy) || 1e-6
  const nx = -dy / d
  const ny = dx / d
  const p1: Pt = [a[0] + nx * r1, a[1] + ny * r1]
  const p2: Pt = [b[0] + nx * r2, b[1] + ny * r2]
  const p3: Pt = [b[0] - nx * r2, b[1] - ny * r2]
  const p4: Pt = [a[0] - nx * r1, a[1] - ny * r1]
  return (
    `<path class="${cls}" d="M${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}` +
    `A${f(r2)} ${f(r2)} 0 0 0 ${f(p3[0])} ${f(p3[1])}L${f(p4[0])} ${f(p4[1])}` +
    `A${f(r1)} ${f(r1)} 0 0 0 ${f(p1[0])} ${f(p1[1])}Z"/>`
  )
}

// Spessori (raggi) all'inizio e alla fine di ogni segmento: cosce e petto più larghi, polsi e caviglie più fini.
const R = {
  thigh: [0.037, 0.026],
  shin: [0.027, 0.018],
  foot: [0.017, 0.011],
  upper: [0.027, 0.021],
  fore: [0.021, 0.016],
  hand: [0.016, 0.011],
  lower: [0.044, 0.04],
  chest: [0.04, 0.05],
  head: 0.062,
} as const

function limb(c: Chain, kind: 'leg' | 'arm', cls: string, grow = 0): string {
  const [s1, s2, s3] = kind === 'leg' ? [R.thigh, R.shin, R.foot] : [R.upper, R.fore, R.hand]
  let out = taper(c.base, c.mid, s1[0] + grow, s1[1] + grow, cls) + taper(c.mid, c.end, s2[0] + grow, s2[1] + grow, cls)
  if (c.tip) out += taper(c.end, c.tip, s3[0] + grow, s3[1] + grow, cls)
  return out
}

function decor(spec: FigureSpec, s: Skeleton, k: number, front: boolean, thick: number): string {
  let out = ''
  for (const d of spec.decor ?? []) {
    if (d.kind === 'line') {
      if (Boolean(d.front) !== front) continue
      out += `<line class="fig-${d.tone}" x1="${f(d.a[0])}" y1="${f(d.a[1])}" x2="${f(d.b[0])}" y2="${f(d.b[1])}" stroke-width="${f(thick)}" stroke-linecap="round"/>`
    } else if (d.kind === 'bags' && front) {
      for (const arm of s.arms) {
        const w = arm.end
        out += `<rect class="fig-prop-fill" x="${f(w[0] - 0.035)}" y="${f(w[1] + 0.005)}" width="0.07" height="0.1" rx="0.015"/>`
      }
    } else if (d.kind === 'cushion' && front) {
      const p = s.legs[0].mid
      out += `<ellipse class="fig-prop-fill" cx="${f(p[0])}" cy="${f(p[1] + 0.01)}" rx="${f(0.05 * (1 - 0.3 * k))}" ry="0.035"/>`
    } else if (d.kind === 'stick' && !front) {
      // manico di scopa lungo la schiena: dal bacino alla nuca
      const dir = [s.head[0] - s.hip[0], s.head[1] - s.hip[1]]
      const len = Math.hypot(dir[0], dir[1]) || 1
      const back: Pt = [dir[1] / len, -dir[0] / len]
      const off = 0.06
      const a: Pt = [s.hip[0] - (dir[0] / len) * 0.08 + back[0] * off, s.hip[1] - (dir[1] / len) * 0.08 + back[1] * off]
      const b: Pt = [s.head[0] + (dir[0] / len) * 0.06 + back[0] * off, s.head[1] + (dir[1] / len) * 0.06 + back[1] * off]
      out += `<line class="fig-prop" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke-width="${f(thick * 0.7)}" stroke-linecap="round"/>`
    }
  }
  return out
}

/** Pittogramma: sagoma piena, arti affusolati, contorno scuro tra le parti. Da guardare a 2-3 metri. */
export function renderPicto(spec: FigureSpec, time: number, box: Box): string {
  const { k } = timeline(spec, time)
  const s = solve(poseAt(spec, time))
  const cut = 0.012
  let out = ''
  if (spec.ground !== false) {
    const xs = [...s.legs, ...s.arms].flatMap((c) => [c.end[0], c.tip?.[0] ?? c.end[0]]).concat(s.hip[0])
    const x0 = Math.min(...xs)
    const x1 = Math.max(...xs)
    out += `<ellipse class="fig-shadow" cx="${f((x0 + x1) / 2)}" cy="${f(GROUND + 0.012)}" rx="${f((x1 - x0) / 2 + 0.06)}" ry="0.018"/>`
  }
  out += decor(spec, s, k, false, box.h * 0.03)
  out += limb(s.legs[1], 'leg', 'fig-far') + limb(s.arms[1], 'arm', 'fig-far')
  // contorno: la stessa sagoma un po' più grande, del colore dello sfondo
  out += limb(s.legs[0], 'leg', 'fig-cut', cut)
  out += taper(s.hip, s.spine, R.lower[0] + cut, R.lower[1] + cut, 'fig-cut') + taper(s.spine, s.shoulder, R.chest[0] + cut, R.chest[1] + cut, 'fig-cut')
  out += limb(s.legs[0], 'leg', 'fig-near')
  out += taper(s.hip, s.spine, R.lower[0], R.lower[1], 'fig-near') + taper(s.spine, s.shoulder, R.chest[0], R.chest[1], 'fig-near')
  out += taper(s.shoulder, s.neck, 0.018, 0.016, 'fig-near')
  out += `<circle class="fig-cut" cx="${f(s.head[0])}" cy="${f(s.head[1])}" r="${f(R.head + cut)}"/>`
  out += `<circle class="fig-near" cx="${f(s.head[0])}" cy="${f(s.head[1])}" r="${R.head}"/>`
  out += limb(s.arms[0], 'arm', 'fig-cut', cut) + limb(s.arms[0], 'arm', 'fig-near')
  out += decor(spec, s, k, true, box.h * 0.03)
  return out
}

/* ---------- Schema da allenatore ---------- */

function stick(s: Skeleton, cls: string): string {
  const seg = (a: Pt, b: Pt) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`
  let out = `<g class="${cls}">`
  for (const c of [s.legs[0], s.arms[0]]) {
    out += seg(c.base, c.mid) + seg(c.mid, c.end)
    if (c.tip) out += seg(c.end, c.tip)
  }
  out += seg(s.hip, s.spine) + seg(s.spine, s.shoulder) + seg(s.shoulder, s.neck)
  out += `<circle cx="${f(s.head[0])}" cy="${f(s.head[1])}" r="${LEN.head}"/></g>`
  return out
}

function keyAngle(s: Skeleton, key: NonNullable<FigureSpec['key']>, box: Box): string {
  const [a, p, c] =
    key === 'elbow'
      ? [s.shoulder, s.arms[0].mid, s.arms[0].end]
      : key === 'knee'
        ? [s.hip, s.legs[0].mid, s.legs[0].end]
        : [s.shoulder, s.hip, s.legs[0].mid]
  const a1 = Math.atan2(a[1] - p[1], a[0] - p[0])
  let diff = Math.atan2(c[1] - p[1], c[0] - p[0]) - a1
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  const r = box.h * 0.07
  const end = a1 + diff
  const m = a1 + diff / 2
  const tr = r + box.h * 0.08
  return (
    `<path class="fig-arc" d="M${f(p[0] + Math.cos(a1) * r)} ${f(p[1] + Math.sin(a1) * r)}A${f(r)} ${f(r)} 0 0 ${diff > 0 ? 1 : 0} ${f(p[0] + Math.cos(end) * r)} ${f(p[1] + Math.sin(end) * r)}"/>` +
    `<text class="fig-num" x="${f(p[0] + Math.cos(m) * tr)}" y="${f(p[1] + Math.sin(m) * tr)}" font-size="${f(box.h * 0.065)}" text-anchor="middle" dominant-baseline="middle">${Math.round((Math.abs(diff) * 180) / Math.PI)}°</text>`
  )
}

function tracePoint(s: Skeleton, which: NonNullable<FigureSpec['trace']>): Pt {
  if (which === 'shoulder') return s.shoulder
  if (which === 'hip') return s.hip
  if (which === 'ankle') return s.legs[0].end
  return s.arms[0].end
}

/** Schema da allenatore: fase in corso, scia del movimento, percorso di un punto e angolo misurato. */
export function renderCoach(spec: FigureSpec, time: number, box: Box): string {
  const { k, phase } = timeline(spec, time)
  const s = solve(poseAt(spec, time))
  let out = ''
  if (spec.ground !== false) {
    out += `<line class="fig-ground" x1="${f(box.x)}" y1="${GROUND}" x2="${f(box.x + box.w)}" y2="${GROUND}"/>`
  }
  if (spec.trace) {
    const cycle = cycleLength(spec)
    const pts: string[] = []
    for (let i = 0; i <= 32; i++) {
      const p = tracePoint(solve(poseAt(spec, (cycle * i) / 32)), spec.trace)
      pts.push(`${f(p[0])},${f(p[1])}`)
    }
    out += `<polyline class="fig-trace" points="${pts.join(' ')}"/>`
  }
  out += decor(spec, s, k, false, box.h * 0.025)
  for (const [dt, cls] of [[0.45, 'fig-ghost fig-ghost-1'], [0.3, 'fig-ghost fig-ghost-2'], [0.15, 'fig-ghost fig-ghost-3']] as const) {
    out += stick(solve(poseAt(spec, time - dt)), cls)
  }
  out += stick(s, 'fig-line')
  out += decor(spec, s, k, true, box.h * 0.025)
  const joints = [s.legs[0].end, s.legs[0].mid, s.hip, s.shoulder, s.arms[0].mid, s.arms[0].end]
  for (const p of joints) out += `<circle class="fig-joint" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(box.h * 0.018)}"/>`
  if (spec.key) out += keyAngle(s, spec.key, box)
  out += `<text class="fig-phase" x="${f(box.x + box.w * 0.04)}" y="${f(box.y + box.h * 0.14)}" font-size="${f(box.h * 0.12)}">${spec.phases[phase]}</text>`
  return out
}
