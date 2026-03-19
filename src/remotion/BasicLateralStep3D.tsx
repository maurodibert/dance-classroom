import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'

// ─── Canvas ──────────────────────────────────────────────────────────────────
const W  = 480
const H  = 520
const PW = W / 2          // 240 — panel width
const PH = H / 2          // 260 — panel height
const SCALE       = 1.0   // body-units → px
const FLOOR_LOCAL = 225   // px from panel top where y=0 body-space sits
const SUP_CY      = 155   // px from panel top where z=0 sits (superior view)

// ─── Types ───────────────────────────────────────────────────────────────────
type V3 = [number, number, number]   // [x, y, z]  y=up  z=toward viewer

// ─── Beat timings (30fps) ────────────────────────────────────────────────────
const T      = { beat1: 18, beat2: 52, beat3: 86, golpe: 120, end: 152 }
const SP     = { damping: 13, mass: 0.8, stiffness: 115 }
const SP_HIP = { damping: 7,  mass: 0.4, stiffness: 210 }

// ─── Projections (body-space → 2D) ───────────────────────────────────────────
type ProjFn = (v: V3) => [number, number]
const frente  : ProjFn = ([x, y   ]) => [ x,  y]
const costado : ProjFn = ([ , y, z]) => [ z,  y]
const diagonal: ProjFn = ([x, y, z]) => [x * 0.71 - z * 0.71, y]
const superior: ProjFn = ([x,  , z]) => [ x, -z]  // top-down: X=left-right, -Z=forward

type Panel = { ox: number; oy: number; label: string; proj: ProjFn; isTop: boolean }
const PANELS: Panel[] = [
  { ox: 0,  oy: 0,  label: 'SUPERIOR', proj: superior, isTop: true  },
  { ox: PW, oy: 0,  label: 'FRENTE',   proj: frente,   isTop: false },
  { ox: 0,  oy: PH, label: 'COSTADO',  proj: costado,  isTop: false },
  { ox: PW, oy: PH, label: '45°',      proj: diagonal, isTop: false },
]

// ─── Screen mapping ───────────────────────────────────────────────────────────
function toScreen(
  [bx, by]: [number, number],
  ox: number, oy: number,
  isTop: boolean
): [number, number] {
  if (isTop) return [ox + PW / 2 + bx * SCALE, oy + SUP_CY + by * SCALE]
  return [ox + PW / 2 + bx * SCALE, oy + FLOOR_LOCAL - by * SCALE]
}

// ─── Body builder ─────────────────────────────────────────────────────────────
function buildBody(
  lFx: number, lFy: number, lFz: number,
  rFx: number, rFy: number, rFz: number,
  hipSnap: number,
  flex: number
): Record<string, V3> {
  const hipX = (lFx + rFx) / 2 + hipSnap
  const hipY = 93 - flex * 9
  const hipZ = (lFz + rFz) / 2

  // Torso stays vertical; subtle counter-lean on hip snap
  const lean  = hipSnap * 0.08
  const chest: V3 = [hipX + lean,       125, hipZ * 0.3]
  const neck:  V3 = [hipX + lean * 1.3, 152, hipZ * 0.15]
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

  // Shoulder twist gives the COSTADO view interesting content
  const twist = hipSnap * -0.55
  const lSh: V3 = [hipX - 20 + lean, 147, hipZ + twist]
  const rSh: V3 = [hipX + 20 + lean, 147, hipZ - twist]

  // Arms counter-swing (natural rotation opposite to hip drift)
  const swing = -hipSnap * 0.35
  const lEl: V3 = [hipX - 24 + swing * 0.3, 118,  twist * 0.8 + swing * 0.5]
  const rEl: V3 = [hipX + 24 - swing * 0.3, 118, -twist * 0.8 - swing * 0.5]
  const lHa: V3 = [hipX - 28 + swing,        93,  twist * 1.2 + swing * 0.8]
  const rHa: V3 = [hipX + 28 - swing,        93, -twist * 1.2 - swing * 0.8]

  return {
    lFoot: [lFx, lFy, lFz],
    rFoot: [rFx, rFy, rFz],
    lKnee, rKnee,
    lHip, rHip,
    hipC: [hipX, hipY, hipZ],
    chest, neck, head,
    lSh, rSh, lEl, rEl, lHa, rHa,
  }
}

// ─── Figure renderer ──────────────────────────────────────────────────────────
// Uses thick capsules (stroke-width) + filled torso polygon for a solid, body-like look
function renderFigure(
  joints: Record<string, V3>,
  proj: ProjFn,
  ox: number, oy: number,
  isTop: boolean,
  isGolpe: boolean
): React.ReactNode[] {
  const s  = (n: string) => toScreen(proj(joints[n]), ox, oy, isTop)
  const els: React.ReactNode[] = []

  // Capsule segment helper
  const cap = (key: string, a: string, b: string, color: string, w: number, opacity = 1) => {
    const [x1, y1] = s(a)
    const [x2, y2] = s(b)
    els.push(
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={w} strokeLinecap="round" opacity={opacity} />
    )
  }

  // Filled polygon helper
  const poly = (key: string, names: string[], fill: string, opacity = 1) => {
    const pts = names.map(n => s(n).join(',')).join(' ')
    els.push(<polygon key={key} points={pts} fill={fill} opacity={opacity} />)
  }

  // ── Draw order: back → front ─────────────────────────────────────────────

  // 1. Right leg (back — darker emerald)
  cap('rthigh', 'rHip',  'rKnee', '#047857', 13, 0.8)
  cap('rshin',  'rKnee', 'rFoot', '#065f46',  8, 0.8)

  // 2. Right arm (back — darker violet)
  cap('rua', 'rSh', 'rEl', '#6d28d9', 6, 0.75)
  cap('rfa', 'rEl', 'rHa', '#6d28d9', 4, 0.75)

  // 3. Torso — filled trapezoid (shoulders wider than hips)
  poly('torso-body', ['lSh', 'rSh', 'rHip', 'lHip'], '#3b0764', 0.92)

  // 4. Hip and shoulder bars add volume to torso edges
  cap('hipbar', 'lHip', 'rHip', '#5b21b6', 11)
  cap('shbar',  'lSh',  'rSh',  '#4c1d95', 10)

  // 5. Spine + neck
  cap('spine', 'hipC', 'neck', '#5b21b6', 8)
  cap('nk',    'neck', 'head', '#6d28d9', 7)

  // 6. Left leg (front — bright emerald)
  cap('lthigh', 'lHip',  'lKnee', '#10b981', 13)
  cap('lshin',  'lKnee', 'lFoot', '#059669',  8)

  // 7. Left arm (front — lighter violet)
  cap('lua', 'lSh', 'lEl', '#8b5cf6', 6)
  cap('lfa', 'lEl', 'lHa', '#8b5cf6', 4)

  // 8. Head (amber circle with soft highlight)
  const [hx, hy] = s('head')
  els.push(<circle key="head"    cx={hx}     cy={hy}     r={12} fill="#fbbf24" />)
  els.push(<circle key="head-hi" cx={hx - 3} cy={hy - 3} r={4}  fill="#fde68a" opacity={0.45} />)

  // 9. Hip center dot (glows on golpe)
  const [hipx, hipy] = s('hipC')
  if (isGolpe) {
    els.push(<circle key="hipglow" cx={hipx} cy={hipy} r={13} fill="#f59e0b" opacity={0.18} />)
  }
  els.push(<circle key="hip" cx={hipx} cy={hipy} r={5} fill={isGolpe ? '#f59e0b' : '#a78bfa'} />)

  // 10. Knees (small dark circles)
  const [lkx, lky] = s('lKnee')
  const [rkx, rky] = s('rKnee')
  els.push(<circle key="lk" cx={lkx} cy={lky} r={5} fill="#064e3b" />)
  els.push(<circle key="rk" cx={rkx} cy={rky} r={5} fill="#022c22" />)

  // 11. Feet (circles with outline)
  const [lfx, lfy] = s('lFoot')
  const [rfx, rfy] = s('rFoot')
  els.push(<circle key="lf" cx={lfx} cy={lfy} r={7} fill="#34d399" stroke="#059669" strokeWidth={1.5} />)
  els.push(<circle key="rf" cx={rfx} cy={rfy} r={7} fill="#059669" stroke="#047857" strokeWidth={1.5} />)

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
  const liftAmount = 14
  const lFy = (() => {
    const t1 = interpolate(frame, [T.beat1, (T.beat1 + T.beat2) / 2, T.beat2], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const t3 = interpolate(frame, [T.beat3, (T.beat3 + T.golpe) / 2, T.golpe], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t1, t3)
  })()
  const rFy = (() => {
    const t2 = interpolate(frame, [T.beat2, (T.beat2 + T.beat3) / 2, T.beat3], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const tg = interpolate(frame, [T.golpe, (T.golpe + T.end) / 2, T.end],     [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t2, tg)
  })()

  // ── Foot Z arc (adds content to COSTADO and 45° views)
  const arc = (a: number, b: number) =>
    interpolate(frame, [a, (a + b) / 2, b], [0, 14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lFz = Math.max(arc(T.beat1, T.beat2), arc(T.beat3, T.golpe))
  const rFz = Math.max(arc(T.beat2, T.beat3), arc(T.golpe, T.end))

  // ── Hip snap on golpe
  const hipSnap = frame >= T.golpe
    ? spring({ frame: frame - T.golpe, fps, config: SP_HIP, from: 0, to: -22 })
    : 0

  // ── Knee flex on golpe
  const flex = frame >= T.golpe
    ? interpolate(
        spring({ frame: frame - T.golpe, fps, config: SP_HIP, from: 0, to: 1 }),
        [0, 1], [0, 1]
      )
    : 0

  const joints  = buildBody(lFx, lFy, lFz, rFx, rFy, rFz, hipSnap, flex)
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
        <line x1={PW}     y1={12} x2={PW}     y2={H - 12} stroke="#1e293b" strokeWidth={1} />
        <line x1={0}      y1={PH} x2={W}       y2={PH}     stroke="#1e293b" strokeWidth={1} />

        {/* Floor lines (only for non-top panels) */}
        {PANELS.filter(p => !p.isTop).map(({ ox, oy }, i) => (
          <line key={i}
            x1={ox + 16} y1={oy + FLOOR_LOCAL}
            x2={ox + PW - 16} y2={oy + FLOOR_LOCAL}
            stroke="#1e293b" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* Superior: "front" direction indicator */}
        <text x={PANELS[0].ox + PW / 2} y={PANELS[0].oy + SUP_CY - 60}
          textAnchor="middle" fill="#1e293b" fontSize={8} fontFamily="system-ui">▲ frente</text>

        {/* View labels */}
        {PANELS.map(({ ox, oy, label }, i) => (
          <text key={i} x={ox + PW / 2} y={oy + 18}
            textAnchor="middle" fill="#334155"
            fontSize={9} fontFamily="system-ui" fontWeight="700" letterSpacing="1.5">
            {label}
          </text>
        ))}

        {/* Figures — one per panel */}
        {PANELS.map(({ ox, oy, proj, isTop }, i) => (
          <g key={i}>
            {renderFigure(joints, proj, ox, oy, isTop, isGolpe)}
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(8, ${H - 18})`}>
          <circle cx={6}   cy={0} r={5} fill="#34d399" />
          <text x={15} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie I</text>
          <circle cx={52}  cy={0} r={5} fill="#059669" />
          <text x={61} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Pie D</text>
          <circle cx={98}  cy={0} r={5} fill="#5b21b6" />
          <text x={107} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Torso</text>
          <circle cx={148} cy={0} r={5} fill="#fbbf24" />
          <text x={157} y={4} fill="#475569" fontSize={8} fontFamily="system-ui">Cabeza</text>
        </g>

        {/* Beat badge — bottom center */}
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
