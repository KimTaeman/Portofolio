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
import CampusDetailCard from './components/ui/overlays/CampusDetailCard'
import CampusProximityOverlay from './components/ui/overlays/CampusProximityOverlay'
import {
  CAMPUS_PATH,
  CAMERA_KEYFRAMES,
  getCharacterOutfit,
  MOUNTAIN_PATH,
  SCENE_RANGES,
  SCENES,
  SCROLL_PAGES,
} from './config/narrativeTimeline'

const scenePosition = (sceneId) =>
  SCENES.find((scene) => scene.id === sceneId).position
const initialCamera = CAMERA_KEYFRAMES[0]
const playgroundEnd = SCENES.find((scene) => scene.id === 'playground').end

function InfiniteGround({
  isNight = false,
  isSunset = false,
  visible = true,
}) {
  return (
    <mesh
      name="infiniteWorldGround"
      position={[CAMPUS_PATH.centerX, CAMPUS_PATH.groundY - 1, -24]}
      receiveShadow
      visible={visible}
    >
      <boxGeometry args={[150, 2, 150]} />
      <meshStandardMaterial
        color={isNight ? '#25254D' : isSunset ? '#D9C5A4' : '#EAF4D3'}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [isNight, setIsNight] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [campusDetailId, setCampusDetailId] = useState(null)
  const outfit = getCharacterOutfit(scrollOffset)
  const isSummitActive = scrollOffset >= SCENE_RANGES.summit.start
  const isSunset =
    !isNight &&
    scrollOffset >= SCENE_RANGES.campus.start
  const skyColor = isNight
    ? '#1E1B4B'
    : isSunset
      ? '#FFE5D9'
      : '#E8F4FA'

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
          camera={{
            position: initialCamera.position,
            fov: initialCamera.fov,
            far: 1000,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          shadows
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFSoftShadowMap
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <fog attach="fog" args={[skyColor, 100, 500]} />
          <InfiniteGround
            isNight={isNight}
            isSunset={isSunset}
            visible={scrollOffset < MOUNTAIN_PATH.start}
          />

          <ScrollControls pages={SCROLL_PAGES} enabled={!isLocked}>
            <CameraController onScrollOffsetChange={setScrollOffset} />
            <JourneyCharacter outfit={outfit} />

            {/* Scene 1: The Playground (Introduction) */}
            <Playground
              isNight={isNight}
              isSunset={isSunset}
              isSummitActive={isSummitActive}
              castDirectionalShadow={scrollOffset >= playgroundEnd}
            />

            {/* Scene 2: The Campus Path (Skills & Hobbies) */}
            <Campus
              position={scenePosition('campus')}
              isNight={isNight}
              onSelect={handleCampusSelect}
            />

            {/* Scene 3: The Adventure Trail (Experience) */}
            <Mountain position={scenePosition('mountain')} />

            {/* Scene 4: The Summit (Future & Contact) */}
            <Summit
              position={scenePosition('summit')}
              isNight={isNight}
              isActive={isSummitActive}
            />
          </ScrollControls>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-10">
        <UIOverlay scrollOffset={scrollOffset} />
        <CampusProximityOverlay scrollOffset={scrollOffset} />

        <button
          type="button"
          onClick={() => setIsNight((prev) => !prev)}
          className="pointer-events-auto fixed right-6 top-6 rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#4A3B32] shadow-[0_12px_32px_rgba(92,65,35,0.14)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
        >
          {isNight ? 'Switch to Day' : 'Switch to Night'}
        </button>

        <CampusDetailCard
          detailId={campusDetailId}
          onClose={handleCampusClose}
        />
      </div>
    </div>
  )
}

export default App
