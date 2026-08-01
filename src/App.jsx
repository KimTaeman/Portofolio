import { useCallback, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import CameraController from './components/canvas/CameraController'
import GlobalSceneEnvironment from './components/canvas/GlobalSceneEnvironment'
import JourneyCharacter from './components/canvas/JourneyCharacter'
import Playground from './components/canvas/scenes/Playground'
import Campus from './components/canvas/scenes/Campus'
import Mountain from './components/canvas/scenes/Mountain'
import Summit from './components/canvas/scenes/Summit'
import UIOverlay from './components/ui/overlays/UIOverlay'
import CampusDetailCard from './components/ui/overlays/CampusDetailCard'
import CampusProximityOverlay from './components/ui/overlays/CampusProximityOverlay'
import ProjectDetailModal from './components/ui/overlays/ProjectDetailModal'
import ProjectTeaserCard from './components/ui/overlays/ProjectTeaserCard'
import { PROJECTS } from './data/projects'
import useDayNight from './hooks/useDayNight'
import {
  CAMPUS_PATH,
  CAMERA_KEYFRAMES,
  getCharacterOutfit,
  SCENE_RANGES,
  SCENES,
  SCROLL_PAGES,
} from './config/narrativeTimeline'

const scenePosition = (sceneId) =>
  SCENES.find((scene) => scene.id === sceneId).position
const initialCamera = CAMERA_KEYFRAMES[0]
const DAY_GROUND_COLOR = new THREE.Color('#EAF4D3')
const NIGHT_GROUND_COLOR = new THREE.Color('#25254D')

function InfiniteGround({ visible = true }) {
  const { isNightMode } = useDayNight()
  const materialRef = useRef()

  useFrame((_, delta) => {
    materialRef.current?.color.lerp(
      isNightMode ? NIGHT_GROUND_COLOR : DAY_GROUND_COLOR,
      1 - Math.exp(-delta / 0.65),
    )
  })

  return (
    <mesh
      name="infiniteWorldGround"
      position={[CAMPUS_PATH.centerX, CAMPUS_PATH.groundY - 1, -24]}
      receiveShadow
      visible={visible}
    >
      <boxGeometry args={[150, 2, 150]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#EAF4D3"
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function App() {
  const { isNightMode, toggleNightMode } = useDayNight()
  const [isLocked, setIsLocked] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [campusDetailId, setCampusDetailId] = useState(null)
  const [nearbyProjectId, setNearbyProjectId] = useState(null)
  const [projectDetail, setProjectDetail] = useState(null)
  const outfit = getCharacterOutfit(scrollOffset)

  const handleCampusSelect = useCallback((detailId) => {
    setCampusDetailId(detailId)
    setIsLocked(true)
  }, [])

  const handleCampusClose = useCallback(() => {
    setCampusDetailId(null)
    setIsLocked(false)
  }, [])

  const handleProjectSelect = useCallback((projectId) => {
    const project = PROJECTS.find(({ id }) => id === projectId)
    if (!project) return
    setProjectDetail(project)
    setIsLocked(true)
  }, [])

  const handleProjectClose = useCallback(() => {
    setProjectDetail(null)
    setIsLocked(false)
  }, [])

  const handleProjectProximityChange = useCallback((projectId) => {
    setNearbyProjectId((currentId) =>
      currentId === projectId ? currentId : projectId,
    )
  }, [])

  const nearbyProject = nearbyProjectId
    ? PROJECTS.find(({ id }) => id === nearbyProjectId) ?? null
    : null

  return (
    <div
      className={`relative isolate h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${
        isNightMode ? 'bg-[#0B0D17]' : 'bg-[#FFF0E5]'
      }`}
    >
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{
            position: initialCamera.position,
            fov: initialCamera.fov,
            far: 2000,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          shadows="soft"
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFSoftShadowMap
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <GlobalSceneEnvironment />
          <InfiniteGround
            visible={scrollOffset < SCENE_RANGES.campus.start}
          />

          <ScrollControls pages={SCROLL_PAGES} enabled={!isLocked}>
            <CameraController onScrollOffsetChange={setScrollOffset} />
            <JourneyCharacter outfit={outfit} />

            {/* Scene 1: The Playground (Introduction) */}
            <Playground
              position={scenePosition('playground')}
            />

            {/* Scene 2: The Campus Path (Skills & Hobbies) */}
            <Campus
              position={scenePosition('campus')}
              onSelect={handleCampusSelect}
            />

            {/* Scene 3: The Adventure Trail (Experience) */}
            <Mountain
              position={scenePosition('mountain')}
              onProjectProximityChange={handleProjectProximityChange}
            />

            {/* Scene 4: The Summit (Future & Contact) */}
            <Summit
              position={scenePosition('summit')}
            />
          </ScrollControls>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-10">
        <UIOverlay scrollOffset={scrollOffset} />
        <CampusProximityOverlay scrollOffset={scrollOffset} />

        <button
          type="button"
          onClick={toggleNightMode}
          className={`pointer-events-auto fixed right-6 top-6 rounded-full border px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] shadow-[0_12px_32px_rgba(15,23,42,0.2)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 ${
            isNightMode
              ? 'border-white/15 bg-[#1E293B]/85 text-[#F8FAFC] hover:bg-[#334155]'
              : 'border-white/70 bg-[#FFF9F4]/85 text-[#3E2723] hover:bg-[#FFF9F4]'
          }`}
          aria-pressed={isNightMode}
        >
          {isNightMode ? 'Switch to Day' : 'Switch to Night'}
        </button>

        <CampusDetailCard
          detailId={campusDetailId}
          onClose={handleCampusClose}
        />
        <ProjectTeaserCard
          project={nearbyProject}
          onViewDetails={handleProjectSelect}
        />
        <ProjectDetailModal
          project={projectDetail}
          onClose={handleProjectClose}
        />
      </div>
    </div>
  )
}

export default App
