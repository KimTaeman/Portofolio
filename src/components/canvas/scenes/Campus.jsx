import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'

const PETALS = [
  [-8.6, 2.9, -1.8, 0.1],
  [-6.9, 1.8, 1.4, 0.35],
  [-3.8, 2.6, -2.8, 0.55],
  [-1.2, 1.6, 2.1, 0.8],
  [1.8, 2.5, -1.9, 0.2],
  [4.1, 1.9, 1.8, 0.68],
  [6.5, 2.8, -2.4, 0.42],
  [8.5, 1.7, 2.4, 0.9],
]

function ClayMaterial({ color }) {
  return <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
}

function CherryBlossomTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 1.6, 16]} />
        <ClayMaterial color="#8B6348" />
      </mesh>
      <mesh position={[0, 1.95, 0]} scale={[0.95, 0.76, 0.88]} castShadow>
        <sphereGeometry args={[1, 24, 24]} />
        <ClayMaterial color="#F4A9B9" />
      </mesh>
      <mesh position={[0.5, 2.12, 0.1]} scale={0.55} castShadow>
        <sphereGeometry args={[1, 20, 20]} />
        <ClayMaterial color="#FFC0CC" />
      </mesh>
      <mesh position={[-0.48, 2.08, -0.08]} scale={0.52} castShadow>
        <sphereGeometry args={[1, 20, 20]} />
        <ClayMaterial color="#F8B3C2" />
      </mesh>
    </group>
  )
}

function FallingPetals() {
  const petalsRef = useRef([])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    petalsRef.current.forEach((petal, index) => {
      if (!petal) return
      const [, startY, , phase] = PETALS[index]
      petal.position.y = startY - ((elapsed * 0.38 + phase) % 2.8)
      petal.rotation.set(elapsed * 1.2 + phase, elapsed * 0.8 + phase, phase)
    })
  })

  return (
    <group>
      {PETALS.map(([x, y, z], index) => (
        <mesh
          key={`${x}-${z}`}
          ref={(element) => {
            petalsRef.current[index] = element
          }}
          position={[x, y, z]}
          rotation={[0, 0, index]}
        >
          <sphereGeometry args={[0.055, 10, 10]} />
          <ClayMaterial color={index % 2 ? '#FFC0CC' : '#F4A9B9'} />
        </mesh>
      ))}
    </group>
  )
}

function InteractiveLandmark({ children, detailId, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)
  const landmarkRef = useRef()
  useCursor(isHovered, 'pointer', 'auto')

  useFrame((_, delta) => {
    if (!landmarkRef.current) return
    const targetScale = isHovered ? 1.06 : 1
    landmarkRef.current.scale.x += (targetScale - landmarkRef.current.scale.x) * Math.min(delta * 10, 1)
    landmarkRef.current.scale.y += (targetScale - landmarkRef.current.scale.y) * Math.min(delta * 10, 1)
    landmarkRef.current.scale.z += (targetScale - landmarkRef.current.scale.z) * Math.min(delta * 10, 1)
  })

  return (
    <group
      ref={landmarkRef}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(detailId)
      }}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={() => setIsHovered(false)}
    >
      {children}
    </group>
  )
}

function Easel({ onSelect }) {
  return (
    <InteractiveLandmark detailId="easel" onSelect={onSelect}>
      <group position={[-2.6, 0, -2.8]}>
        <RoundedBox
          args={[0.92, 0.72, 0.08]}
          radius={0.06}
          smoothness={4}
          position={[0, 1.18, 0]}
          castShadow
        >
          <ClayMaterial color="#FFF8E9" />
        </RoundedBox>
        <RoundedBox
          args={[0.68, 0.48, 0.045]}
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
    </InteractiveLandmark>
  )
}

function BadmintonRacket({ onSelect }) {
  return (
    <InteractiveLandmark detailId="badminton" onSelect={onSelect}>
      <group position={[6.2, 0.9, -2.4]} rotation={[0, 0, -0.24]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.38, 0.055, 12, 24]} />
          <ClayMaterial color="#E88C47" />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 0.78, 12]} />
          <ClayMaterial color="#465577" />
        </mesh>
        <mesh position={[0.58, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <ClayMaterial color="#F7F1E7" />
        </mesh>
      </group>
    </InteractiveLandmark>
  )
}

function SkillsLaptop({ onSelect }) {
  return (
    <InteractiveLandmark detailId="skills" onSelect={onSelect}>
      <group position={[3.4, 0, 2.7]}>
        <RoundedBox
          args={[2.2, 0.2, 0.7]}
          radius={0.08}
          smoothness={4}
          position={[0, 0.35, 0]}
          castShadow
        >
          <ClayMaterial color="#A96F45" />
        </RoundedBox>
        <RoundedBox
          args={[0.62, 0.38, 0.05]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.76, 0.05]}
          rotation={[-0.18, 0, 0]}
          castShadow
        >
          <ClayMaterial color="#30364B" />
        </RoundedBox>
        <RoundedBox
          args={[0.62, 0.04, 0.42]}
          radius={0.035}
          smoothness={3}
          position={[0, 0.57, 0.18]}
          castShadow
        >
          <ClayMaterial color="#465577" />
        </RoundedBox>
      </group>
    </InteractiveLandmark>
  )
}

export default function Campus({ position = [0, 0, 0], onSelect = () => {} }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[24, 10]} />
        <ClayMaterial color="#D8C9B2" />
      </mesh>

      <RoundedBox
        args={[22, 0.08, 2.5]}
        radius={0.04}
        smoothness={3}
        position={[0, 0.07, 0]}
        receiveShadow
      >
        <ClayMaterial color="#E9DDC9" />
      </RoundedBox>

      <CherryBlossomTree position={[-7.4, 0, 0.25]} />
      <CherryBlossomTree position={[0, 0, 3]} />
      <CherryBlossomTree position={[7, 0, -3]} />
      <FallingPetals />

      <Easel onSelect={onSelect} />
      <BadmintonRacket onSelect={onSelect} />
      <SkillsLaptop onSelect={onSelect} />
    </group>
  )
}
