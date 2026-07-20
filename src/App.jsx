import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import CameraController from './components/canvas/CameraController'
import JourneyCharacter from './components/canvas/JourneyCharacter'
import Playground from './components/canvas/scenes/Playground'
import Campus from './components/canvas/scenes/Campus'
import Mountain from './components/canvas/scenes/Mountain'
import Summit from './components/canvas/scenes/Summit'
import UIOverlay from './components/ui/overlays/UIOverlay'
import PolaroidInteraction from './components/ui/overlays/PolaroidInteraction'
import CampusDetailCard from './components/ui/overlays/CampusDetailCard'
import {
  CAMERA_KEYFRAMES,
  SCENES,
  SCROLL_PAGES,
} from './config/narrativeTimeline'

const scenePosition = (sceneId) =>
  SCENES.find((scene) => scene.id === sceneId).position
const initialCamera = CAMERA_KEYFRAMES[0]

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [isNight, setIsNight] = useState(false)
  const [outfit, setOutfit] = useState('school')
  const [scrollOffset, setScrollOffset] = useState(0)
  const [campusDetailId, setCampusDetailId] = useState(null)

  const handlePolaroidOpen = useCallback(() => {
    setIsLocked(true)
  }, [])

  const handlePolaroidClose = useCallback(() => {
    setIsLocked(false)
  }, [])

  const handleCampusSelect = useCallback((detailId) => {
    setCampusDetailId(detailId)
    setIsLocked(true)
  }, [])

  const handleCampusClose = useCallback(() => {
    setCampusDetailId(null)
    setIsLocked(false)
  }, [])

  return (
    <div className="relative isolate h-screen w-screen overflow-hidden bg-[#FDF6E3]">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: initialCamera.position, fov: initialCamera.fov }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          shadows
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFSoftShadowMap
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <fog
            attach="fog"
            args={[isNight ? '#1E2A44' : '#F4E8D0', 32, 115]}
          />
          <ambientLight intensity={isNight ? 0.18 : 0.3} />
          <hemisphereLight
            args={[
              isNight ? '#7182A8' : '#FFF4D6',
              isNight ? '#151A29' : '#B98B61',
              isNight ? 0.65 : 1.35,
            ]}
          />
          <directionalLight
            castShadow
            position={[18, 28, 16]}
            intensity={isNight ? 0.75 : 2.2}
            color={isNight ? '#91A7D3' : '#FFF2D2'}
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={120}
            shadow-camera-left={-45}
            shadow-camera-right={45}
            shadow-camera-top={45}
            shadow-camera-bottom={-45}
            shadow-bias={-0.0002}
            shadow-normalBias={0.03}
          />
          <directionalLight
            position={[-14, 10, -8]}
            intensity={isNight ? 0.25 : 0.55}
            color={isNight ? '#6C72A8' : '#FFD1C2'}
          />

          <ScrollControls pages={SCROLL_PAGES} enabled={!isLocked}>
            <CameraController
              onOutfitChange={setOutfit}
              onScrollOffsetChange={setScrollOffset}
            />
            <JourneyCharacter outfit={outfit} />

            {/* Scene 1: The Playground (Introduction) */}
            <Playground />

            {/* Scene 2: The Campus Path (Skills & Hobbies) */}
            <Campus
              position={scenePosition('campus')}
              onSelect={handleCampusSelect}
            />

            {/* Scene 3: The Mountain Base (Experience) */}
            <Mountain position={scenePosition('mountain')} />

            {/* Scene 4: The Summit (Future & Contact) */}
            <Summit position={scenePosition('summit')} isNight={isNight} />
          </ScrollControls>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-10">
        <UIOverlay scrollOffset={scrollOffset} />

        <button
          type="button"
          onClick={() => setIsNight((prev) => !prev)}
          className="pointer-events-auto fixed right-6 top-6 rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#18213d] shadow-[0_12px_32px_rgba(92,65,35,0.14)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
        >
          {isNight ? 'Switch to Day' : 'Switch to Night'}
        </button>

        <PolaroidInteraction
          scrollOffset={scrollOffset}
          isOpen={isLocked}
          onOpen={handlePolaroidOpen}
          onClose={handlePolaroidClose}
        />
        <CampusDetailCard
          detailId={campusDetailId}
          onClose={handleCampusClose}
        />
      </div>
    </div>
  )
}

export default App
