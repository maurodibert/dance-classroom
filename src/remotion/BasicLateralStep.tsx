import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const W = 480
const H = 320
const CX = W / 2

// Timings (frames at 30 fps)
const T = {
  beat1: 20,   // I (izquierdo) steps left
  beat2: 55,   // D (derecho) joins
  beat3: 90,   // I steps further left
  golpe: 125,  // D closes + hip snaps
  end: 155,
}

const SPRING = { damping: 14, mass: 0.8, stiffness: 120 }
const HIP_SPRING = { damping: 8, mass: 0.5, stiffness: 200 }

const FOOT_Y = 210
const HIP_Y  = 128
const FOOT_R = 24
const HIP_R  = 13

// Starting x positions (feet together)
const IX0 = CX - 22   // left foot start
const DX0 = CX + 22   // right foot start

// Movement targets (moving left)
const IX1 = CX - 68   // beat 1: I steps left
const DX1 = CX - 26   // beat 2: D joins I
const IX2 = CX - 102  // beat 3: I steps further left
const DX2 = CX - 60   // golpe:  D closes to I

export const BasicLateralStep: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── LEFT FOOT (Izquierdo) x ──
  const leftX = (() => {
    if (frame < T.beat1) return IX0
    if (frame < T.beat2) return spring({ frame: frame - T.beat1, fps, config: SPRING, from: IX0, to: IX1 })
    if (frame < T.beat3) return IX1
    if (frame < T.golpe) return spring({ frame: frame - T.beat3, fps, config: SPRING, from: IX1, to: IX2 })
    return IX2
  })()

  // ── RIGHT FOOT (Derecho) x ──
  const rightX = (() => {
    if (frame < T.beat2) return DX0
    if (frame < T.beat3) return spring({ frame: frame - T.beat2, fps, config: SPRING, from: DX0, to: DX1 })
    if (frame < T.golpe) return DX1
    return spring({ frame: frame - T.golpe, fps, config: SPRING, from: DX1, to: DX2 })
  })()

  // ── HIP: follows midpoint, then snaps on golpe ──
  const midX   = (leftX + rightX) / 2
  const hipBump = frame >= T.golpe
    ? spring({ frame: frame - T.golpe, fps, config: HIP_SPRING, from: 0, to: -26 })
    : 0
  const hipX = midX + hipBump

  // ── HIP vertical bounce on golpe ──
  const hipY = HIP_Y + (frame >= T.golpe
    ? spring({ frame: frame - T.golpe, fps, config: HIP_SPRING, from: 0, to: -8 })
    : 0)

  // ── Beat label ──
  const beat = (() => {
    if (frame < T.beat1) return null
    if (frame < T.beat2) return { text: '①', golpe: false }
    if (frame < T.beat3) return { text: '②', golpe: false }
    if (frame < T.golpe) return { text: '③', golpe: false }
    return { text: 'GOLPE', golpe: true }
  })()

  const labelOpacity = beat
    ? interpolate(frame, [T.beat1, T.beat1 + 8], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  // ── Ghost origin markers ──
  const ghostOpacity = 0.18

  // ── Hip highlight on golpe ──
  const hipGlow = frame >= T.golpe
    ? interpolate(frame, [T.golpe, T.golpe + 12], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

        {/* Background panel */}
        <rect x={24} y={24} width={W - 48} height={H - 48} rx={14} fill="#0a0f1a" />

        {/* Title */}
        <text x={CX} y={46} textAnchor="middle" fill="#374151" fontSize={11} fontFamily="system-ui" fontWeight="600" letterSpacing="2">
          PASO BÁSICO LATERAL · VISTA SUPERIOR
        </text>

        {/* Subtle grid lines */}
        {[160, 200, 240, 280, 320].map(x => (
          <line key={x} x1={x} y1={58} x2={x} y2={H - 58} stroke="#111827" strokeWidth={1} />
        ))}
        <line x1={60} y1={FOOT_Y} x2={W - 60} y2={FOOT_Y} stroke="#111827" strokeWidth={1} />

        {/* ← Direction hint */}
        <text x={64} y={FOOT_Y + 5} textAnchor="middle" fill="#1f2937" fontSize={26}>←</text>

        {/* Ghost start positions */}
        <circle cx={IX0} cy={FOOT_Y} r={FOOT_R} fill="none" stroke="#34d399" strokeWidth={1.5} strokeDasharray="5 3" opacity={ghostOpacity} />
        <circle cx={DX0} cy={FOOT_Y} r={FOOT_R} fill="none" stroke="#059669" strokeWidth={1.5} strokeDasharray="5 3" opacity={ghostOpacity} />

        {/* Hip glow on golpe */}
        {hipGlow > 0 && (
          <circle cx={hipX} cy={hipY} r={HIP_R + 14} fill="#fbbf24" opacity={hipGlow * 0.15} />
        )}

        {/* Torso line: hip → feet midpoint */}
        <line
          x1={hipX} y1={hipY + HIP_R}
          x2={(leftX + rightX) / 2} y2={FOOT_Y - FOOT_R}
          stroke="#1e293b" strokeWidth={2}
        />

        {/* HIP */}
        <circle cx={hipX} cy={hipY} r={HIP_R} fill={hipGlow > 0 ? '#f59e0b' : '#fbbf24'} opacity={0.92} />
        <text x={hipX} y={hipY - HIP_R - 6} textAnchor="middle" fill="#78350f" fontSize={10} fontFamily="system-ui" fontWeight="600">
          cadera
        </text>

        {/* RIGHT FOOT (Derecho) */}
        <circle cx={rightX} cy={FOOT_Y} r={FOOT_R} fill="#059669" opacity={0.9} />
        <text x={rightX} y={FOOT_Y + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold" fontFamily="system-ui">D</text>

        {/* LEFT FOOT (Izquierdo) */}
        <circle cx={leftX} cy={FOOT_Y} r={FOOT_R} fill="#34d399" />
        <text x={leftX} y={FOOT_Y + 5} textAnchor="middle" fill="#022c22" fontSize={12} fontWeight="bold" fontFamily="system-ui">I</text>

        {/* Beat badge */}
        {beat && (
          <g opacity={labelOpacity}>
            <rect
              x={CX - 32} y={H - 62} width={64} height={30} rx={15}
              fill={beat.golpe ? '#451a03' : '#022c22'}
            />
            <text
              x={CX} y={H - 41}
              textAnchor="middle"
              fill={beat.golpe ? '#fbbf24' : '#34d399'}
              fontSize={beat.golpe ? 11 : 16}
              fontWeight="bold"
              fontFamily="system-ui"
            >
              {beat.text}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(60, ${H - 32})`}>
          <circle cx={0} cy={0} r={7} fill="#34d399" />
          <text x={12} y={4} fill="#6b7280" fontSize={11} fontFamily="system-ui">Izquierdo</text>
          <circle cx={92} cy={0} r={7} fill="#059669" />
          <text x={104} y={4} fill="#6b7280" fontSize={11} fontFamily="system-ui">Derecho</text>
          <circle cx={178} cy={0} r={7} fill="#fbbf24" />
          <text x={190} y={4} fill="#6b7280" fontSize={11} fontFamily="system-ui">Cadera</text>
        </g>

      </svg>
    </AbsoluteFill>
  )
}
