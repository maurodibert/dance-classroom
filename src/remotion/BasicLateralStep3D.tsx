import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W  = 480
const H  = 400
const PW = W / 3          // 160px per panel
const SCALE   = 1.22      // scene-units → pixels
const FLOOR_Y = 345       // screen Y where y=0 sits

// ─── Types ────────────────────────────────────────────────────────────────────
type V3 = [number, number, number]   // [x, y, z]  y=up  z=toward viewer

// ─── Beat timings (30 fps) ────────────────────────────────────────────────────
const T = { beat1: 18, beat2: 52, beat3: 86, golpe: 120, end: 152 }
const SP     = { damping: 13, mass: 0.8, stiffness: 115 }
const SP_HIP = { damping: 7,  mass: 0.4, stiffness: 210 }

// ─── Camera projections ───────────────────────────────────────────────────────
const frontal  = ([x, y,  ]: V3): [number, number] => [x,  y]
const lateral  = ([ , y, z]: V3): [number, number] => [z,  y]
const diagonal = ([x, y, z]: V3): [number, number] => [x * 0.71 + z * 0.71, y]

// Map projected body-space point → SVG coords inside a panel
function toScreen([bx, by]: [number, number], panelCX: number): [number, number] {
  return [panelCX + bx * SCALE, FLOOR_Y - by * SCALE]
}

// ─── Body builder ─────────────────────────────────────────────────────────────
function buildBody(
  lFx: number, lFy: number, lFz: number,
  rFx: number, rFy: number, rFz: number,
  hipSnap: number,   // extra lateral X shift on golpe
  flex: number       // 0-1 knee flex amount
): Record<string, V3> {
  const hipX = (lFx + rFx) / 2 + hipSnap
  const hipY = 93 - flex * 9
  const hipZ = (lFz + rFz) / 2

  const chest: V3  = [hipX * 0.38, 130, hipZ * 0.25]
  const neck:  V3  = [hipX * 0.18, 153, hipZ * 0.12]
  const head:  V3  = [hipX * 0.12, 172, hipZ * 0.08]

  const lHipJ: V3  = [hipX - 12, hipY, hipZ]
  const rHipJ: V3  = [hipX + 12, hipY, hipZ]

  const lKnee: V3  = [
    (lFx + lHipJ[0]) / 2 - 1,
    (lFy + lHipJ[1]) / 2 + flex * 4,
    lFz * 0.6 + 4,
  ]
  const rKnee: V3  = [
    (rFx + rHipJ[0]) / 2 + 1,
    (rFy + rHipJ[1]) / 2 + flex * 4,
    rFz * 0.6 - 4,
  ]

  // Arms swing opposite to hip drift (natural counter-rotation)
  const swing = -hipSnap * 0.35
  const lSh: V3   = [chest[0] - 22, 145, chest[2]]
  const rSh: V3   = [chest[0] + 22, 145, chest[2]]
  const lEl: V3   = [chest[0] - 28 + swing * 0.4, 115,  5 + swing * 0.5]
  const rEl: V3   = [chest[0] + 28 - swing * 0.4, 115, -5 - swing * 0.5]
  const lHa: V3   = [chest[0] - 32 + swing,        88,  8 + swing * 0.8]
  const rHa: V3   = [chest[0] + 32 - swing,        88, -8 - swing * 0.8]

  return {
    lFoot: [lFx, lFy, lFz],
    rFoot: [rFx, rFy, rFz],
    lKnee, rKnee,
    lHip: lHipJ, rHip: rHipJ,
    hipC: [hipX, hipY, hipZ],
    chest, neck, head,
    lSh, rSh, lEl, rEl, lHa, rHa,
  }
}

// ─── Segment definitions ──────────────────────────────────────────────────────
type Seg = { a: string; b: string; color: string; w: number }

const SEGS: Seg[] = [
  // Arms
  { a: 'neck',  b: 'lSh',  color: '#94a3b8', w: 2 },
  { a: 'neck',  b: 'rSh',  color: '#94a3b8', w: 2 },
  { a: 'lSh',   b: 'lEl',  color: '#94a3b8', w: 1.5 },
  { a: 'rSh',   b: 'rEl',  color: '#94a3b8', w: 1.5 },
  { a: 'lEl',   b: 'lHa',  color: '#94a3b8', w: 1.5 },
  { a: 'rEl',   b: 'rHa',  color: '#94a3b8', w: 1.5 },
  // Torso
  { a: 'neck',  b: 'hipC', color: '#cbd5e1', w: 2.5 },
  { a: 'hipC',  b: 'lHip', color: '#cbd5e1', w: 2 },
  { a: 'hipC',  b: 'rHip', color: '#cbd5e1', w: 2 },
  // Left leg (emerald)
  { a: 'lHip',  b: 'lKnee', color: '#34d399', w: 2.5 },
  { a: 'lKnee', b: 'lFoot', color: '#34d399', w: 2.5 },
  // Right leg (darker emerald)
  { a: 'rHip',  b: 'rKnee', color: '#059669', w: 2.5 },
  { a: 'rKnee', b: 'rFoot', color: '#059669', w: 2.5 },
]

// ─── Panel renderer (returns JSX elements array) ───────────────────────────────
function renderFigure(
  joints: Record<string, V3>,
  project: (v: V3) => [number, number],
  panelCX: number,
  isGolpe: boolean
): React.ReactNode[] {
  const s = (name: string) => toScreen(project(joints[name]), panelCX)
  const elements: React.ReactNode[] = []

  // Segments
  SEGS.forEach(({ a, b, color, w }, i) => {
    const [x1, y1] = s(a)
    const [x2, y2] = s(b)
    elements.push(
      <line key={`seg-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={w} strokeLinecap="round" />
    )
  })

  // Head
  const [hx, hy] = s('head')
  elements.push(<circle key="head" cx={hx} cy={hy} r={10} fill="#e2e8f0" />)

  // Hip dot (amber, glows on golpe)
  const [hipx, hipy] = s('hipC')
  if (isGolpe) {
    elements.push(<circle key="hip-glow" cx={hipx} cy={hipy} r={14} fill="#fbbf24" opacity={0.2} />)
  }
  elements.push(<circle key="hip" cx={hipx} cy={hipy} r={7} fill={isGolpe ? '#f59e0b' : '#fbbf24'} />)

  // Knees
  const [lkx, lky] = s('lKnee')
  const [rkx, rky] = s('rKnee')
  elements.push(<circle key="lk" cx={lkx} cy={lky} r={4} fill="#475569" />)
  elements.push(<circle key="rk" cx={rkx} cy={rky} r={4} fill="#475569" />)

  // Feet
  const [lfx, lfy] = s('lFoot')
  const [rfx, rfy] = s('rFoot')
  elements.push(<circle key="lf" cx={lfx} cy={lfy} r={6} fill="#34d399" />)
  elements.push(<circle key="rf" cx={rfx} cy={rfy} r={6} fill="#059669" />)

  return elements
}

// ─── Main component ───────────────────────────────────────────────────────────
export const BasicLateralStep3D: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Left foot X (steps left twice)
  const lFx = (() => {
    const X0 = -16, X1 = -64, X2 = -100
    if (frame < T.beat1) return X0
    if (frame < T.beat2)
      return spring({ frame: frame - T.beat1, fps, config: SP, from: X0, to: X1 })
    if (frame < T.beat3) return X1
    if (frame < T.golpe)
      return spring({ frame: frame - T.beat3, fps, config: SP, from: X1, to: X2 })
    return X2
  })()

  // ── Right foot X (joins twice)
  const rFx = (() => {
    const X0 = 16, X1 = -24, X2 = -62
    if (frame < T.beat2) return X0
    if (frame < T.beat3)
      return spring({ frame: frame - T.beat2, fps, config: SP, from: X0, to: X1 })
    if (frame < T.golpe) return X1
    return spring({ frame: frame - T.golpe, fps, config: SP, from: X1, to: X2 })
  })()

  // ── Foot Y lift (parabolic arc while moving)
  const liftAmount = 14
  const lFy = (() => {
    // L foot lifts on beat1 and beat3
    const t1 = interpolate(frame, [T.beat1, (T.beat1 + T.beat2) / 2, T.beat2], [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const t3 = interpolate(frame, [T.beat3, (T.beat3 + T.golpe) / 2, T.golpe],  [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t1, t3)
  })()

  const rFy = (() => {
    const t2 = interpolate(frame, [T.beat2, (T.beat2 + T.beat3) / 2, T.beat3],       [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const tg = interpolate(frame, [T.golpe, (T.golpe + T.end) / 2, T.end],           [0, liftAmount, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(t2, tg)
  })()

  // ── Foot Z arc: feet arc slightly forward when they move (adds info to lateral view)
  const lFz = (() => {
    const arc = (a: number, b: number) =>
      interpolate(frame, [a, (a + b) / 2, b], [0, 12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(arc(T.beat1, T.beat2), arc(T.beat3, T.golpe))
  })()

  const rFz = (() => {
    const arc = (a: number, b: number) =>
      interpolate(frame, [a, (a + b) / 2, b], [0, 12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.max(arc(T.beat2, T.beat3), arc(T.golpe, T.end))
  })()

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

  const joints = buildBody(lFx, lFy, lFz, rFx, rFy, rFz, hipSnap, flex)

  // ── Beat label
  const isGolpe = frame >= T.golpe
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

  // Panel centers
  const CX = [PW * 0.5, PW * 1.5, PW * 2.5]
  const views: Array<{ proj: (v: V3) => [number, number]; label: string }> = [
    { proj: frontal,  label: 'FRONTAL' },
    { proj: lateral,  label: 'LATERAL' },
    { proj: diagonal, label: '45°' },
  ]

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

        {/* Panel backgrounds */}
        {views.map((_, i) => (
          <rect key={i} x={i * PW + 2} y={2} width={PW - 4} height={H - 4}
            rx={10} fill="#080f1c" />
        ))}

        {/* Dividers */}
        <line x1={PW}     y1={16} x2={PW}     y2={H - 16} stroke="#1e293b" strokeWidth={1} />
        <line x1={PW * 2} y1={16} x2={PW * 2} y2={H - 16} stroke="#1e293b" strokeWidth={1} />

        {/* Floor lines */}
        {CX.map((cx, i) => (
          <line key={i} x1={cx - 62} y1={FLOOR_Y} x2={cx + 62} y2={FLOOR_Y}
            stroke="#1e293b" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* View labels */}
        {views.map(({ label }, i) => (
          <text key={i} x={CX[i]} y={22} textAnchor="middle"
            fill="#334155" fontSize={9} fontFamily="system-ui" fontWeight="700" letterSpacing="1.5">
            {label}
          </text>
        ))}

        {/* Figures */}
        {views.map(({ proj }, i) => (
          <g key={i}>
            {renderFigure(joints, proj, CX[i], isGolpe)}
          </g>
        ))}

        {/* Legend — left column */}
        <g transform="translate(8, 360)">
          <circle cx={6} cy={0} r={5} fill="#34d399" />
          <text x={15} y={4} fill="#475569" fontSize={9} fontFamily="system-ui">Pie I</text>
          <circle cx={50} cy={0} r={5} fill="#059669" />
          <text x={59} y={4} fill="#475569" fontSize={9} fontFamily="system-ui">Pie D</text>
          <circle cx={94} cy={0} r={5} fill="#fbbf24" />
          <text x={103} y={4} fill="#475569" fontSize={9} fontFamily="system-ui">Cadera</text>
        </g>

        {/* Beat badge — bottom center */}
        {beat && (
          <g opacity={labelAlpha}>
            <rect x={W / 2 - 36} y={H - 38} width={72} height={26} rx={13}
              fill={beat.golpe ? '#451a03' : '#022c22'} />
            <text x={W / 2} y={H - 20} textAnchor="middle"
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
