import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'

// ─── Canvas ──────────────────────────────────────────────────────────────────
const W  = 480
const H  = 520
const PW = W / 2          // 240 — panel width
const PH = H / 2          // 260 — panel height
const SCALE       = 1.0
const FLOOR_LOCAL = 225   // px from panel top where y=0 body-space sits
const SUP_CY      = 155   // px from panel top where z=0 sits (superior view)

// ─── Types ───────────────────────────────────────────────────────────────────
type V3 = [number, number, number]   // [x, y, z]  y=up  z=toward viewer

// ─── Beat timings (30fps) ────────────────────────────────────────────────────
const T      = { beat1: 18, beat2: 52, beat3: 86, golpe: 120, end: 152 }
const SP     = { damping: 13, mass: 0.8, stiffness: 115 }
const SP_HIP = { damping: 7,  mass: 0.4, stiffness: 210 }

// ─── Projections & depth functions ───────────────────────────────────────────
type ProjFn  = (v: V3) => [number, number]
type DepthFn = (v: V3) => number

// Orthographic projections
const frente  : ProjFn = ([x, y   ]) => [ x,  y]
const costado : ProjFn = ([ , y, z]) => [ z,  y]
const diagonal: ProjFn = ([x, y, z]) => [x * 0.71 + z * 0.71, y]  // camera: front-left
const superior: ProjFn = ([x,  , z]) => [ x, -z]                   // top-down

// Depth: higher value = closer to camera = drawn last (on top)
const depthFrente  : DepthFn = ([, , z]) =>  z
const depthCostado : DepthFn = ([x    ]) =>  x   // camera at +X
const depthDiagonal: DepthFn = ([x, , z]) => z - x  // front-left: high z + low x = close
const depthSuperior: DepthFn = ([, y   ]) =>  y   // higher y = on top when looking down

type Panel = {
  ox: number; oy: number; label: string
  proj: ProjFn; depth: DepthFn; isTop: boolean
}
const PANELS: Panel[] = [
  { ox: 0,  oy: 0,  label: 'SUPERIOR', proj: superior,  depth: depthSuperior,  isTop: true  },
  { ox: PW, oy: 0,  label: 'FRENTE',   proj: frente,    depth: depthFrente,    isTop: false },
  { ox: 0,  oy: PH, label: 'COSTADO',  proj: costado,   depth: depthCostado,   isTop: false },
  { ox: PW, oy: PH, label: '45°',      proj: diagonal,  depth: depthDiagonal,  isTop: false },
]

// ─── Screen mapping ───────────────────────────────────────────────────────────
function toScreen(
  [bx, by]: [number, number],
  ox: number, oy: number, isTop: boolean
): [number, number] {
  if (isTop) return [ox + PW / 2 + bx * SCALE, oy + SUP_CY + by * SCALE]
  return [ox + PW / 2 + bx * SCALE, oy + FLOOR_LOCAL - by * SCALE]
}

// ─── Body builder ─────────────────────────────────────────────────────────────
function buildBody(
  lFx: number, lFy: number, lFz: number,
  rFx: number, rFy: number, rFz: number,
  hipSnap: number,
  flex: number,
  armBeat: number   // -1..+1 beat-driven oscillation
): Record<string, V3> {
  const hipX = (lFx + rFx) / 2 + hipSnap
  const hipY = 93 - flex * 9
  const hipZ = (lFz + rFz) / 2

  const lean   = hipSnap * 0.08
  const chest: V3 = [hipX + lean,       125, hipZ * 0.3 + 2]
  const neck:  V3 = [hipX + lean * 1.3, 152, hipZ * 0.15 + 1]
  const head:  V3 = [hipX + lean * 1.5, 172, hipZ * 0.08]

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

  // Toes: extend from foot forward-outward (shows foot shape in costado/45°)
  const lToe: V3 = [lFx - 5, lFy, lFz + 15]
  const rToe: V3 = [rFx + 5, rFy, rFz + 15]

  // Shoulder twist (gives content to COSTADO view)
  const twist = hipSnap * -0.55
  const lSh: V3 = [hipX - 20 + lean, 147, chest[2] + twist]
  const rSh: V3 = [hipX + 20 + lean, 147, chest[2] - twist]

  // Arms — FIX: elbows significantly forward in Z + hands ABOVE elbows
  // In bachata: relaxed bent-elbow hold, forearms angle upward
  const armFwd = 18                          // baseline Z offset (elbows in front of torso)
  const swing  = -hipSnap * 0.4 + armBeat * 6  // golpe counter + beat pulse

  const lEl: V3 = [
    hipX - 23 + lean + swing * 0.3,
    108,                                   // elbow sits slightly above hip
    chest[2] + armFwd + twist * 0.6 + swing * 0.4,
  ]
  const rEl: V3 = [
    hipX + 23 + lean - swing * 0.3,
    108,
    chest[2] + armFwd - twist * 0.6 - swing * 0.4,
  ]

  // Hands: forearm bends UPWARD from elbow (natural "open hold" position)
  const lHa: V3 = [
    hipX - 16 + lean + swing * 0.6,
    122,                                   // above elbow — clave del fix
    chest[2] + armFwd + 9 + twist * 0.8 + swing * 0.6,
  ]
  const rHa: V3 = [
    hipX + 16 + lean - swing * 0.6,
    122,
    chest[2] + armFwd + 9 - twist * 0.8 - swing * 0.6,
  ]

  // Fingertips: extend from wrist in elbow→hand direction
  const extend = (a: V3, b: V3, dist: number): V3 => {
    const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2]
    const len = Math.hypot(dx, dy, dz) || 1
    return [b[0]+dx/len*dist, b[1]+dy/len*dist, b[2]+dz/len*dist]
  }
  const lTip = extend(lEl, lHa, 9)
  const rTip = extend(rEl, rHa, 9)

  return {
    lFoot: [lFx, lFy, lFz], rFoot: [rFx, rFy, rFz],
    lToe, rToe,
    lKnee, rKnee,
    lHip, rHip,
    hipC: [hipX, hipY, hipZ],
    chest, neck, head,
    lSh, rSh, lEl, rEl, lHa, rHa, lTip, rTip,
  }
}

// ─── Figure renderer (depth-sorted per view) ──────────────────────────────────
function renderFigure(
  joints: Record<string, V3>,
  proj: ProjFn, depthFn: DepthFn,
  ox: number, oy: number,
  isTop: boolean, isGolpe: boolean
): React.ReactNode[] {
  const s = (n: string) => toScreen(proj(joints[n]), ox, oy, isTop)
  const d = (n: string) => depthFn(joints[n])
  const els: React.ReactNode[] = []

  // Which side is in front (per view, dynamically)
  const leftLegFront = d('lFoot') >= d('rFoot')
  const leftArmFront = d('lEl')   >= d('rEl')

  const cap = (key: string, a: string, b: string, color: string, w: number, opacity = 1) => {
    const [x1, y1] = s(a), [x2, y2] = s(b)
    els.push(
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={w} strokeLinecap="round" opacity={opacity} />
    )
  }

  // Helper to draw one full leg
  const drawLeg = (side: 'l' | 'r', opacity = 1) => {
    const [thC, shC] = side === 'l'
      ? ['#10b981', '#059669'] : ['#047857', '#065f46']
    cap(`${side}thigh`, `${side}Hip`,  `${side}Knee`, thC, 14, opacity)
    cap(`${side}shin`,  `${side}Knee`, `${side}Foot`, shC,  9, opacity)
    cap(`${side}toe`,   `${side}Foot`, `${side}Toe`,  thC,  7, opacity)
  }

  // Helper to draw one full arm
  const drawArm = (side: 'l' | 'r', opacity = 1) => {
    const [uaC, faC] = side === 'l'
      ? ['#8b5cf6', '#a78bfa'] : ['#6d28d9', '#7c3aed']
    cap(`${side}ua`,   `${side}Sh`,  `${side}El`,  uaC, 7, opacity)
    cap(`${side}fa`,   `${side}El`,  `${side}Ha`,  faC, 5, opacity)
    cap(`${side}hand`, `${side}Ha`,  `${side}Tip`, faC, 3, opacity)
  }

  // ── Draw order: back → front ──────────────────────────────────────────────

  // Back leg
  drawLeg(leftLegFront ? 'r' : 'l', 0.75)

  // Back arm
  drawArm(leftArmFront ? 'r' : 'l', 0.72)

  // Torso polygon (shoulder → hip trapezoid)
  const tPts = ['lSh', 'rSh', 'rHip', 'lHip'].map(n => s(n).join(',')).join(' ')
  els.push(<polygon key="torso-body" points={tPts} fill="#3b0764" opacity={0.93} />)

  // Hip bar, shoulder bar, spine, neck
  cap('hipbar', 'lHip', 'rHip', '#5b21b6', 11)
  cap('shbar',  'lSh',  'rSh',  '#4c1d95', 10)
  cap('spine',  'hipC', 'neck', '#5b21b6',  8)
  cap('nk',     'neck', 'head', '#6d28d9',  7)

  // Front leg
  drawLeg(leftLegFront ? 'l' : 'r')

  // Front arm
  drawArm(leftArmFront ? 'l' : 'r')

  // ── Joints always on top ──────────────────────────────────────────────────

  // Hip center
  const [hipx, hipy] = s('hipC')
  if (isGolpe) els.push(
    <circle key="hipglow" cx={hipx} cy={hipy} r={13} fill="#f59e0b" opacity={0.18} />
  )
  els.push(<circle key="hip" cx={hipx} cy={hipy} r={5} fill={isGolpe ? '#f59e0b' : '#a78bfa'} />)

  // Knees
  ;(['lKnee', 'rKnee'] as const).forEach((jt, i) => {
    const [kx, ky] = s(jt)
    els.push(<circle key={`k${i}`} cx={kx} cy={ky} r={5} fill={i === 0 ? '#064e3b' : '#022c22'} />)
  })

  // Feet
  ;['lFoot', 'rFoot'].forEach((jt, i) => {
    const [fx, fy] = s(jt)
    const [fill, stroke] = i === 0 ? ['#34d399', '#059669'] : ['#059669', '#047857']
    els.push(<circle key={`f${i}`} cx={fx} cy={fy} r={7} fill={fill} stroke={stroke} strokeWidth={1.5} />)
  })

  // Head (amber with subtle highlight)
  const [hx, hy] = s('head')
  els.push(<circle key="head"    cx={hx}     cy={hy}     r={13} fill="#fbbf24" />)
  els.push(<circle key="head-hi" cx={hx - 4} cy={hy - 4} r={4.5} fill="#fde68a" opacity={0.4} />)

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

  // ── Foot Y lift (parabolic arc)
  const liftAmount = 14
  const lFy = (() => {
    const t1 = interpolate(frame, [T.beat1, (T.beat1+T.beat2)/2, T.beat2], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const t3 = interpolate(frame, [T.beat3, (T.beat3+T.golpe)/2, T.golpe], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t1, t3)
  })()
  const rFy = (() => {
    const t2 = interpolate(frame, [T.beat2, (T.beat2+T.beat3)/2, T.beat3], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const tg = interpolate(frame, [T.golpe, (T.golpe+T.end)/2, T.end],     [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t2, tg)
  })()

  // ── Foot Z arc (forward arc when stepping — adds content to COSTADO/45°)
  const arc = (a: number, b: number) =>
    interpolate(frame, [a, (a+b)/2, b], [0, 14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
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

  // ── Beat-driven arm pulse (arms oscillate with each step, not just golpe)
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
          <rect key={i} x={ox + 2} y={oy + 2} width={PW - 4} height={PH - 4}
            rx={10} fill="#080f1c" />
        ))}

        {/* Dividers */}
        <line x1={PW} y1={12} x2={PW} y2={H - 12} stroke="#1e293b" strokeWidth={1} />
        <line x1={0}  y1={PH} x2={W}  y2={PH}     stroke="#1e293b" strokeWidth={1} />

        {/* Floor lines (non-top panels only) */}
        {PANELS.filter(p => !p.isTop).map(({ ox, oy }, i) => (
          <line key={i}
            x1={ox + 16} y1={oy + FLOOR_LOCAL}
            x2={ox + PW - 16} y2={oy + FLOOR_LOCAL}
            stroke="#1e293b" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* Superior: compass arrow */}
        <text x={PANELS[0].ox + PW / 2} y={PANELS[0].oy + SUP_CY - 58}
          textAnchor="middle" fill="#1e293b" fontSize={8} fontFamily="system-ui">▲ frente</text>

        {/* View labels */}
        {PANELS.map(({ ox, oy, label }, i) => (
          <text key={i} x={ox + PW / 2} y={oy + 18}
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
        <g transform={`translate(8, ${H - 18})`}>
          <circle cx={6}   cy={0} r={5} fill="#34d399" />
          <text x={15}  y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie I</text>
          <circle cx={52}  cy={0} r={5} fill="#059669" />
          <text x={61}  y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie D</text>
          <circle cx={98}  cy={0} r={5} fill="#5b21b6" />
          <text x={107} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Torso</text>
          <circle cx={148} cy={0} r={5} fill="#fbbf24" />
          <text x={157} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Cabeza</text>
        </g>

        {/* Beat badge */}
        {beat && (
          <g opacity={labelAlpha}>
            <rect x={W / 2 - 36} y={H - 36} width={72} height={26} rx={13}
              fill={beat.golpe ? '#451a03' : '#022c22'} />
            <text x={W / 2} y={H - 18} textAnchor="middle"
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
