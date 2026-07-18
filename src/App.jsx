import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scroll, ScrollControls } from '@react-three/drei'
import CameraController from './components/canvas/CameraController'
import Playground from './components/canvas/scenes/Playground'
import Campus from './components/canvas/scenes/Campus'
import Mountain from './components/canvas/scenes/Mountain'
import Summit from './components/canvas/scenes/Summit'
import IntroOverlay from './components/ui/overlays/IntroOverlay'
import PolaroidInteraction from './components/ui/overlays/PolaroidInteraction'

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [showPolaroid, setShowPolaroid] = useState(false)
  const [isNight, setIsNight] = useState(false)
  const [outfit, setOutfit] = useState('uniform')

  const handleScrollLock = useCallback(() => {
    setIsLocked(true)
    setShowPolaroid(true)
  }, [])

  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden bg-[#FDF6E3]">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={isNight ? 0.25 : 0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={isNight ? 0.45 : 1}
          color={isNight ? '#8DA3C1' : '#ffffff'}
        />

        <ScrollControls pages={4} enabled={!isLocked}>
          <CameraController
            onScrollLock={handleScrollLock}
            onOutfitChange={setOutfit}
          />

          {/* Scene 1: The Playground (Introduction) */}
          <Playground />

          {/* Scene 2: The Campus Path (Skills & Hobbies) */}
          <Campus position={[0, 0, 30]} />

          {/* Scene 3: The Mountain Base (Experience) */}
          <Mountain position={[0, 0, 60]} outfit={outfit} />

          {/* Scene 4: The Summit (Future & Contact) */}
          <Summit position={[0, 0, 90]} isNight={isNight} />

          <Scroll html style={{ width: '100vw', height: '100vh' }}>
            <IntroOverlay />
            <button
              type="button"
              onClick={() => setIsNight((prev) => !prev)}
              className="fixed right-6 top-6 z-50 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:scale-[1.02]"
            >
              {isNight ? 'Switch to Day' : 'Switch to Night'}
            </button>
            {showPolaroid && (
              <PolaroidInteraction
                setIsLocked={setIsLocked}
                setShowPolaroid={setShowPolaroid}
              />
            )}
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  )
}

export default App
