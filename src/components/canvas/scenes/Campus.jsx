import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor, useScroll } from '@react-three/drei'
import {
  CAMPUS_LANDMARKS,
  getCampusLandmarkProximity,
} from '../../../config/narrativeTimeline'

const pseudoRandom = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const TREE_X_POSITIONS = [
  -11, -9.25, -7.5, -5.75, -4, -2.25, -0.5, 1.25, 3, 4.75, 6.5, 8.25,
  10,
]

const CHERRY_TREE_LAYOUT = TREE_X_POSITIONS.map((x, index) => [
  x,
  0,
  -3.8 - pseudoRandom(index, 7) * 3.8,
  0.76 + pseudoRandom(index, 8) * 0.3,
  index % 3,
])

const LAMP_X_POSITIONS = [-10, -6, -2, 2, 6, 10]
const LAMP_LAYOUT = LAMP_X_POSITIONS.map((x, index) => [
  x,
  -3.1 - pseudoRandom(index, 9) * 0.7,
])

const EASEL_LANDMARK = CAMPUS_LANDMARKS.find(({ id }) => id === 'easel')
const BADMINTON_LANDMARK = CAMPUS_LANDMARKS.find(
  ({ id }) => id === 'badminton',
)
const SKILLS_LANDMARK = CAMPUS_LANDMARKS.find(({ id }) => id === 'skills')

const PETAL_COUNT = 150
const PETAL_BOUNDS = Object.freeze({
  minX: -8,
  maxX: 8,
  minY: 0.18,
  maxY: 4.7,
  minZ: -8,
  maxZ: 4,
})

function ClayMaterial({
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1}
      metalness={0}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  )
}

function CherryBlossomTree({ position, scale, variant }) {
  const palette =
    variant === 1
      ? ['#FFC0CB', '#FFB7C5']
      : variant === 2
        ? ['#FFD0D9', '#FFB7C5']
        : ['#FFB7C5', '#FFC0CB']

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.84, 16]} />
        <ClayMaterial color="#8B5A4A" />
      </mesh>

      <group name="cloudCanopy">
        <mesh position={[0, 2.12, 0]} scale={[1.08, 0.76, 0.9]} castShadow>
          <sphereGeometry args={[1, 20, 18]} />
          <ClayMaterial color={palette[0]} />
        </mesh>
        <mesh position={[-0.72, 2.06, 0.05]} scale={[0.68, 0.58, 0.66]} castShadow>
          <sphereGeometry args={[1, 18, 16]} />
          <ClayMaterial color={palette[1]} />
        </mesh>
        <mesh position={[0.7, 2.1, 0.02]} scale={[0.7, 0.6, 0.68]} castShadow>
          <sphereGeometry args={[1, 18, 16]} />
          <ClayMaterial color={palette[1]} />
        </mesh>
        <mesh position={[-0.28, 2.62, -0.04]} scale={[0.62, 0.54, 0.6]} castShadow>
          <sphereGeometry args={[1, 18, 16]} />
          <ClayMaterial color={palette[0]} />
        </mesh>
        <mesh position={[0.34, 2.57, 0.04]} scale={[0.64, 0.52, 0.62]} castShadow>
          <sphereGeometry args={[1, 18, 16]} />
          <ClayMaterial color={palette[1]} />
        </mesh>
      </group>
    </group>
  )
}

function FallingPetals() {
  const pointsRef = useRef()
  const particleData = useMemo(() => {
    const positions = new Float32Array(PETAL_COUNT * 3)
    const originX = new Float32Array(PETAL_COUNT)
    const originY = new Float32Array(PETAL_COUNT)
    const speeds = new Float32Array(PETAL_COUNT)
    const drifts = new Float32Array(PETAL_COUNT)

    for (let index = 0; index < PETAL_COUNT; index += 1) {
      const positionIndex = index * 3
      const x =
        PETAL_BOUNDS.minX +
        pseudoRandom(index, 1) * (PETAL_BOUNDS.maxX - PETAL_BOUNDS.minX)
      const y =
        PETAL_BOUNDS.minY +
        pseudoRandom(index, 2) * (PETAL_BOUNDS.maxY - PETAL_BOUNDS.minY)
      const z =
        PETAL_BOUNDS.minZ +
        pseudoRandom(index, 3) * (PETAL_BOUNDS.maxZ - PETAL_BOUNDS.minZ)

      positions[positionIndex] = x
      positions[positionIndex + 1] = y
      positions[positionIndex + 2] = z
      originX[index] = x
      originY[index] = y
      speeds[index] = 0.18 + pseudoRandom(index, 4) * 0.22
      drifts[index] = 0.04 + pseudoRandom(index, 5) * 0.07
    }

    return { positions, originX, originY, speeds, drifts }
  }, [])

  useFrame((state, delta) => {
    const positionAttribute = pointsRef.current?.geometry.attributes.position
    if (!positionAttribute) return

    const elapsed = state.clock.elapsedTime
    const positions = positionAttribute.array
    const { originX, originY, speeds, drifts } = particleData

    for (let index = 0; index < PETAL_COUNT; index += 1) {
      const positionIndex = index * 3
      positions[positionIndex] += drifts[index] * delta
      positions[positionIndex + 1] -= speeds[index] * delta
      positions[positionIndex + 2] +=
        Math.sin(elapsed * 0.65 + index * 0.37) * 0.035 * delta

      if (
        positions[positionIndex + 1] < PETAL_BOUNDS.minY ||
        positions[positionIndex] > PETAL_BOUNDS.maxX
      ) {
        positions[positionIndex] = originX[index]
        positions[positionIndex + 1] = originY[index]
      }
    }

    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFB7C5"
        size={0.065}
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
      />
    </points>
  )
}

function VintageLampPost({ position, isNight }) {
  return (
    <group position={position} name="vintageLampPost">
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.24, 18]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.1, 1.9, 16]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 2.02, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.14, 0.2, 16]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <mesh position={[0, 2.19, 0]} castShadow>
        <sphereGeometry args={[0.23, 18, 16]} />
        <ClayMaterial
          color={isNight ? '#FFE8A3' : '#FFF6E0'}
          emissive="#FFD15C"
          emissiveIntensity={isNight ? 1.1 : 0.06}
        />
      </mesh>
      <mesh position={[0, 2.42, 0]} castShadow>
        <coneGeometry args={[0.34, 0.24, 18]} />
        <ClayMaterial color="#3D4054" />
      </mesh>
      <pointLight
        color="#FFD15C"
        intensity={isNight ? 1.5 : 0}
        distance={4.4}
        decay={2}
        position={[0, 2.2, 0]}
      />
    </group>
  )
}

function ProximityLandmark({ children, landmark, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)
  const anchorRef = useRef()
  const floatingRef = useRef()
  const scroll = useScroll()
  useCursor(isHovered, 'pointer', 'auto')

  useFrame((state, delta) => {
    if (!anchorRef.current || !floatingRef.current) return

    const elapsed = state.clock.elapsedTime
    const proximity = getCampusLandmarkProximity(scroll.offset, landmark)
    floatingRef.current.position.y =
      Math.sin(elapsed * landmark.bobSpeed + landmark.bobPhase) * 0.15

    const targetScale = isHovered ? 1.06 : 1 + proximity * 0.025
    const damping = 1 - Math.exp(-10 * delta)
    floatingRef.current.scale.x +=
      (targetScale - floatingRef.current.scale.x) * damping
    floatingRef.current.scale.y +=
      (targetScale - floatingRef.current.scale.y) * damping
    floatingRef.current.scale.z +=
      (targetScale - floatingRef.current.scale.z) * damping
  })

  return (
    <group
      ref={anchorRef}
      position={[landmark.localX, 0, landmark.z]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(landmark.id)
      }}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={() => setIsHovered(false)}
    >
      <group ref={floatingRef}>{children}</group>
    </group>
  )
}

function Easel({ onSelect }) {
  return (
    <ProximityLandmark landmark={EASEL_LANDMARK} onSelect={onSelect}>
      <group name="easelLandmark">
        <RoundedBox
          args={[0.94, 0.74, 0.08]}
          radius={0.06}
          smoothness={4}
          position={[0, 1.18, 0]}
          castShadow
        >
          <ClayMaterial color="#FFF8E9" />
        </RoundedBox>
        <RoundedBox
          args={[0.7, 0.5, 0.045]}
          radius={0.04}
          smoothness={3}
          position={[0, 1.18, 0.06]}
        >
          <ClayMaterial color="#A9C5D4" />
        </RoundedBox>
        <mesh position={[-0.34, 0.46, 0]} rotation={[0, 0, 0.24]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.5, 10]} />
          <ClayMaterial color="#A96F45" />
        </mesh>
        <mesh position={[0.34, 0.46, 0]} rotation={[0, 0, -0.24]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.5, 10]} />
          <ClayMaterial color="#A96F45" />
        </mesh>
      </group>
    </ProximityLandmark>
  )
}

function BadmintonRacket({ onSelect }) {
  return (
    <ProximityLandmark landmark={BADMINTON_LANDMARK} onSelect={onSelect}>
      <group
        rotation={[0, 0, -0.24]}
        name="badmintonLandmark"
      >
        <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.38, 0.055, 12, 24]} />
          <ClayMaterial color="#E88C47" />
        </mesh>
        <mesh position={[0, 0.27, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 0.78, 12]} />
          <ClayMaterial color="#465577" />
        </mesh>
        <mesh position={[0.58, 0.84, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <ClayMaterial color="#F7F1E7" />
        </mesh>
      </group>
    </ProximityLandmark>
  )
}

function SkillsLaptop({ onSelect }) {
  return (
    <ProximityLandmark landmark={SKILLS_LANDMARK} onSelect={onSelect}>
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
        <RoundedBox
          args={[2.08, 0.72, 0.14]}
          radius={0.06}
          smoothness={4}
          position={[0, 1.02, -0.26]}
          castShadow
        >
          <ClayMaterial color="#B97949" />
        </RoundedBox>
        <RoundedBox
          args={[0.64, 0.4, 0.055]}
          radius={0.05}
          smoothness={4}
          position={[0, 1.02, 0.12]}
          rotation={[-0.18, 0, 0]}
          castShadow
        >
          <ClayMaterial color="#30364B" />
        </RoundedBox>
        <RoundedBox
          args={[0.64, 0.045, 0.43]}
          radius={0.035}
          smoothness={3}
          position={[0, 0.78, 0.26]}
          castShadow
        >
          <ClayMaterial color="#465577" />
        </RoundedBox>
      </group>
    </ProximityLandmark>
  )
}

export default function Campus({
  position = [0, 0, 0],
  isNight = false,
  onSelect = () => {},
}) {
  return (
    <group position={position} name="campusScene">
      <RoundedBox
        args={[26, 0.28, 8.2]}
        radius={0.14}
        smoothness={5}
        position={[0, -0.13, 0]}
        receiveShadow
      >
        <ClayMaterial color={isNight ? '#81757A' : '#F1DDCF'} />
      </RoundedBox>

      <RoundedBox
        args={[24, 0.12, 2.45]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.08, 0]}
        receiveShadow
      >
        <ClayMaterial color={isNight ? '#9A8790' : '#F9EDE3'} />
      </RoundedBox>

      {CHERRY_TREE_LAYOUT.map(([x, y, z, scale, variant]) => (
        <CherryBlossomTree
          key={`${x}-${z}`}
          position={[x, y, z]}
          scale={scale}
          variant={variant}
        />
      ))}

      {LAMP_LAYOUT.map(([x, z]) => (
        <VintageLampPost key={`${x}-${z}`} position={[x, 0, z]} isNight={isNight} />
      ))}

      <FallingPetals />
      <Easel onSelect={onSelect} />
      <BadmintonRacket onSelect={onSelect} />
      <SkillsLaptop onSelect={onSelect} />
    </group>
  )
}
