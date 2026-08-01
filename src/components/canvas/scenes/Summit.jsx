import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Sphere } from '@react-three/drei'

// Summit-local coordinates. With the scene origin at world Z -77, these peaks
// occupy the world-space Z -100…-150 horizon band.
const DISTANT_PEAKS = Object.freeze([
  [-62, -19, -23, 18, 60, '#8FA3B8'],
  [-31, -23, -38, 22, 68, '#8399AE'],
  [0, -20, -50, 21, 64, '#91A6B9'],
  [33, -25, -62, 23, 72, '#7F95AA'],
  [64, -18, -73, 18, 58, '#95A9BA'],
])

const MIST_LAYERS = Object.freeze([
  [0, -1.7, -5, 22, 0.52, 14, 0.08, 0],
  [-10, -6.2, -32, 32, 0.68, 18, 0.052, 2.1],
  [12, -10.5, -62, 42, 0.84, 22, 0.036, 4.2],
])

const ROCK_MASSES = Object.freeze([
  [0, -0.86, 0, 7.3, 1.08, 6.8, '#747A7D'],
  [-5.1, -1.05, 0.7, 3.8, 1.28, 3.6, '#85898A'],
  [4.8, -1.02, 0.2, 4.1, 1.22, 3.8, '#686F73'],
  [-2.8, -0.98, -4.25, 4.5, 1.18, 3.7, '#8B8E8F'],
  [2.8, -1.06, -4.2, 4.4, 1.3, 3.9, '#70777A'],
  [-2.4, -1.12, 4.2, 4.1, 1.22, 3.6, '#777D80'],
  [2.7, -1.18, 4, 4.3, 1.18, 3.5, '#898D8E'],
])

const CLOUD_BANKS = Object.freeze([
  [-22, -5.2, -5, 1.25],
  [-12, -6.5, -12, 1.5],
  [0, -5.6, -17, 1.65],
  [14, -6.8, -13, 1.35],
  [25, -5.4, -4, 1.55],
  [-27, -8.2, 6, 1.7],
  [-8, -8.7, 4, 1.45],
  [10, -8.4, 2, 1.7],
  [29, -8, 7, 1.35],
])

function ClayMaterial({
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  opacity = 1,
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={1}
      metalness={0}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
    />
  )
}

function RockyPeak({ isNight }) {
  return (
    <group name="rockySummitPeak">
      {ROCK_MASSES.map(([x, y, z, sx, sy, sz, color], index) => (
        <Sphere
          key={`${x}-${z}-${index}`}
          args={[1, 28, 22]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[0.03 * (index % 2), index * 0.31, -0.025]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={isNight ? '#4A5258' : color} />
        </Sphere>
      ))}

      {/* A recessed support keeps the walkable crown reliable while the
          overlapping spheres provide the visible irregular silhouette. */}
      <Cylinder
        name="summitWalkableCrown"
        args={[5.9, 6.45, 0.5, 48]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <ClayMaterial color={isNight ? '#515A60' : '#808080'} />
      </Cylinder>
    </group>
  )
}

function CloudBank({ position, scale, isNight }) {
  const color = isNight ? '#D8D9E8' : '#FFFFFF'

  return (
    <group name="cloudBank" position={position} scale={scale}>
      {[
        [0, 0, 0, 3.8, 0.82, 2.15],
        [-3.2, -0.08, 0.25, 3, 0.66, 1.9],
        [3.35, 0.02, -0.1, 3.3, 0.72, 2],
        [-1.2, 0.42, -0.18, 2.65, 0.7, 1.7],
        [1.55, 0.38, 0.1, 2.8, 0.68, 1.75],
      ].map(([x, y, z, sx, sy, sz], index) => (
        <Sphere
          key={`${x}-${z}-${index}`}
          args={[1, 20, 16]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          renderOrder={-1}
        >
          <ClayMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isNight ? 0.04 : 0.08}
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  )
}

function DistantPeak({ peak, isNight }) {
  const [x, y, z, radius, height, color] = peak

  return (
    <group position={[x, y, z]}>
      <mesh receiveShadow>
        <coneGeometry args={[radius, height, 7]} />
        <ClayMaterial color={isNight ? '#374151' : color} />
      </mesh>
      <Sphere
        args={[1, 18, 14]}
        position={[0, height * 0.31, 0.1]}
        scale={[height * 0.16, height * 0.055, height * 0.12]}
      >
        <ClayMaterial color={isNight ? '#CBD5E1' : '#FFF7F0'} />
      </Sphere>
    </group>
  )
}

function RollingMist({ isNight }) {
  const mistRefs = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    MIST_LAYERS.forEach(([baseX, , , , , , speed, phase], index) => {
      const mist = mistRefs.current[index]
      if (!mist) return

      mist.position.x = baseX + Math.sin(time * speed + phase) * 5
      mist.rotation.y = Math.sin(time * speed * 0.7 + phase) * 0.12
    })
  })

  return (
    <group name="rollingSummitMist">
      {MIST_LAYERS.map(([x, y, z, sx, sy, sz], index) => (
        <Sphere
          ref={(mesh) => {
            mistRefs.current[index] = mesh
          }}
          key={`${x}-${z}-${index}`}
          args={[1, 28, 18]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          renderOrder={-2}
        >
          <ClayMaterial
            color={isNight ? '#DDE2F1' : '#FFFFFF'}
            emissive={isNight ? '#A5B4FC' : '#FFFFFF'}
            emissiveIntensity={0.06}
            opacity={0.2}
          />
        </Sphere>
      ))}
    </group>
  )
}

export default function Summit({ position = [0, 0, 0], isNight = false }) {
  return (
    <group name="summitScene" position={position}>
      <RockyPeak isNight={isNight} />
      <RollingMist isNight={isNight} />

      <group name="seaOfClouds">
        {CLOUD_BANKS.map(([x, y, z, scale], index) => (
          <CloudBank
            key={`${x}-${z}-${index}`}
            position={[x, y, z]}
            scale={scale}
            isNight={isNight}
          />
        ))}
      </group>

      <group name="distantMountainSkyline">
        {DISTANT_PEAKS.map((peak, index) => (
          <DistantPeak key={`${peak[0]}-${peak[2]}-${index}`} peak={peak} isNight={isNight} />
        ))}
      </group>

      <Sphere args={[3, 24, 24]} position={[-26, 20, -20]}>
        <ClayMaterial
          color={isNight ? '#F8FAFC' : '#FFE8A3'}
          emissive={isNight ? '#E0E7FF' : '#FFE8A3'}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  )
}
