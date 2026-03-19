import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W  = 480, H = 520
const PW = W / 2, PH = H / 2
const SCALE = 1.0
const FLOOR_LOCAL = 225   // px from panel-top where y=0 body-space sits
const SUP_CY      = 155   // px from panel-top where z=0 sits (superior view)

type V3 = [number, number, number]   // [x, y, z]  y=up  z=toward viewer
type P2 = [number, number]

// ─── Beat timings ─────────────────────────────────────────────────────────────
const T      = { beat1: 18, beat2: 52, beat3: 86, golpe: 120, end: 152 }
const SP     = { damping: 13, mass: 0.8, stiffness: 115 }
const SP_HIP = { damping: 7,  mass: 0.4, stiffness: 210 }

// ─── Colors (fitted outfit) ───────────────────────────────────────────────────
const C = {
  skin:    '#f59e0b',   // amber skin (head, hands)
  skinHi:  '#fde68a',   // highlight
  skinSh:  '#d97706',   // shadow
  shirt:   '#1d4ed8',   // blue shirt
  shirtSh: '#1e3a8a',   // shirt shadow
  shirtHi: '#3b82f6',   // shirt highlight
  pants:   '#1e293b',   // dark pants
  pantsSh: '#0f172a',   // shadow / back leg
  shoe:    '#0c0a09',   // near-black shoes
}

// ─── Projections & depth functions ───────────────────────────────────────────
type ProjFn  = (v: V3) => P2
type DepthFn = (v: V3) => number

const frente:   ProjFn = ([x, y   ]) => [ x,  y]
const costado:  ProjFn = ([ , y, z]) => [ z,  y]
const diagonal: ProjFn = ([x, y, z]) => [x * 0.71 + z * 0.71, y]  // front-left 45°
const superior: ProjFn = ([x,  , z]) => [ x, -z]

// Depth: higher = closer to camera = drawn last (on top)
const dFrente:   DepthFn = ([, , z]) =>  z
const dCostado:  DepthFn = ([x    ]) =>  x
const dDiagonal: DepthFn = ([x, , z]) => z - x
const dSuperior: DepthFn = ([, y   ]) =>  y

type Panel = { ox:number; oy:number; label:string; proj:ProjFn; depth:DepthFn; isTop:boolean }
const PANELS: Panel[] = [
  { ox:0,  oy:0,  label:'SUPERIOR', proj:superior,  depth:dSuperior,  isTop:true  },
  { ox:PW, oy:0,  label:'FRENTE',   proj:frente,    depth:dFrente,    isTop:false },
  { ox:0,  oy:PH, label:'COSTADO',  proj:costado,   depth:dCostado,   isTop:false },
  { ox:PW, oy:PH, label:'45°',      proj:diagonal,  depth:dDiagonal,  isTop:false },
]

function toScreen([bx, by]: P2, ox: number, oy: number, isTop: boolean): P2 {
  if (isTop) return [ox + PW / 2 + bx * SCALE, oy + SUP_CY + by * SCALE]
  return [ox + PW / 2 + bx * SCALE, oy + FLOOR_LOCAL - by * SCALE]
}

// ─── Tapered capsule path ─────────────────────────────────────────────────────
// Draws a filled shape between two 2D points, wider at A (wA) and narrower at B (wB)
function capsule([ax, ay]: P2, [bx, by]: P2, wA: number, wB: number): string {
  const dx = bx - ax, dy = by - ay
  const len = Math.hypot(dx, dy)
  if (len < 1) return ''
  const px = -dy / len, py = dx / len   // perpendicular unit vector
  const f = (n: number) => n.toFixed(1)
  const c1 = [ax + wA * px, ay + wA * py]  // side-1 at A
  const c2 = [ax - wA * px, ay - wA * py]  // side-2 at A
  const c3 = [bx - wB * px, by - wB * py]  // side-2 at B
  const c4 = [bx + wB * px, by + wB * py]  // side-1 at B
  // Trace outline: c1 → c4 → (arc around B, sweep CW) → c3 → c2 → (arc around A, sweep CCW) → close
  return [
    `M${f(c1[0])} ${f(c1[1])}`,
    `L${f(c4[0])} ${f(c4[1])}`,
    `A${wB} ${wB} 0 0 1 ${f(c3[0])} ${f(c3[1])}`,
    `L${f(c2[0])} ${f(c2[1])}`,
    `A${wA} ${wA} 0 0 0 ${f(c1[0])} ${f(c1[1])}Z`,
  ].join('')
}

// ─── Body builder ─────────────────────────────────────────────────────────────
function buildBody(
  lFx: number, lFy: number, lFz: number,
  rFx: number, rFy: number, rFz: number,
  hipSnap: number, flex: number, armBeat: number
): Record<string, V3> {
  const hipX = (lFx + rFx) / 2 + hipSnap
  const hipY = 93 - flex * 9
  const hipZ = (lFz + rFz) / 2

  const lean   = hipSnap * 0.08
  const chest: V3  = [hipX + lean,       125, hipZ * 0.3 + 2]
  const neck:  V3  = [hipX + lean * 1.3, 152, hipZ * 0.15 + 1]
  const head:  V3  = [hipX + lean * 1.5, 172, hipZ * 0.08]

  // Waist — gives the torso polygon a realistic hourglass shape
  const lWaist: V3 = [hipX - 12 + lean, 113, chest[2] * 0.7]
  const rWaist: V3 = [hipX + 12 + lean, 113, chest[2] * 0.7]

  const lHip: V3 = [hipX - 13, hipY, hipZ]
  const rHip: V3 = [hipX + 13, hipY, hipZ]

  const lKnee: V3 = [
    (lFx + lHip[0]) / 2 - 1,
    (lFy + lHip[1]) / 2 + flex * 4,
    lFz * 0.6 + 4,
  ]
  const rKnee: V3 = [
    (rFx + rHip[0]) / 2 + 1,
    (rFy + rHip[1]) / 2 + flex * 4,
    rFz * 0.6 - 4,
  ]

  // Toes extend forward-outward from ankle (visible in costado/45°)
  const lToe: V3 = [lFx - 5, lFy, lFz + 16]
  const rToe: V3 = [rFx + 5, rFy, rFz + 16]

  // Shoulder twist provides Z-content for the COSTADO view
  const twist = hipSnap * -0.55
  const lSh: V3 = [hipX - 20 + lean, 147, chest[2] + twist]
  const rSh: V3 = [hipX + 20 + lean, 147, chest[2] - twist]

  // Arms — bent forward with elbows in front of body (fixes "dead arms")
  const armFwd = 18                        // Z baseline for elbows (forward of torso)
  const swing  = -hipSnap * 0.4 + armBeat * 6

  const lEl: V3 = [hipX - 23 + lean + swing * 0.3, 108, chest[2] + armFwd + twist * 0.6 + swing * 0.4]
  const rEl: V3 = [hipX + 23 + lean - swing * 0.3, 108, chest[2] + armFwd - twist * 0.6 - swing * 0.4]

  // Hands: forearm bends UPWARD from elbow (key fix — hands above elbows)
  const lHa: V3 = [hipX - 16 + lean + swing * 0.6, 122, chest[2] + armFwd + 9 + twist * 0.8 + swing * 0.6]
  const rHa: V3 = [hipX + 16 + lean - swing * 0.6, 122, chest[2] + armFwd + 9 - twist * 0.8 - swing * 0.6]

  // Fingertips: extend from wrist in elbow→hand direction
  const ext = (a: V3, b: V3, d: number): V3 => {
    const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2]
    const l = Math.hypot(dx, dy, dz) || 1
    return [b[0]+dx/l*d, b[1]+dy/l*d, b[2]+dz/l*d]
  }
  const lTip = ext(lEl, lHa, 10)
  const rTip = ext(rEl, rHa, 10)

  return {
    lFoot: [lFx, lFy, lFz], rFoot: [rFx, rFy, rFz],
    lToe, rToe, lKnee, rKnee,
    lHip, rHip, lWaist, rWaist,
    hipC: [hipX, hipY, hipZ],
    chest, neck, head,
    lSh, rSh, lEl, rEl, lHa, rHa, lTip, rTip,
  }
}

// ─── Figure renderer ──────────────────────────────────────────────────────────
function renderFigure(
  joints: Record<string, V3>,
  proj: ProjFn, depthFn: DepthFn,
  ox: number, oy: number, isTop: boolean, isGolpe: boolean
): React.ReactNode[] {
  const s = (n: string): P2 => toScreen(proj(joints[n]), ox, oy, isTop)
  const d = (n: string) => depthFn(joints[n])
  const els: React.ReactNode[] = []

  // Which sides are closer to this camera
  const leftLegFront = d('lFoot') >= d('rFoot')
  const leftArmFront = d('lEl')   >= d('rEl')

  // Filled tapered limb
  const Limb = (key: string, a: string, b: string, wA: number, wB: number, fill: string, opacity = 1) => {
    const path = capsule(s(a), s(b), wA, wB)
    if (path) els.push(<path key={key} d={path} fill={fill} opacity={opacity} />)
  }
  // Sphere joint (smooth connector + highlight ring)
  const Joint = (key: string, jt: string, r: number, fill: string, opacity = 1) => {
    const [cx, cy] = s(jt)
    els.push(<circle key={key}    cx={cx}   cy={cy}   r={r}     fill={fill} opacity={opacity} />)
    els.push(<circle key={key+'h'} cx={cx-r*0.3} cy={cy-r*0.35} r={r*0.4} fill="#fff" opacity={opacity*0.18} />)
  }

  const drawLeg = (side: 'l' | 'r', front: boolean) => {
    const op  = front ? 1 : 0.65
    const tFill  = front ? C.pants   : C.pantsSh
    const sFill  = front ? C.pants   : C.pantsSh
    Limb(`${side}thigh`, `${side}Hip`,  `${side}Knee`, 13, 9,   tFill, op)
    Limb(`${side}shin`,  `${side}Knee`, `${side}Foot`, 9,  6.5, sFill, op)
    Limb(`${side}shoe`,  `${side}Foot`, `${side}Toe`,  7,  4,   C.shoe, op)
    Joint(`${side}knee`, `${side}Knee`, 7, tFill, op)
    Joint(`${side}ank`,  `${side}Foot`, 5.5, C.shoe, op)
  }

  const drawArm = (side: 'l' | 'r', front: boolean) => {
    const op   = front ? 1 : 0.65
    const fill = front ? C.shirt : C.shirtSh
    Limb(`${side}ua`,   `${side}Sh`,  `${side}El`,  9,   7,   fill, op)
    Limb(`${side}fa`,   `${side}El`,  `${side}Ha`,  7,   4.5, fill, op)
    Limb(`${side}hand`, `${side}Ha`,  `${side}Tip`, 4.5, 2,   C.skin, op)
    Joint(`${side}elbow`, `${side}El`, 5.5, fill, op)
    Joint(`${side}wrist`, `${side}Ha`, 3.5, C.skin, op)
  }

  // ── Draw order: back → front ──────────────────────────────────────────────

  // Back leg
  drawLeg(leftLegFront ? 'r' : 'l', false)

  // Back arm
  drawArm(leftArmFront ? 'r' : 'l', false)

  // Torso — 6-point polygon with waist taper (lSh → rSh → rWaist → rHip → lHip → lWaist)
  const tPts = ['lSh','rSh','rWaist','rHip','lHip','lWaist'].map(n => s(n).join(',')).join(' ')
  els.push(<polygon key="torso" points={tPts} fill={C.shirt} opacity={0.96} />)

  // Torso structural elements: hip bar, shoulder bar, spine, neck
  Limb('hipbar', 'lHip', 'rHip', 9,   9,   C.shirtSh)
  Limb('shbar',  'lSh',  'rSh',  8,   8,   C.shirtSh)
  Limb('spine',  'hipC', 'neck', 7.5, 5.5, C.shirtSh)
  Limb('nk',     'neck', 'head', 5.5, 5,   C.skin)

  // Shoulder sphere joints (on top of torso edge)
  Joint('lsh', 'lSh', 9,   C.shirt)
  Joint('rsh', 'rSh', 9,   C.shirt)
  Joint('hip', 'hipC', 5, isGolpe ? '#f59e0b' : 'rgba(251,191,36,0.55)')

  // Golpe glow
  if (isGolpe) {
    const [hpx, hpy] = s('hipC')
    els.push(<circle key="hipglow" cx={hpx} cy={hpy} r={13} fill="#f59e0b" opacity={0.2} />)
  }

  // Front leg
  drawLeg(leftLegFront ? 'l' : 'r', true)

  // Front arm
  drawArm(leftArmFront ? 'l' : 'r', true)

  // ── Head (always on top) ─────────────────────────────────────────────────
  const [hx, hy] = s('head')
  // Shadow (neck shadow under head)
  els.push(<circle key="head-sh" cx={hx+2} cy={hy+4} r={11} fill={C.skinSh} opacity={0.3} />)
  // Main head sphere
  els.push(<circle key="head" cx={hx} cy={hy} r={13} fill={C.skin} />)
  // Specular highlight
  els.push(<circle key="head-hi" cx={hx-4} cy={hy-4} r={5} fill={C.skinHi} opacity={0.45} />)

  return els
}

// ─── Main component ───────────────────────────────────────────────────────────
export const BasicLateralStep3D: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Left foot X (steps left twice)
  const lFx = (() => {
    const X0 = -16, X1 = -64, X2 = -100
    if (frame < T.beat1) return X0
    if (frame < T.beat2) return spring({ frame: frame - T.beat1, fps, config: SP, from: X0, to: X1 })
    if (frame < T.beat3) return X1
    if (frame < T.golpe) return spring({ frame: frame - T.beat3, fps, config: SP, from: X1, to: X2 })
    return X2
  })()

  // ── Right foot X (joins twice)
  const rFx = (() => {
    const X0 = 16, X1 = -24, X2 = -62
    if (frame < T.beat2) return X0
    if (frame < T.beat3) return spring({ frame: frame - T.beat2, fps, config: SP, from: X0, to: X1 })
    if (frame < T.golpe) return X1
    return spring({ frame: frame - T.golpe, fps, config: SP, from: X1, to: X2 })
  })()

  // ── Foot Y lift (parabolic arc while moving)
  const lift = 14
  const lFy = (() => {
    const t1 = interpolate(frame, [T.beat1, (T.beat1+T.beat2)/2, T.beat2], [0,lift,0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
    const t3 = interpolate(frame, [T.beat3, (T.beat3+T.golpe)/2, T.golpe], [0,lift,0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
    return Math.max(t1, t3)
  })()
  const rFy = (() => {
    const t2 = interpolate(frame, [T.beat2, (T.beat2+T.beat3)/2, T.beat3], [0,lift,0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
    const tg = interpolate(frame, [T.golpe, (T.golpe+T.end)/2, T.end],     [0,lift,0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
    return Math.max(t2, tg)
  })()

  // ── Foot Z arc (forward arc while stepping — adds content to costado/45°)
  const arc = (a: number, b: number) =>
    interpolate(frame, [a, (a+b)/2, b], [0, 14, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
  const lFz = Math.max(arc(T.beat1, T.beat2), arc(T.beat3, T.golpe))
  const rFz = Math.max(arc(T.beat2, T.beat3), arc(T.golpe, T.end))

  // ── Hip snap on golpe
  const hipSnap = frame >= T.golpe
    ? spring({ frame: frame - T.golpe, fps, config: SP_HIP, from: 0, to: -22 })
    : 0

  // ── Knee flex on golpe
  const flex = frame >= T.golpe
    ? spring({ frame: frame - T.golpe, fps, config: SP_HIP, from: 0, to: 1 })
    : 0

  // ── Beat-driven arm pulse (natural bachata arm swing synced to footwork)
  const armBeat = interpolate(
    frame,
    [0, T.beat1, T.beat2, T.beat3, T.golpe, T.end],
    [0, 1, -0.4, 1, 0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const joints  = buildBody(lFx, lFy, lFz, rFx, rFy, rFz, hipSnap, flex, armBeat)
  const isGolpe = frame >= T.golpe

  // ── Beat label
  const beat = (() => {
    if (frame < T.beat1) return null
    if (frame < T.beat2) return { text: '①', golpe: false }
    if (frame < T.beat3) return { text: '②', golpe: false }
    if (frame < T.golpe) return { text: '③', golpe: false }
    return { text: 'GOLPE', golpe: true }
  })()
  const labelAlpha = beat
    ? interpolate(frame, [T.beat1, T.beat1 + 7], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

        {/* Panel backgrounds */}
        {PANELS.map(({ ox, oy }, i) => (
          <rect key={i} x={ox+2} y={oy+2} width={PW-4} height={PH-4} rx={10} fill="#080f1c" />
        ))}

        {/* Grid dividers */}
        <line x1={PW} y1={12} x2={PW} y2={H-12} stroke="#1e293b" strokeWidth={1} />
        <line x1={0}  y1={PH} x2={W}  y2={PH}   stroke="#1e293b" strokeWidth={1} />

        {/* Floor reference lines (non-top panels only) */}
        {PANELS.filter(p => !p.isTop).map(({ ox, oy }, i) => (
          <line key={i} x1={ox+16} y1={oy+FLOOR_LOCAL} x2={ox+PW-16} y2={oy+FLOOR_LOCAL}
            stroke="#1e293b" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* Superior compass */}
        <text x={PANELS[0].ox+PW/2} y={PANELS[0].oy+SUP_CY-60}
          textAnchor="middle" fill="#1e293b" fontSize={8} fontFamily="system-ui">▲ frente</text>

        {/* Panel labels */}
        {PANELS.map(({ ox, oy, label }, i) => (
          <text key={i} x={ox+PW/2} y={oy+18}
            textAnchor="middle" fill="#334155"
            fontSize={9} fontFamily="system-ui" fontWeight="700" letterSpacing="1.5">
            {label}
          </text>
        ))}

        {/* Figures — depth-sorted per panel */}
        {PANELS.map(({ ox, oy, proj, depth, isTop }, i) => (
          <g key={i}>
            {renderFigure(joints, proj, depth, ox, oy, isTop, isGolpe)}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(8,${H-18})`}>
          <rect x={0} y={-8} width={4} height={12} rx={2} fill={C.pants} />
          <text x={8}  y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie I</text>
          <rect x={44} y={-8} width={4} height={12} rx={2} fill={C.pantsSh} />
          <text x={52} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie D</text>
          <rect x={88} y={-8} width={4} height={12} rx={2} fill={C.shirt} />
          <text x={96} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Torso</text>
          <circle cx={134} cy={0} r={4.5} fill={C.skin} />
          <text x={142} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Cabeza</text>
        </g>

        {/* Beat badge */}
        {beat && (
          <g opacity={labelAlpha}>
            <rect x={W/2-36} y={H-36} width={72} height={26} rx={13}
              fill={beat.golpe ? '#451a03' : '#022c22'} />
            <text x={W/2} y={H-18} textAnchor="middle"
              fill={beat.golpe ? '#fbbf24' : '#34d399'}
              fontSize={beat.golpe ? 10 : 14} fontWeight="bold" fontFamily="system-ui">
              {beat.text}
            </text>
          </g>
        )}

      </svg>
    </AbsoluteFill>
  )
}
