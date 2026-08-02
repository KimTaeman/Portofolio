import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import LowPolyGrassMaterial from '../LowPolyGrassMaterial'
import useDayNight from '../../../hooks/useDayNight'
import {
  CAMPUS_LANDMARKS,
  CAMPUS_PATH,
  getCharacterXAtOffset,
  SCENE_RANGES,
} from '../../../config/narrativeTimeline'

const pseudoRandom = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const TREE_X_POSITIONS = [
  -12,
  -10.5,
  -9,
  -7.5,
  -6,
  -4.5,
  -3,
  -1.5,
  0,
  1.4,
  2.8,
  4.2,
  5.6,
  7,
  8.4,
  9.8,
  11.2,
  12.2,
]

const TURN_CORNER_LOCAL_X = CAMPUS_PATH.endX - CAMPUS_PATH.centerX
const LANDING_LOCAL_X = CAMPUS_PATH.startX - CAMPUS_PATH.centerX
const LANDING_LOCAL_Z = CAMPUS_PATH.characterZ - 3.4
const LANDING_CLEARANCE_RADIUS = 2.4
const isInsideTurnClearance = (x, z) =>
  Math.abs(x - TURN_CORNER_LOCAL_X) < 3 &&
  z < 0.75 &&
  z > -8.5
const isInsideLandingClearance = (x, z) =>
  Math.hypot(x - LANDING_LOCAL_X, z - LANDING_LOCAL_Z) <
  LANDING_CLEARANCE_RADIUS

const CHERRY_TREE_LAYOUT = TREE_X_POSITIONS.map((x, index) => {
  const z = index === 9 ? -4 : -4.25 - pseudoRandom(index, 7) * 1.8
  const turnDistance = Math.max(0, TURN_CORNER_LOCAL_X - x)
  const canopyTaper = THREE.MathUtils.clamp(turnDistance / 5, 0.48, 1)
  return [
    x,
    0,
    z,
    (0.86 + pseudoRandom(index, 8) * 0.3) * canopyTaper,
    index % 3,
    -0.08 + pseudoRandom(index, 10) * 0.16,
  ]
}).filter(([x, , z]) => !isInsideTurnClearance(x, z))

const LAMP_TREE_CLEARANCE = 2.15
const LAMP_LANDMARK_CLEARANCE = 2.2
const isInsideTreeClearance = (x, z) =>
  CHERRY_TREE_LAYOUT.some(([treeX, , treeZ]) =>
    Math.hypot(x - treeX, z - treeZ) < LAMP_TREE_CLEARANCE
  )
const isInsideLandmarkClearance = (x, z) =>
  CAMPUS_LANDMARKS.some(({ localX, z: landmarkZ }) =>
    Math.hypot(x - localX, z - landmarkZ) < LAMP_LANDMARK_CLEARANCE
  )

// A sparse rear-edge rhythm keeps the path illuminated without placing poles
// between the camera and the interactive props.
const LAMP_LAYOUT = [
  [-11.8, -2],
  [-6.8, -2.1],
  [-2.4, -2.05],
  [2.6, -2.1],
].filter(
  ([x, z]) =>
    !isInsideTurnClearance(x, z) &&
    !isInsideLandingClearance(x, z) &&
    !isInsideTreeClearance(x, z) &&
    !isInsideLandmarkClearance(x, z),
)

const PATH_JOINT_X_POSITIONS = Object.freeze(
  Array.from({ length: 13 }, (_, index) => -12 + index * 2),
)

const EASEL_LANDMARK = CAMPUS_LANDMARKS.find(({ id }) => id === 'easel')
const BADMINTON_LANDMARK = CAMPUS_LANDMARKS.find(
  ({ id }) => id === 'badminton',
)
const SKILLS_LANDMARK = CAMPUS_LANDMARKS.find(({ id }) => id === 'skills')
const BADGE_REVEAL_LEAD_DISTANCE = 3.25
const BADGE_REVEAL_TRAILING_DISTANCE = 2.4
const BADGE_REVEAL_START = SCENE_RANGES.campus.fadeInEnd + 0.015

const PETAL_COUNT = 150
const MATERIAL_DAMPING = 2
const LAMP_DAY_COLOR = new THREE.Color('#FFF6E0')
const LAMP_NIGHT_COLOR = new THREE.Color('#FFD580')
const LAMP_DAY_EMISSIVE = new THREE.Color('#FFD15C')
const LAMP_NIGHT_EMISSIVE = new THREE.Color('#FFD580')
const PETAL_DAY_COLOR = new THREE.Color('#FFB7C5')
const SAKURA_NIGHT_COLOR = new THREE.Color('#C084FC')
const PETAL_BOUNDS = Object.freeze({
  minX: -13,
  maxX: 13,
  minY: 0.18,
  maxY: 7,
  minZ: -8,
  maxZ: 4,
})

const dampColor = (current, target, delta) => {
  current.r = THREE.MathUtils.damp(
    current.r,
    target.r,
    MATERIAL_DAMPING,
    delta,
  )
  current.g = THREE.MathUtils.damp(
    current.g,
    target.g,
    MATERIAL_DAMPING,
    delta,
  )
  current.b = THREE.MathUtils.damp(
    current.b,
    target.b,
    MATERIAL_DAMPING,
    delta,
  )
}

function ClayMaterial({
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  transparent = false,
  opacity = 1,
  side,
  depthWrite = true,
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1}
      metalness={0}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      flatShading
      transparent={transparent}
      opacity={opacity}
      side={side}
      depthWrite={depthWrite}
    />
  )
}

function SakuraCanopyMaterial({ color, materialRef }) {
  return (
    <meshStandardMaterial
      ref={materialRef}
      color={color}
      emissive="#C084FC"
      emissiveIntensity={0}
      roughness={1}
      metalness={0}
      flatShading
    />
  )
}

function CherryBlossomTree({
  position,
  scale,
  variant,
  canopyLean,
  isNight,
}) {
  const canopyMaterialRefs = useRef([])
  const canopyColors = useMemo(() => {
    const palette =
      variant === 1
        ? ['#FFC0CB', '#FFB7C5']
        : variant === 2
          ? ['#FFD0D9', '#FFB7C5']
          : ['#FFB7C5', '#FFC0CB']

    return [palette[0], palette[1], palette[1], palette[0], palette[1]].map(
      (color) => new THREE.Color(color),
    )
  }, [variant])

  useFrame((_, delta) => {
    canopyMaterialRefs.current.forEach((material, index) => {
      if (!material) return
      dampColor(
        material.color,
        isNight ? SAKURA_NIGHT_COLOR : canopyColors[index],
        delta,
      )
      material.emissiveIntensity = THREE.MathUtils.damp(
        material.emissiveIntensity,
        isNight ? 0.22 : 0,
        MATERIAL_DAMPING,
        delta,
      )
    })
  })

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.28, 1.84, 8]} />
        <ClayMaterial color="#8B5A4A" />
      </mesh>

      <group
        name="cloudCanopy"
        rotation={[canopyLean, (variant - 1) * 0.055, variant % 2 ? -0.035 : 0.035]}
      >
        <mesh position={[0, 2.2, 0]} scale={[1.2, 0.9, 1]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <SakuraCanopyMaterial
            color={canopyColors[0]}
            materialRef={(material) => {
              canopyMaterialRefs.current[0] = material
            }}
          />
        </mesh>
        <mesh position={[-0.82, 2.14, 0.08]} scale={[0.82, 0.7, 0.76]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <SakuraCanopyMaterial
            color={canopyColors[1]}
            materialRef={(material) => {
              canopyMaterialRefs.current[1] = material
            }}
          />
        </mesh>
        <mesh position={[0.82, 2.16, 0.03]} scale={[0.84, 0.72, 0.78]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <SakuraCanopyMaterial
            color={canopyColors[2]}
            materialRef={(material) => {
              canopyMaterialRefs.current[2] = material
            }}
          />
        </mesh>
        <mesh position={[-0.34, 2.85, -0.06]} scale={[0.74, 0.65, 0.7]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <SakuraCanopyMaterial
            color={canopyColors[3]}
            materialRef={(material) => {
              canopyMaterialRefs.current[3] = material
            }}
          />
        </mesh>
        <mesh position={[0.38, 2.78, 0.05]} scale={[0.76, 0.63, 0.72]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <SakuraCanopyMaterial
            color={canopyColors[4]}
            materialRef={(material) => {
              canopyMaterialRefs.current[4] = material
            }}
          />
        </mesh>
      </group>
    </group>
  )
}

function FallingPetals({ isNight }) {
  const petalsRef = useRef()
  const petalMaterialRef = useRef()
  const petalTransform = useMemo(() => new THREE.Object3D(), [])
  const particleData = useMemo(() => {
    const horizontalOffsets = new Float32Array(PETAL_COUNT)
    const verticalOffsets = new Float32Array(PETAL_COUNT)
    const originZ = new Float32Array(PETAL_COUNT)
    const speeds = new Float32Array(PETAL_COUNT)
    const drifts = new Float32Array(PETAL_COUNT)
    const phases = new Float32Array(PETAL_COUNT)
    const scales = new Float32Array(PETAL_COUNT)

    for (let index = 0; index < PETAL_COUNT; index += 1) {
      const x =
        PETAL_BOUNDS.minX +
        pseudoRandom(index, 1) * (PETAL_BOUNDS.maxX - PETAL_BOUNDS.minX)
      const y =
        PETAL_BOUNDS.minY +
        pseudoRandom(index, 2) * (PETAL_BOUNDS.maxY - PETAL_BOUNDS.minY)
      const z =
        PETAL_BOUNDS.minZ +
        pseudoRandom(index, 3) * (PETAL_BOUNDS.maxZ - PETAL_BOUNDS.minZ)

      horizontalOffsets[index] = x - PETAL_BOUNDS.minX
      verticalOffsets[index] = PETAL_BOUNDS.maxY - y
      originZ[index] = z
      speeds[index] = 0.2 + pseudoRandom(index, 4) * 0.24
      drifts[index] = 0.08 + pseudoRandom(index, 5) * 0.11
      phases[index] = pseudoRandom(index, 6) * Math.PI * 2
      scales[index] = 0.7 + pseudoRandom(index, 11) * 0.65
    }

    return {
      horizontalOffsets,
      verticalOffsets,
      originZ,
      speeds,
      drifts,
      phases,
      scales,
    }
  }, [])

  useEffect(() => {
    petalsRef.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((state, delta) => {
    const petals = petalsRef.current
    if (!petals) return

    if (petalMaterialRef.current) {
      dampColor(
        petalMaterialRef.current.color,
        isNight ? SAKURA_NIGHT_COLOR : PETAL_DAY_COLOR,
        delta,
      )
      petalMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        petalMaterialRef.current.emissiveIntensity,
        isNight ? 0.28 : 0,
        MATERIAL_DAMPING,
        delta,
      )
    }

    const elapsed = state.clock.elapsedTime
    const {
      horizontalOffsets,
      verticalOffsets,
      originZ,
      speeds,
      drifts,
      phases,
      scales,
    } = particleData
    const width = PETAL_BOUNDS.maxX - PETAL_BOUNDS.minX
    const height = PETAL_BOUNDS.maxY - PETAL_BOUNDS.minY

    for (let index = 0; index < PETAL_COUNT; index += 1) {
      const x =
        PETAL_BOUNDS.minX +
        (horizontalOffsets[index] + elapsed * drifts[index]) % width
      const y =
        PETAL_BOUNDS.maxY -
        (verticalOffsets[index] + elapsed * speeds[index]) % height

      petalTransform.position.set(
        x,
        y,
        originZ[index] +
          Math.sin(elapsed * 0.55 + phases[index]) * 0.32,
      )
      petalTransform.rotation.set(
        elapsed * 0.7 + phases[index],
        elapsed * 0.45 + phases[index] * 0.5,
        Math.sin(elapsed + phases[index]) * 0.55,
      )
      petalTransform.scale.setScalar(scales[index])
      petalTransform.updateMatrix()
      petals.setMatrixAt(index, petalTransform.matrix)
    }

    petals.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={petalsRef}
      args={[null, null, PETAL_COUNT]}
      frustumCulled={false}
    >
      <circleGeometry args={[0.085, 5]} />
      <meshStandardMaterial
        ref={petalMaterialRef}
        color="#FFB7C5"
        emissive="#C084FC"
        emissiveIntensity={0}
        roughness={1}
        metalness={0}
        flatShading
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function VintageLampPost({ position, isNight }) {
  const bulbMaterialRef = useRef()
  const pointLightRef = useRef()

  useFrame((_, delta) => {
    if (bulbMaterialRef.current) {
      dampColor(
        bulbMaterialRef.current.color,
        isNight ? LAMP_NIGHT_COLOR : LAMP_DAY_COLOR,
        delta,
      )
      dampColor(
        bulbMaterialRef.current.emissive,
        isNight ? LAMP_NIGHT_EMISSIVE : LAMP_DAY_EMISSIVE,
        delta,
      )
      bulbMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        bulbMaterialRef.current.emissiveIntensity,
        isNight ? 1.35 : 0.06,
        MATERIAL_DAMPING,
        delta,
      )
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = THREE.MathUtils.damp(
        pointLightRef.current.intensity,
        isNight ? 1.2 : 0,
        MATERIAL_DAMPING,
        delta,
      )
    }
  })

  return (
    <group position={position} name="vintageLampPost">
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.24, 8]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.1, 1.9, 8]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 2.02, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.14, 0.2, 8]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 2.19, 0]} castShadow>
        <dodecahedronGeometry args={[0.23, 0]} />
        <meshStandardMaterial
          ref={bulbMaterialRef}
          color="#FFF6E0"
          emissive="#FFD15C"
          emissiveIntensity={0.06}
          roughness={1}
          metalness={0}
          flatShading
        />
      </mesh>
      <mesh position={[0, 2.42, 0]} castShadow>
        <coneGeometry args={[0.34, 0.24, 8]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <pointLight
        ref={pointLightRef}
        color="#FFD580"
        intensity={0}
        distance={5}
        decay={2}
        position={[0, 2.2, 0]}
      />
    </group>
  )
}

function ClickableLandmark({
  children,
  landmark,
  onSelect,
  bobAmount = 0.15,
  hotspotY = 2.5,
  hitboxSize = [2.4, 3, 2.2],
  isSceneActive = false,
  htmlPortal,
}) {
  const isHoveredRef = useRef(false)
  const previousCursorRef = useRef('')
  const floatingRef = useRef()
  const hotspotRef = useRef()
  const badgeRef = useRef()
  const badgeElementRef = useRef()
  const badgeVisibilityRef = useRef(0)
  const scroll = useScroll()
  const { isNightMode } = useDayNight()

  useEffect(() => {
    if (!isSceneActive && isHoveredRef.current) {
      isHoveredRef.current = false
      document.body.style.cursor = previousCursorRef.current
    }
    return () => {
      if (!isHoveredRef.current) return
      isHoveredRef.current = false
      document.body.style.cursor = previousCursorRef.current
    }
  }, [isSceneActive])

  useFrame((state, delta) => {
    if (!floatingRef.current) return

    const elapsed = state.clock.elapsedTime
    floatingRef.current.position.y =
      Math.sin(elapsed * landmark.bobSpeed + landmark.bobPhase) * bobAmount

    const targetScale = isHoveredRef.current ? 1.06 : 1
    const damping = 1 - Math.exp(-10 * delta)
    floatingRef.current.scale.x +=
      (targetScale - floatingRef.current.scale.x) * damping
    floatingRef.current.scale.y +=
      (targetScale - floatingRef.current.scale.y) * damping
    floatingRef.current.scale.z +=
      (targetScale - floatingRef.current.scale.z) * damping

    if (!isSceneActive) {
      badgeVisibilityRef.current = 0
      return
    }
    if (!hotspotRef.current || !badgeRef.current) return

    const characterX = getCharacterXAtOffset(scroll.offset)
    const landmarkDistance = landmark.worldX - characterX
    const isInsideRevealWindow =
      scroll.offset >= BADGE_REVEAL_START &&
      landmarkDistance <= BADGE_REVEAL_LEAD_DISTANCE &&
      landmarkDistance >= -BADGE_REVEAL_TRAILING_DISTANCE
    badgeVisibilityRef.current = THREE.MathUtils.damp(
      badgeVisibilityRef.current,
      isInsideRevealWindow ? 1 : 0,
      7,
      delta,
    )

    const badgeVisibility = badgeVisibilityRef.current
    if (badgeElementRef.current) {
      badgeElementRef.current.style.opacity = `${badgeVisibility}`
      badgeElementRef.current.style.visibility =
        badgeVisibility > 0.01 ? 'visible' : 'hidden'
      badgeElementRef.current.style.transform = `translate3d(0, ${
        (1 - badgeVisibility) * 8
      }px, 0) scale(${0.96 + badgeVisibility * 0.04})`
    }

    const pulseWave = Math.sin(elapsed * 2.8 + landmark.bobPhase)
    const hotspotPulse =
      (isHoveredRef.current ? 1.24 : 1.04) + pulseWave * 0.12
    hotspotRef.current.visible = badgeVisibility > 0.01
    hotspotRef.current.scale.setScalar(
      hotspotPulse * (0.72 + badgeVisibility * 0.28),
    )
    hotspotRef.current.position.y = hotspotY + pulseWave * 0.07
    badgeRef.current.position.y =
      hotspotY + 0.62 +
      Math.sin(elapsed * 1.8 + landmark.bobPhase) * 0.1
  })

  return (
    <group
      name={`${landmark.id}ClickableLandmark`}
      position={[landmark.localX, 0, landmark.z]}
      onClick={(event) => {
        if (!isSceneActive) return
        event.stopPropagation()
        onSelect(landmark.id)
      }}
      onPointerEnter={(event) => {
        if (!isSceneActive) return
        event.stopPropagation()
        if (!isHoveredRef.current) {
          previousCursorRef.current = document.body.style.cursor
        }
        isHoveredRef.current = true
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        if (!isHoveredRef.current) return
        isHoveredRef.current = false
        document.body.style.cursor = previousCursorRef.current
      }}
    >
      {isSceneActive && (
        <>
          <mesh
            name={`${landmark.id}ClickTarget`}
            position={[0, hitboxSize[1] * 0.5, 0]}
          >
            <boxGeometry args={hitboxSize} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
              colorWrite={false}
            />
          </mesh>

          <group
            ref={hotspotRef}
            name={`${landmark.id}ClickHotspot`}
            position={[0, hotspotY, 0.45]}
            visible={false}
          >
            <mesh>
              <torusGeometry args={[0.3, 0.065, 8, 24]} />
              <ClayMaterial
                color="#FFE066"
                emissive="#FF9F1C"
                emissiveIntensity={0.95}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.095, 8, 6]} />
              <ClayMaterial
                color="#FFFFFF"
                emissive="#FFE066"
                emissiveIntensity={0.9}
              />
            </mesh>
            <pointLight
              color="#FFD15C"
              intensity={0.35}
              distance={2.4}
              decay={2}
            />
          </group>

          {/* This local group keeps Drei's DOM projection anchored to the
              owning landmark instead of the campus or world origin. */}
          <group
            ref={badgeRef}
            name={`${landmark.id}HintBadge`}
            position={[0, hotspotY + 0.62, 0.45]}
          >
            <Html
              center
              occlude={false}
              portal={htmlPortal}
              zIndexRange={[30, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div
                ref={badgeElementRef}
                aria-hidden="true"
                className={`pointer-events-none flex whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[0.68rem] font-semibold tracking-[0.04em] shadow-[0_8px_24px_rgba(15,23,42,0.2)] backdrop-blur-md transition-colors duration-500 ${
                  isNightMode
                    ? 'border-white/20 bg-[#1E293B]/90 text-[#F8FAFC]'
                    : 'border-white/90 bg-[#FFF9F4]/95 text-[#3E2723]'
                }`}
                style={{
                  opacity: 0,
                  visibility: 'hidden',
                  transform: 'translate3d(0, 8px, 0) scale(0.96)',
                  transformOrigin: 'center',
                  willChange: 'opacity, transform',
                }}
              >
                <span className="relative mr-2 flex size-2 items-center justify-center self-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#FFD15C] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#E88C47]" />
                </span>
                View
              </div>
            </Html>
          </group>
        </>
      )}

      <group ref={floatingRef}>{children}</group>
    </group>
  )
}

function Easel({ onSelect, isSceneActive, htmlPortal }) {
  return (
    <ClickableLandmark
      landmark={EASEL_LANDMARK}
      onSelect={onSelect}
      hotspotY={2.65}
      hitboxSize={[2.7, 3.2, 2]}
      isSceneActive={isSceneActive}
      htmlPortal={htmlPortal}
    >
      <group name="easelLandmark" scale={1.18}>
        <mesh position={[-0.36, 0.68, 0]} rotation={[0, 0, 0.24]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 1.75, 6]} />
          <ClayMaterial color="#A96F45" />
        </mesh>
        <mesh position={[0.36, 0.68, 0]} rotation={[0, 0, -0.24]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 1.75, 6]} />
          <ClayMaterial color="#A96F45" />
        </mesh>
        <mesh position={[0, 0.56, -0.22]} rotation={[0.32, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.62, 6]} />
          <ClayMaterial color="#8B5A2B" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.82, 0.09]} />
          <ClayMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.88, 0.08]} castShadow>
          <boxGeometry args={[1.18, 0.08, 0.18]} />
          <ClayMaterial color="#8B5A2B" />
        </mesh>

        <group name="artistStool" position={[1.05, 0, 0.08]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 0.18, 6]} />
            <ClayMaterial color="#B97949" />
          </mesh>
          {[-0.23, 0.23].map((legX) => (
            <mesh
              key={`stool-leg-${legX}`}
              position={[legX, 0.22, 0]}
              rotation={[0, 0, legX < 0 ? -0.08 : 0.08]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.05, 0.5, 6]} />
              <ClayMaterial color="#8B5A2B" />
            </mesh>
          ))}
          {['#FF6B6B', '#FFD15C', '#5BC0BE'].map((color, index) => (
            <mesh
              key={color}
              position={[-0.15 + index * 0.15, 0.63, 0]}
              rotation={[index * 0.4, index * 0.7, 0]}
              scale={[0.1, 0.07, 0.08]}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <ClayMaterial color={color} />
            </mesh>
          ))}
        </group>
      </group>
    </ClickableLandmark>
  )
}

function BadmintonRacket({ onSelect, isSceneActive, htmlPortal }) {
  return (
    <>
      <ClickableLandmark
        landmark={BADMINTON_LANDMARK}
        onSelect={onSelect}
        bobAmount={0}
        hotspotY={2}
        hitboxSize={[1.8, 2.6, 1.8]}
        isSceneActive={isSceneActive}
        htmlPortal={htmlPortal}
      >
        <group
          position={[0, 0, 0.02]}
          rotation={[0.08, -0.12, -0.38]}
          name="badmintonLandmark"
        >
          <mesh position={[0, 1.23, 0]} castShadow>
            <torusGeometry args={[0.3, 0.05, 16]} />
            <ClayMaterial color="#E88C47" />
          </mesh>
          <mesh position={[0, 1.23, -0.01]}>
            <circleGeometry args={[0.265, 12]} />
            <ClayMaterial
              color="#F4F4F4"
              transparent
              opacity={0.24}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <ClayMaterial color="#465577" />
          </mesh>
        </group>
      </ClickableLandmark>

      <group
        name="shuttlecock"
        position={[
          BADMINTON_LANDMARK.localX + 0.7,
          0.14,
          BADMINTON_LANDMARK.z + 0.36,
        ]}
        rotation={[0, 0, -0.7]}
      >
        <mesh position={[0, 0.1, 0]} castShadow>
          <coneGeometry args={[0.17, 0.32, 6]} />
          <ClayMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 6]} />
          <ClayMaterial color="#F5F5F5" />
        </mesh>
      </group>
    </>
  )
}

function SkillsLaptop({ onSelect, isSceneActive, htmlPortal }) {
  return (
    <ClickableLandmark
      landmark={SKILLS_LANDMARK}
      onSelect={onSelect}
      hotspotY={2.35}
      hitboxSize={[3.2, 2.8, 2.2]}
      isSceneActive={isSceneActive}
      htmlPortal={htmlPortal}
    >
      <group name="laptopBenchLandmark">
        <RoundedBox
          args={[2.1, 0.2, 0.72]}
          radius={0.08}
          smoothness={4}
          position={[0, 0.58, 0]}
          castShadow
        >
          <ClayMaterial color="#A96F45" />
        </RoundedBox>
        {[-0.72, 0.72].map((legX) => (
          <mesh key={legX} position={[legX, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.55, 12]} />
            <ClayMaterial color="#8B5A2B" />
          </mesh>
        ))}
        {[0.92, 1.16, 1.4].map((slatY) => (
          <RoundedBox
            key={`bench-slat-${slatY}`}
            args={[2.08, 0.16, 0.14]}
            radius={0.045}
            smoothness={3}
            position={[0, slatY, -0.26]}
            castShadow
          >
            <ClayMaterial color="#B97949" />
          </RoundedBox>
        ))}
        <RoundedBox
          args={[0.72, 0.5, 0.065]}
          radius={0.05}
          smoothness={4}
          position={[0, 1.04, 0.12]}
          rotation={[-0.18, 0, 0]}
          castShadow
        >
          <ClayMaterial color="#25272D" />
        </RoundedBox>
        <RoundedBox
          args={[0.62, 0.4, 0.02]}
          radius={0.025}
          smoothness={2}
          position={[0, 1.04, 0.158]}
          rotation={[-0.18, 0, 0]}
        >
          <ClayMaterial color="#101217" emissive="#202631" emissiveIntensity={0.18} />
        </RoundedBox>
        <RoundedBox
          args={[0.72, 0.045, 0.46]}
          radius={0.035}
          smoothness={3}
          position={[0, 0.78, 0.26]}
          castShadow
        >
          <ClayMaterial color="#465577" />
        </RoundedBox>

        <RoundedBox
          args={[0.3, 0.045, 0.5]}
          radius={0.05}
          smoothness={3}
          position={[-0.67, 0.72, 0.15]}
          rotation={[0, 0.12, 0]}
          castShadow
        >
          <ClayMaterial color="#111111" />
        </RoundedBox>
        <RoundedBox
          args={[0.24, 0.012, 0.4]}
          radius={0.035}
          smoothness={2}
          position={[-0.67, 0.75, 0.15]}
          rotation={[0, 0.12, 0]}
        >
          <ClayMaterial color="#30343B" />
        </RoundedBox>

        <group name="hardwareBoard" position={[0.69, 0.72, 0.14]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.06, 0.3]} />
            <ClayMaterial color="#3F8F55" />
          </mesh>
          {[-0.12, 0, 0.12].map((pinX) => (
            <mesh key={`board-pin-${pinX}`} position={[pinX, 0.045, 0.08]}>
              <boxGeometry args={[0.045, 0.025, 0.08]} />
              <ClayMaterial color="#D6C8A6" />
            </mesh>
          ))}
          <mesh position={[0.12, 0.08, -0.06]} castShadow>
            <sphereGeometry args={[0.045, 8, 6]} />
            <ClayMaterial
              color="#FF4545"
              emissive="#FF2020"
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      </group>
    </ClickableLandmark>
  )
}

function CampusSpringLights({ isNight }) {
  const blossomLightRef = useRef()
  const morningLightRef = useRef()

  useFrame((_, delta) => {
    if (blossomLightRef.current) {
      blossomLightRef.current.intensity = THREE.MathUtils.damp(
        blossomLightRef.current.intensity,
        isNight ? 0.2 : 1.05,
        2.4,
        delta,
      )
    }
    if (morningLightRef.current) {
      morningLightRef.current.intensity = THREE.MathUtils.damp(
        morningLightRef.current.intensity,
        isNight ? 0.28 : 1.3,
        2.4,
        delta,
      )
    }
  })

  return (
    <group name="campusSpringLights">
      <pointLight
        ref={blossomLightRef}
        name="blossomFillLight"
        color="#FFD6E5"
        intensity={1.05}
        distance={18}
        decay={2}
        position={[-6, 7, 2]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0015}
        shadow-normalBias={0.03}
        shadow-radius={6}
      />
      <pointLight
        ref={morningLightRef}
        name="morningKeyLight"
        color="#FFF0B5"
        intensity={1.3}
        distance={20}
        decay={2}
        position={[7, 8, 3]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0015}
        shadow-normalBias={0.03}
        shadow-radius={6}
      />
    </group>
  )
}

export default function Campus({
  position = [0, 0, 0],
  onSelect = () => {},
  areParticlesActive = true,
  isSceneActive = false,
  htmlPortal,
}) {
  const { isNightMode: isNight } = useDayNight()

  return (
    <group position={position} name="campusScene">
      <RoundedBox
        args={[28, 0.36, 14]}
        radius={0.18}
        smoothness={5}
        position={[0, -0.16, -2]}
        receiveShadow
      >
        <LowPolyGrassMaterial />
      </RoundedBox>

      <RoundedBox
        args={[26, 0.14, 2.8]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.12, 0]}
        receiveShadow
      >
        <ClayMaterial color="#E0E0E0" />
      </RoundedBox>

      <group name="structuredStonePathJoints">
        {PATH_JOINT_X_POSITIONS.map((x) => (
          <mesh key={`path-joint-${x}`} position={[x, 0.197, 0]} receiveShadow>
            <boxGeometry args={[0.035, 0.018, 2.62]} />
            <ClayMaterial color="#C8C8C8" />
          </mesh>
        ))}
      </group>

      {CHERRY_TREE_LAYOUT.map(([x, y, z, scale, variant, canopyLean]) => (
        <CherryBlossomTree
          key={`${x}-${z}`}
          position={[x, y, z]}
          scale={scale}
          variant={variant}
          canopyLean={canopyLean}
          isNight={isNight}
        />
      ))}

      {LAMP_LAYOUT.map(([x, z]) => (
        <VintageLampPost key={`${x}-${z}`} position={[x, 0, z]} isNight={isNight} />
      ))}

      {areParticlesActive && <FallingPetals isNight={isNight} />}
      <Easel
        onSelect={onSelect}
        isSceneActive={isSceneActive}
        htmlPortal={htmlPortal}
      />
      <BadmintonRacket
        onSelect={onSelect}
        isSceneActive={isSceneActive}
        htmlPortal={htmlPortal}
      />
      <SkillsLaptop
        onSelect={onSelect}
        isSceneActive={isSceneActive}
        htmlPortal={htmlPortal}
      />
      <CampusSpringLights isNight={isNight} />
    </group>
  )
}
