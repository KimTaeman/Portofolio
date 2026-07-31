import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, RoundedBox, Sphere, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { MOUNTAIN_PROJECT_MARKERS } from '../../../config/narrativeTimeline'

const RIDGE_MASSES = Object.freeze([
  { position: [-8, -6, -4], scale: [7, 7, 8], color: '#F4A460' },
  { position: [8, -4, -9], scale: [7, 8, 8], color: '#8FBC8F' },
  { position: [-8.5, -0.5, -15], scale: [7.5, 9, 8], color: '#8FBC8F' },
  { position: [8.5, 3, -21], scale: [7.5, 9, 9], color: '#F4A460' },
  { position: [-8, 6, -27], scale: [7, 9, 9], color: '#F4A460' },
  { position: [8, 8, -32], scale: [7, 9, 9], color: '#8FBC8F' },
])

const TRAIL_STONES = Object.freeze([
  [0, 0.02, 0, 0.08, 0.95],
  [-0.3, 0.65, -1.8, -0.15, 0.88],
  [-0.7, 1.5, -3.6, 0.18, 1.05],
  [-1.1, 2.4, -5.4, -0.12, 0.9],
  [-0.8, 3.4, -7.2, 0.22, 1],
  [-0.2, 4.5, -9, -0.16, 0.86],
  [0.6, 5.6, -10.8, 0.18, 1.02],
  [1.2, 6.8, -12.6, -0.08, 0.91],
  [1.6, 8, -14.4, 0.15, 1.05],
  [1.7, 9.2, -16.2, -0.2, 0.88],
  [1.3, 10.4, -18, 0.13, 1],
  [0.7, 11.6, -19.8, -0.1, 0.92],
  [-0.1, 12.8, -21.6, 0.2, 1.04],
  [-0.7, 14, -23.4, -0.15, 0.9],
  [-1, 15, -25.2, 0.1, 1],
  [-1.1, 16, -27, -0.18, 0.9],
  [-0.8, 16.9, -28.8, 0.14, 1.03],
  [0, 17.7, -30.2, -0.1, 0.92],
])

const STONE_COLORS = ['#FDF6E3', '#E0D8C8', '#FFD1BD']
const STONE_HEIGHT = 10
const STONE_EMBED_DEPTH = 0.12

function ClayMaterial({ color, emissive = '#000000', emissiveIntensity = 0 }) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={1}
      metalness={0}
    />
  )
}

function ProjectMarker({ marker, index, onSelect }) {
  const markerRef = useRef()
  const gemRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  useCursor(isHovered)

  useFrame((state, delta) => {
    if (!markerRef.current || !gemRef.current) return

    markerRef.current.position.y =
      marker.position[1] +
      Math.sin(state.clock.elapsedTime * 1.35 + index * 1.7) * 0.1
    const targetScale = isHovered ? 1.16 : 1
    const nextScale = THREE.MathUtils.damp(
      markerRef.current.scale.x,
      targetScale,
      9,
      delta,
    )
    markerRef.current.scale.setScalar(nextScale)
    gemRef.current.rotation.y += delta * 0.55
    gemRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.12
  })

  return (
    <group
      ref={markerRef}
      name={`projectMarker-${marker.id}`}
      position={marker.position}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={() => setIsHovered(false)}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(marker.id)
      }}
    >
      <Cylinder
        args={[0.11, 0.14, 1.15, 16]}
        position={[0, 0.48, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color="#8B5A2B" />
      </Cylinder>
      <RoundedBox
        args={[0.92, 0.4, 0.18]}
        radius={0.1}
        smoothness={5}
        position={[0.18, 0.96, 0]}
        rotation={[0, 0, index % 2 ? 0.06 : -0.06]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color="#FDF6E3" />
      </RoundedBox>
      <group ref={gemRef} position={[0.18, 1.38, 0]}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[0.25, 1]} />
          <ClayMaterial
            color={marker.accent}
            emissive={marker.accent}
            emissiveIntensity={isHovered ? 0.32 : 0.12}
          />
        </mesh>
      </group>
    </group>
  )
}

export default function Mountain({
  position = [0, 0, 0],
  onMarkerSelect = () => {},
}) {
  return (
    <group name="mountainBase" position={position}>
      <group name="mountainRidge">
        <Cylinder
          args={[6.5, 9, 35, 32]}
          position={[0, 2.6, -18.85]}
          rotation={[-1.03, 0, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color="#8FBC8F" />
        </Cylinder>

        {RIDGE_MASSES.map((hill, index) => (
          <Sphere
            key={`${hill.position.join('-')}-${index}`}
            args={[1, 32, 24]}
            position={hill.position}
            scale={hill.scale}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={hill.color} />
          </Sphere>
        ))}

        <Sphere
          args={[1, 32, 24]}
          position={[0, 17.85, -34]}
          scale={[5.5, 0.3, 6.5]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color="#8FBC8F" />
        </Sphere>
      </group>

      <group name="windingStonePath">
        {TRAIL_STONES.map(([x, y, z, rotationY, stoneScale], index) => (
          <Cylinder
            key={`${x}-${z}`}
            args={[1.05, 1.15, STONE_HEIGHT, 24]}
            position={[
              x,
              y - STONE_HEIGHT / 2 - STONE_EMBED_DEPTH,
              z,
            ]}
            rotation={[0, rotationY, 0]}
            scale={[stoneScale, 1, 0.84 + (index % 3) * 0.06]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={STONE_COLORS[index % STONE_COLORS.length]} />
          </Cylinder>
        ))}
      </group>

      <group name="projectMarkers">
        {MOUNTAIN_PROJECT_MARKERS.map((marker, index) => (
          <ProjectMarker
            key={marker.id}
            marker={marker}
            index={index}
            onSelect={onMarkerSelect}
          />
        ))}
      </group>
    </group>
  )
}
