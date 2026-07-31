import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, RoundedBox, Sphere, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import {
  MOUNTAIN_PROJECT_MARKERS,
  MOUNTAIN_TRAIL_STONES,
} from '../../../config/narrativeTimeline'

const RIDGE_MASSES = Object.freeze([
  { position: [-8, -6, -4], scale: [7, 7, 8], color: '#F4A460' },
  { position: [8, -4, -9], scale: [7, 8, 8], color: '#8FBC8F' },
  { position: [-8.5, -0.5, -15], scale: [7.5, 9, 8], color: '#8FBC8F' },
  { position: [8.5, 3, -21], scale: [7.5, 9, 9], color: '#F4A460' },
  { position: [-8, 6, -27], scale: [7, 9, 9], color: '#F4A460' },
  { position: [8, 8, -32], scale: [7, 9, 9], color: '#8FBC8F' },
])

const STONE_COLORS = ['#FDF6E3', '#E0D8C8', '#FFD1BD']
const STONE_HEIGHT = 10

const FOOTHILL_CHERRY_TREES = Object.freeze([
  [-3.8, 39, 0.82, -0.08],
  [3.9, 33, 0.76, 0.1],
  [-4.2, 26, 0.68, -0.12],
])

const FOOTHILL_ROCKS = Object.freeze([
  [2.25, 35.5, 0.42, 0.72],
  [-2.55, 30, 0.34, 0.58],
  [2.75, 23, 0.46, 0.78],
  [-2.4, 16.5, 0.38, 0.64],
  [2.5, 8.5, 0.32, 0.55],
])

const FOOTHILL_HILLS = Object.freeze([
  [-4.8, 21, 1.15, '#F4A460'],
  [4.9, 14, 1.3, '#8FBC8F'],
  [-4.6, 6, 1.05, '#A8C9A1'],
])

const FOOTHILL_BUSHES = Object.freeze([
  [2.8, 38],
  [-2.9, 34],
  [3.2, 27],
  [-3, 20],
  [3.1, 12],
  [-2.8, 4.5],
])

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

function FoothillCherryTree({ position, scale, lean }) {
  return (
    <group name="foothillCherryTree" position={position} scale={scale}>
      <Cylinder
        args={[0.15, 0.23, 1.8, 18]}
        position={[0, 0.9, 0]}
        rotation={[0, 0, lean * 0.35]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color="#8B5A4A" />
      </Cylinder>
      <group position={[lean, 2.08, 0]} rotation={[0, 0, lean]}>
        {[
          [0, 0, 0, 0.82, '#FFB7C5'],
          [-0.62, -0.02, 0.04, 0.58, '#FFC0CB'],
          [0.62, 0.02, -0.02, 0.6, '#FFB7C5'],
          [-0.22, 0.5, -0.04, 0.56, '#FFD0D9'],
          [0.32, 0.46, 0.04, 0.52, '#FFC0CB'],
        ].map(([x, y, z, radius, color], index) => (
          <Sphere
            key={`${x}-${y}-${index}`}
            args={[radius, 20, 16]}
            position={[x, y, z]}
            scale={[1.15, 0.86, 1]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={color} />
          </Sphere>
        ))}
      </group>
    </group>
  )
}

function FoothillBush({ position }) {
  return (
    <group name="foothillBush" position={position}>
      {[
        [-0.28, 0.22, 0, 0.38],
        [0.05, 0.32, 0.02, 0.46],
        [0.38, 0.2, -0.02, 0.34],
      ].map(([x, y, z, radius], index) => (
        <Sphere
          key={`${x}-${index}`}
          args={[radius, 18, 14]}
          position={[x, y, z]}
          scale={[1, 0.82, 0.9]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color="#8FBC8F" />
        </Sphere>
      ))}
    </group>
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
        {MOUNTAIN_TRAIL_STONES.map((stone, index) => (
          <Cylinder
            key={`${stone.phase}-${stone.z}`}
            args={[1.05, 1.15, STONE_HEIGHT, 24]}
            position={[
              stone.x,
              stone.topY - STONE_HEIGHT / 2,
              stone.z,
            ]}
            rotation={[0, stone.rotationY, 0]}
            scale={[
              stone.scale,
              1,
              0.84 + (index % 3) * 0.06,
            ]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={STONE_COLORS[index % STONE_COLORS.length]} />
          </Cylinder>
        ))}
      </group>

      <group name="foothillTransitionBiome">
        {FOOTHILL_CHERRY_TREES.map(([x, z, scale, lean]) => (
          <FoothillCherryTree
            key={`${x}-${z}`}
            position={[x, 0, z]}
            scale={scale}
            lean={lean}
          />
        ))}

        {FOOTHILL_ROCKS.map(([x, z, y, scale], index) => (
          <Sphere
            key={`${x}-${z}`}
            args={[1, 16, 12]}
            position={[x, y, z]}
            scale={[scale, scale * 0.62, scale * 0.82]}
            rotation={[0.08, index * 0.61, -0.06]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color="#AFAFAF" />
          </Sphere>
        ))}

        {FOOTHILL_HILLS.map(([x, z, scale, color]) => (
          <Sphere
            key={`${x}-${z}`}
            args={[1, 24, 18]}
            position={[x, -0.52, z]}
            scale={[scale * 1.8, scale * 0.82, scale * 1.45]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={color} />
          </Sphere>
        ))}

        {FOOTHILL_BUSHES.map(([x, z]) => (
          <FoothillBush key={`${x}-${z}`} position={[x, 0, z]} />
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
