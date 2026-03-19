import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W  = 480, H = 600
const PW = W / 2, PH = H / 2        // 240 × 300
const SCALE       = 1.1
const FLOOR_LOCAL = 262              // px from panel-top where y=0 sits
const SUP_CY      = 178              // center for superior view

type V3 = [number, number, number]   // [x, y, z]  y=up  z=toward viewer
type P2 = [number, number]

// ─── Beat timings ─────────────────────────────────────────────────────────────
const T      = { beat1: 18, beat2: 52, beat3: 86, golpe: 120, end: 152 }
const SP     = { damping: 13, mass: 0.8, stiffness: 115 }
const SP_HIP = { damping: 7,  mass: 0.4, stiffness: 210 }

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  skin:   '#f59e0b', skinHi: '#fde68a', skinSh: '#b45309',
  hair:   '#1c1917',
  shirt:  '#1d4ed8', shirtSh: '#1e3a8a', shirtHi: '#60a5fa',
  pants:  '#1e293b', pantsSh: '#0a0f1a',
  shoe:   '#0c0a09', shoeSh:  '#000',
  belt:   '#7c2d12',
  // Room colors
  wall:   '#080d14', floor: '#060b11',
  grid:   'rgba(30,58,138,0.22)',
  gridFl: 'rgba(15,23,42,0.6)',
}

// ─── Projections & depth ──────────────────────────────────────────────────────
type ProjFn  = (v: V3) => P2
type DepthFn = (v: V3) => number

const frente:   ProjFn  = ([x, y   ]) => [ x,  y]
const costado:  ProjFn  = ([ , y, z]) => [ z,  y]
const diagonal: ProjFn  = ([x, y, z]) => [x * 0.71 + z * 0.71, y]
const superior: ProjFn  = ([x,  , z]) => [ x, -z]

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
function capsule([ax, ay]: P2, [bx, by]: P2, wA: number, wB: number): string {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy)
  if (len < 1) return ''
  const px = -dy / len, py = dx / len
  const f = (n: number) => n.toFixed(1)
  const [c1x,c1y]=[ax+wA*px, ay+wA*py], [c2x,c2y]=[ax-wA*px, ay-wA*py]
  const [c3x,c3y]=[bx-wB*px, by-wB*py], [c4x,c4y]=[bx+wB*px, by+wB*py]
  return `M${f(c1x)} ${f(c1y)} L${f(c4x)} ${f(c4y)} A${wB} ${wB} 0 0 1 ${f(c3x)} ${f(c3y)} L${f(c2x)} ${f(c2y)} A${wA} ${wA} 0 0 0 ${f(c1x)} ${f(c1y)}Z`
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

  const lWaist: V3 = [hipX - 12 + lean, 112, chest[2] * 0.7]
  const rWaist: V3 = [hipX + 12 + lean, 112, chest[2] * 0.7]

  const lHip: V3 = [hipX - 13, hipY, hipZ]
  const rHip: V3 = [hipX + 13, hipY, hipZ]

  const lKnee: V3 = [
    (lFx + lHip[0]) / 2 - 1, (lFy + lHip[1]) / 2 + flex * 4, lFz * 0.6 + 4,
  ]
  const rKnee: V3 = [
    (rFx + rHip[0]) / 2 + 1, (rFy + rHip[1]) / 2 + flex * 4, rFz * 0.6 - 4,
  ]

  // Heel behind ankle, toe in front — gives shoe its proper length
  const lHeel: V3 = [lFx + 3,  lFy, lFz - 9]
  const rHeel: V3 = [rFx - 3,  rFy, rFz - 9]
  const lToe:  V3 = [lFx - 5,  lFy, lFz + 16]
  const rToe:  V3 = [rFx + 5,  rFy, rFz + 16]

  const twist  = hipSnap * -0.55
  const lSh: V3 = [hipX - 20 + lean, 147, chest[2] + twist]
  const rSh: V3 = [hipX + 20 + lean, 147, chest[2] - twist]

  const armFwd = 18
  const swing  = -hipSnap * 0.4 + armBeat * 6

  const lEl: V3 = [hipX - 23 + lean + swing * 0.3, 108, chest[2] + armFwd + twist * 0.6 + swing * 0.4]
  const rEl: V3 = [hipX + 23 + lean - swing * 0.3, 108, chest[2] + armFwd - twist * 0.6 - swing * 0.4]
  const lHa: V3 = [hipX - 16 + lean + swing * 0.6, 122, chest[2] + armFwd + 9 + twist * 0.8 + swing * 0.6]
  const rHa: V3 = [hipX + 16 + lean - swing * 0.6, 122, chest[2] + armFwd + 9 - twist * 0.8 - swing * 0.6]

  const ext = (a: V3, b: V3, d: number): V3 => {
    const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], l=Math.hypot(dx,dy,dz)||1
    return [b[0]+dx/l*d, b[1]+dy/l*d, b[2]+dz/l*d]
  }
  const lTip = ext(lEl, lHa, 10)
  const rTip = ext(rEl, rHa, 10)

  return {
    lFoot:[lFx,lFy,lFz], rFoot:[rFx,rFy,rFz],
    lHeel, rHeel, lToe, rToe,
    lKnee, rKnee, lHip, rHip,
    lWaist, rWaist,
    hipC:[hipX,hipY,hipZ],
    chest, neck, head,
    lSh, rSh, lEl, rEl, lHa, rHa, lTip, rTip,
  }
}

// ─── Panel background (room, grid, floor) ────────────────────────────────────
function PanelBg({ ox, oy, isTop }: { ox:number; oy:number; isTop:boolean }) {
  if (isTop) {
    // Superior: floor grid in XZ
    const lines: React.ReactNode[] = []
    for (let x = -90; x <= 90; x += 30) {
      const sx = ox + PW / 2 + x * SCALE
      lines.push(<line key={`sx${x}`} x1={sx} y1={oy+28} x2={sx} y2={oy+PH-8} stroke={C.grid} strokeWidth={0.6} />)
    }
    for (let z = -30; z <= 30; z += 15) {
      const sy = oy + SUP_CY - z * SCALE
      if (sy > oy+28 && sy < oy+PH-8)
        lines.push(<line key={`sz${z}`} x1={ox+8} y1={sy} x2={ox+PW-8} y2={sy} stroke={C.grid} strokeWidth={0.6} />)
    }
    return <>{lines}</>
  }

  const floorY = oy + FLOOR_LOCAL
  const panelR = ox + PW - 2
  const panelB = oy + PH - 2
  const els: React.ReactNode[] = [
    // Wall
    <rect key="wall" x={ox+2} y={oy+2}    width={PW-4} height={FLOOR_LOCAL-2} fill={C.wall} />,
    // Floor
    <rect key="fl"   x={ox+2} y={floorY}  width={PW-4} height={panelB-floorY}  fill={C.floor} />,
    // Floor/wall join highlight
    <line key="fl-edge" x1={ox+2} y1={floorY} x2={panelR} y2={floorY} stroke="rgba(30,58,138,0.4)" strokeWidth={1} />,
  ]
  // Wall grid (horizontal)
  for (let y = 40; y <= 170; y += 40) {
    const sy = oy + FLOOR_LOCAL - y * SCALE
    if (sy > oy+18) els.push(
      <line key={`wh${y}`} x1={ox+6} y1={sy} x2={panelR-6} y2={sy} stroke={C.grid} strokeWidth={0.5} />
    )
  }
  // Wall vertical center axis
  els.push(<line key="axis" x1={ox+PW/2} y1={oy+20} x2={ox+PW/2} y2={floorY} stroke={C.grid} strokeWidth={0.5} strokeDasharray="3 5" />)
  // Floor receding lines (perspective illusion)
  for (let i = 1; i <= 3; i++) {
    const sy = floorY + i * 9
    if (sy < panelB - 4) els.push(
      <line key={`fh${i}`} x1={ox+8} y1={sy} x2={panelR-8} y2={sy} stroke={C.gridFl} strokeWidth={0.5} />
    )
  }
  return <>{els}</>
}

// ─── Figure renderer ──────────────────────────────────────────────────────────
function renderFigure(
  joints: Record<string, V3>,
  proj: ProjFn, depthFn: DepthFn,
  ox: number, oy: number, isTop: boolean, isGolpe: boolean
): React.ReactNode[] {
  const s = (n: string): P2 => toScreen(proj(joints[n]), ox, oy, isTop)
  const d = (n: string)     => depthFn(joints[n])
  const els: React.ReactNode[] = []

  const leftLegFront = d('lFoot') >= d('rFoot')
  const leftArmFront = d('lEl')   >= d('rEl')

  // ── Three-layer capsule (shadow → fill → specular highlight) ─────────────
  const Limb = (
    key: string, a: string, b: string,
    wA: number, wB: number,
    fill: string, shadowFill: string,
    opacity = 1
  ) => {
    const sa = s(a), sb = s(b)

    // 1. Drop shadow: offset +2px right / +3px down
    const shPath = capsule([sa[0]+2,sa[1]+3], [sb[0]+2,sb[1]+3], wA, wB)
    if (shPath) els.push(<path key={key+'_sh'} d={shPath} fill={shadowFill} opacity={opacity * 0.55} />)

    // 2. Main fill
    const mainPath = capsule(sa, sb, wA, wB)
    if (!mainPath) return
    els.push(<path key={key} d={mainPath} fill={fill} opacity={opacity} />)

    // 3. Specular ridge: thinner capsule on the lit side (light from upper-left)
    const dx = sb[0]-sa[0], dy = sb[1]-sa[1], len = Math.hypot(dx,dy)||1
    const px = -dy/len, py = dx/len
    const litSign = (px*(-0.7) + py*(-0.7)) >= 0 ? 1 : -1
    const hw = wA * 0.4, hA: P2 = [sa[0]+litSign*wA*0.28*px, sa[1]+litSign*wA*0.28*py]
    const hB: P2 = [sb[0]+litSign*wB*0.28*px, sb[1]+litSign*wB*0.28*py]
    const hiPath = capsule(hA, hB, hw, wB * 0.4)
    if (hiPath) els.push(<path key={key+'_hi'} d={hiPath} fill="rgba(255,255,255,0.16)" opacity={opacity} />)
  }

  // ── Sphere joint with shading ─────────────────────────────────────────────
  const Joint = (key: string, jt: string, r: number, fill: string, opacity = 1) => {
    const [cx, cy] = s(jt)
    els.push(<circle key={key}     cx={cx}      cy={cy}      r={r}     fill={fill}  opacity={opacity} />)
    els.push(<circle key={key+'h'} cx={cx-r*.3} cy={cy-r*.35} r={r*.45} fill="#fff" opacity={opacity*.17} />)
    els.push(<circle key={key+'s'} cx={cx+r*.2} cy={cy+r*.3}  r={r*.35} fill="#000" opacity={opacity*.2} />)
  }

  // ── Leg helper ────────────────────────────────────────────────────────────
  const drawLeg = (side: 'l' | 'r', front: boolean) => {
    const op    = front ? 1 : 0.62
    const pants = front ? C.pants : C.pantsSh
    const shoe  = front ? C.shoe  : C.shoeSh
    // Thigh (hip → knee): tapered, wide at hip
    Limb(`${side}th`, `${side}Hip`,  `${side}Knee`, 15, 10, pants,  C.pantsSh, op)
    // Shin (knee → ankle): tapers to ankle
    Limb(`${side}sh`, `${side}Knee`, `${side}Foot`, 10,  7, pants,  C.pantsSh, op)
    // Heel cap (ankle → heel): shows rear of shoe
    Limb(`${side}hl`, `${side}Foot`, `${side}Heel`,  7,  5, shoe,   C.shoeSh,  op)
    // Toe cap (ankle → toe): shows front of shoe
    Limb(`${side}to`, `${side}Foot`, `${side}Toe`,   7,  5, shoe,   C.shoeSh,  op)
    Joint(`${side}kj`, `${side}Knee`, 8,   pants, op)
    Joint(`${side}aj`, `${side}Foot`, 6.5, shoe,  op)
  }

  // ── Arm helper ────────────────────────────────────────────────────────────
  const drawArm = (side: 'l' | 'r', front: boolean) => {
    const op   = front ? 1 : 0.62
    const sh   = front ? C.shirt   : C.shirtSh
    const shHi = front ? C.shirtSh : C.pantsSh
    // Upper arm (shoulder → elbow): tapered
    Limb(`${side}ua`, `${side}Sh`,  `${side}El`,  11, 8,   sh,   shHi, op)
    // Forearm (elbow → wrist)
    Limb(`${side}fa`, `${side}El`,  `${side}Ha`,   8, 5,   sh,   shHi, op)
    // Hand + fingertips (skin tone)
    Limb(`${side}hd`, `${side}Ha`,  `${side}Tip`,  5, 2.5, C.skin, C.skinSh, op)
    Joint(`${side}ej`, `${side}El`, 6.5, sh,     op)
    Joint(`${side}wj`, `${side}Ha`, 4,   C.skin, op)
  }

  // ── Back-to-front draw order ──────────────────────────────────────────────

  // Foot shadows on floor (non-top panels only)
  if (!isTop) {
    ;['lFoot','rFoot'].forEach((jt, i) => {
      const [fx] = s(jt)
      const sy = oy + FLOOR_LOCAL + 4
      els.push(<ellipse key={`fshadow${i}`} cx={fx} cy={sy} rx={11} ry={4.5}
        fill="rgba(0,0,0,0.55)" />)
    })
  }

  drawLeg(leftLegFront ? 'r' : 'l', false)
  drawArm(leftArmFront ? 'r' : 'l', false)

  // Torso: 6-point hourglass polygon (shoulders → waist → hips)
  const tPts = ['lSh','rSh','rWaist','rHip','lHip','lWaist'].map(n => s(n).join(',')).join(' ')
  els.push(<polygon key="torso" points={tPts} fill={C.shirt} opacity={0.97} />)

  // Torso specular overlay (lighter central strip)
  const tHiPts = ['lWaist','rWaist','rSh','lSh'].map(n => {
    const [tx,ty] = s(n); return `${(tx+s('chest')[0])/2},${(ty+s('chest')[1])/2}`
  }).join(' ')
  els.push(<polygon key="torso-hi" points={tHiPts} fill="rgba(96,165,250,0.12)" />)

  // Hip girdle (covers trouser–shirt seam)
  Limb('hgird', 'lHip',  'rHip',  9.5, 9.5, C.shirtSh, C.pantsSh)
  // Shoulder yoke
  Limb('syoke', 'lSh',   'rSh',   8.5, 8.5, C.shirtSh, C.shirtSh)
  // Belt at waist line
  Limb('belt',  'lWaist','rWaist', 4.5, 4.5, C.belt,    C.pantsSh)
  // Spine (hipC → neck)
  Limb('spine', 'hipC',  'neck',   8,   6,   C.shirtSh, C.pantsSh)
  // Neck column
  Limb('nk',    'neck',  'head',   6,   5,   C.skin,    C.skinSh)

  // Shoulder spheres (large, on top of yoke)
  Joint('lsh', 'lSh',  10, C.shirt)
  Joint('rsh', 'rSh',  10, C.shirt)
  Joint('hpc', 'hipC',  5, isGolpe ? '#f59e0b' : 'rgba(251,191,36,0.5)')

  if (isGolpe) {
    const [hpx, hpy] = s('hipC')
    els.push(<circle key="hipglow" cx={hpx} cy={hpy} r={14} fill="#f59e0b" opacity={0.18} />)
  }

  drawLeg(leftLegFront ? 'l' : 'r', true)
  drawArm(leftArmFront ? 'l' : 'r', true)

  // ── Head (always on top) ─────────────────────────────────────────────────
  const [hx, hy] = s('head')
  // Hair cap (dark oval above head)
  els.push(<ellipse key="hair" cx={hx - 1} cy={hy - 8} rx={12} ry={9}  fill={C.hair} />)
  // Neck shadow under head
  els.push(<circle  key="hsh"  cx={hx + 2} cy={hy + 4} r={11}           fill={C.skinSh} opacity={0.35} />)
  // Head sphere
  els.push(<circle  key="head" cx={hx}     cy={hy}     r={13}           fill={C.skin} />)
  // Specular highlight
  els.push(<circle  key="hhi"  cx={hx - 4} cy={hy - 4} r={5}           fill={C.skinHi} opacity={0.45} />)
  // Soft shadow on bottom of head
  els.push(<circle  key="hsh2" cx={hx + 2} cy={hy + 5} r={6}           fill={C.skinSh} opacity={0.22} />)

  return els
}

// ─── Main component ───────────────────────────────────────────────────────────
export const BasicLateralStep3D: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Left foot X (steps left twice)
  const lFx = (() => {
    const X0 = -16, X1 = -60, X2 = -94
    if (frame < T.beat1) return X0
    if (frame < T.beat2) return spring({ frame: frame-T.beat1, fps, config: SP, from: X0, to: X1 })
    if (frame < T.beat3) return X1
    if (frame < T.golpe) return spring({ frame: frame-T.beat3, fps, config: SP, from: X1, to: X2 })
    return X2
  })()

  // Right foot X (joins twice)
  const rFx = (() => {
    const X0 = 16, X1 = -22, X2 = -58
    if (frame < T.beat2) return X0
    if (frame < T.beat3) return spring({ frame: frame-T.beat2, fps, config: SP, from: X0, to: X1 })
    if (frame < T.golpe) return X1
    return spring({ frame: frame-T.golpe, fps, config: SP, from: X1, to: X2 })
  })()

  // Foot Y lift
  const lift = 13
  const lFy = (() => {
    const t1 = interpolate(frame, [T.beat1,(T.beat1+T.beat2)/2,T.beat2], [0,lift,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    const t3 = interpolate(frame, [T.beat3,(T.beat3+T.golpe)/2,T.golpe], [0,lift,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    return Math.max(t1, t3)
  })()
  const rFy = (() => {
    const t2 = interpolate(frame, [T.beat2,(T.beat2+T.beat3)/2,T.beat3], [0,lift,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    const tg = interpolate(frame, [T.golpe,(T.golpe+T.end)/2,T.end],     [0,lift,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    return Math.max(t2, tg)
  })()

  // Foot Z arc (adds depth to costado/45° views)
  const arc = (a: number, b: number) =>
    interpolate(frame, [a,(a+b)/2,b], [0,14,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'})
  const lFz = Math.max(arc(T.beat1,T.beat2), arc(T.beat3,T.golpe))
  const rFz = Math.max(arc(T.beat2,T.beat3), arc(T.golpe,T.end))

  // Hip snap
  const hipSnap = frame >= T.golpe
    ? spring({ frame:frame-T.golpe, fps, config:SP_HIP, from:0, to:-22 }) : 0

  // Knee flex
  const flex = frame >= T.golpe
    ? spring({ frame:frame-T.golpe, fps, config:SP_HIP, from:0, to:1 }) : 0

  // Beat-driven arm pulse
  const armBeat = interpolate(
    frame, [0,T.beat1,T.beat2,T.beat3,T.golpe,T.end], [0,1,-0.4,1,0,0],
    { extrapolateLeft:'clamp', extrapolateRight:'clamp' }
  )

  const joints  = buildBody(lFx, lFy, lFz, rFx, rFy, rFz, hipSnap, flex, armBeat)
  const isGolpe = frame >= T.golpe

  // Beat label
  const beat = (() => {
    if (frame < T.beat1) return null
    if (frame < T.beat2) return { text:'①', golpe:false }
    if (frame < T.beat3) return { text:'②', golpe:false }
    if (frame < T.golpe) return { text:'③', golpe:false }
    return { text:'GOLPE', golpe:true }
  })()
  const labelAlpha = beat
    ? interpolate(frame, [T.beat1,T.beat1+7], [0,1], {extrapolateRight:'clamp'}) : 0

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

        {/* Panel backgrounds — room + grid + floor */}
        {PANELS.map(({ ox, oy, isTop }, i) => (
          <g key={`bg${i}`}>
            {/* Panel card */}
            <rect x={ox+2} y={oy+2} width={PW-4} height={PH-4} rx={10} fill="#060b12" />
            <PanelBg ox={ox} oy={oy} isTop={isTop} />
          </g>
        ))}

        {/* Grid dividers */}
        <line x1={PW} y1={12} x2={PW} y2={H-12} stroke="#0f172a" strokeWidth={1.5} />
        <line x1={0}  y1={PH} x2={W}  y2={PH}   stroke="#0f172a" strokeWidth={1.5} />

        {/* View labels */}
        {PANELS.map(({ ox, oy, label }, i) => (
          <text key={i} x={ox+PW/2} y={oy+18}
            textAnchor="middle" fill="#1e40af"
            fontSize={9} fontFamily="system-ui" fontWeight="800" letterSpacing="2">
            {label}
          </text>
        ))}

        {/* Superior compass arrow */}
        <text x={PANELS[0].ox+PW/2} y={PANELS[0].oy+SUP_CY-72}
          textAnchor="middle" fill="#1e3a8a" fontSize={8} fontFamily="system-ui">▲ frente</text>

        {/* Figures — one per panel, depth-sorted */}
        {PANELS.map(({ ox, oy, proj, depth, isTop }, i) => (
          <g key={`fig${i}`}>
            {renderFigure(joints, proj, depth, ox, oy, isTop, isGolpe)}
          </g>
        ))}

        {/* Beat badge */}
        {beat && (
          <g opacity={labelAlpha}>
            <rect x={W/2-38} y={H-40} width={76} height={28} rx={14}
              fill={beat.golpe ? '#431407' : '#052e16'} />
            <text x={W/2} y={H-20} textAnchor="middle"
              fill={beat.golpe ? '#fb923c' : '#4ade80'}
              fontSize={beat.golpe ? 11 : 15} fontWeight="800" fontFamily="system-ui">
              {beat.text}
            </text>
          </g>
        )}

      </svg>
    </AbsoluteFill>
  )
}
