import { Canvas } from '@react-three/fiber'
import { Scroll, ScrollControls } from '@react-three/drei'
import CameraController from './components/canvas/CameraController'
import Playground from './components/canvas/scenes/Playground'
import Campus from './components/canvas/scenes/Campus'
import Mountain from './components/canvas/scenes/Mountain'
import Summit from './components/canvas/scenes/Summit'
import IntroOverlay from './components/ui/overlays/IntroOverlay'

function App() {
  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden bg-[#FDF6E3]">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <ScrollControls pages={4}>
          <CameraController />

          {/* Scene 1: The Playground (Introduction) */}
          <Playground />

          {/* Scene 2: The Campus Path (Skills & Hobbies) */}
          <Campus position={[0, 0, 30]} />

          {/* Scene 3: The Mountain Base (Experience) */}
          <Mountain position={[0, 0, 60]} />

          {/* Scene 4: The Summit (Future & Contact) */}
          <Summit position={[0, 0, 90]} />

          <Scroll html style={{ width: '100vw', height: '100vh' }}>
            <IntroOverlay />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  )
}

export default App
