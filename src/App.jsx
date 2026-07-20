import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import CameraController from './components/canvas/CameraController'
import Playground from './components/canvas/scenes/Playground'
import Campus from './components/canvas/scenes/Campus'
import Mountain from './components/canvas/scenes/Mountain'
import Summit from './components/canvas/scenes/Summit'
import UIOverlay from './components/ui/overlays/UIOverlay'
import PolaroidInteraction from './components/ui/overlays/PolaroidInteraction'

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [showPolaroid, setShowPolaroid] = useState(false)
  const [isNight, setIsNight] = useState(false)
  const [outfit, setOutfit] = useState('uniform')
  const [scrollOffset, setScrollOffset] = useState(0)

  const handleScrollLockChange = useCallback((shouldLock) => {
    setIsLocked(shouldLock)
    setShowPolaroid(shouldLock)
  }, [])

  const handlePolaroidClose = useCallback(() => {
    setIsLocked(false)
    setShowPolaroid(false)
  }, [])

  return (
    <div className="relative isolate h-screen w-screen overflow-hidden bg-[#FDF6E3]">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={isNight ? 0.25 : 0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={isNight ? 0.45 : 1}
            color={isNight ? '#8DA3C1' : '#ffffff'}
          />

          <ScrollControls pages={4} enabled={!isLocked}>
            <CameraController
              onScrollLockChange={handleScrollLockChange}
              onOutfitChange={setOutfit}
              onScrollOffsetChange={setScrollOffset}
            />

            {/* Scene 1: The Playground (Introduction) */}
            <Playground />

            {/* Scene 2: The Campus Path (Skills & Hobbies) */}
            <Campus position={[0, 0, 30]} />

            {/* Scene 3: The Mountain Base (Experience) */}
            <Mountain position={[0, 0, 60]} outfit={outfit} />

            {/* Scene 4: The Summit (Future & Contact) */}
            <Summit position={[0, 0, 90]} isNight={isNight} />
          </ScrollControls>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-10">
        <UIOverlay scrollOffset={scrollOffset} />

        <button
          type="button"
          onClick={() => setIsNight((prev) => !prev)}
          className="pointer-events-auto fixed right-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:scale-[1.02]"
        >
          {isNight ? 'Switch to Day' : 'Switch to Night'}
        </button>

        {showPolaroid && <PolaroidInteraction onClose={handlePolaroidClose} />}
      </div>
    </div>
  )
}

export default App
