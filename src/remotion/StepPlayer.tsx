import { Player } from '@remotion/player'
import { BasicLateralStep3D } from './BasicLateralStep3D'

export const StepPlayer: React.FC = () => (
  <Player
    component={BasicLateralStep3D}
    durationInFrames={152}
    fps={30}
    compositionWidth={480}
    compositionHeight={600}
    style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    controls
    loop
    autoPlay
  />
)
