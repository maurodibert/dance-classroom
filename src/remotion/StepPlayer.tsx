import { Player } from '@remotion/player'
import { BasicLateralStep } from './BasicLateralStep'

export const StepPlayer: React.FC = () => (
  <Player
    component={BasicLateralStep}
    durationInFrames={155}
    fps={30}
    compositionWidth={480}
    compositionHeight={320}
    style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    controls
    loop
    autoPlay
  />
)
