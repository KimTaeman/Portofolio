import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'

const DISTANT_PEAKS = [
  [-52, -9, 8, 12],
  [-30, -8, 42, 11],
  [-15, -10, 54, 15],
  [2, -11, 60, 18],
  [20, -9, 52, 14],
  [34, -8, 40, 10],
  [52, -9, 8, 12],
]

const CLOUDS = [
  [-38, -6, 10],
  [-24, -5, 24],
  [-9, -6, 34],
  [10, -5, 38],
  [27, -6, 28],
  [38, -6, 10],
]

const CITY_LIGHTS = [
  [-28, -3, 43],
  [-21, -4, 49],
  [-12, -5, 55],
  [-3, -4, 51],
  [7, -5, 57],
  [16, -4, 50],
  [25, -3, 45],
  [32, -4, 38],
]

function Cloud({ position, color }) {
  return (
    <group position={position}>
      <mesh scale={[2.8, 1, 1.4]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[2.1, 0.15, 0]} scale={[1.8, 0.8, 1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <mesh position={[-2, 0.1, 0.2]} scale={[1.6, 0.75, 1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    </group>
  )
}

export default function Summit({ position = [0, 0, 0], isNight = false }) {
  const skyColor = isNight ? '#1E2A44' : '#AEC6CF'
  const peakColor = isNight ? '#D1D5DB' : '#FFFFFF'
  const cloudColor = isNight ? '#64748B' : '#F8FAFC'
  const distantPeakColor = isNight ? '#334155' : '#8FA8A0'

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 0.8, 32]} />
        <meshStandardMaterial color={peakColor} roughness={0.9} metalness={0} />
      </mesh>

      {DISTANT_PEAKS.map(([x, y, z, height]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]}>
          <coneGeometry args={[height * 0.65, height, 5]} />
          <meshStandardMaterial color={distantPeakColor} roughness={1} />
        </mesh>
      ))}

      {CLOUDS.map(([x, y, z]) => (
        <Cloud key={`${x}-${z}`} position={[x, y, z]} color={cloudColor} />
      ))}

      {CITY_LIGHTS.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} visible={isNight}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial
            color="#FDE68A"
            emissive="#FDE68A"
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}

      <mesh position={[-26, 20, 52]}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshBasicMaterial color={isNight ? '#F8FAFC' : '#FFE8A3'} />
      </mesh>

      <mesh
        position={[2.2, 1.1, 1.2]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
        <meshStandardMaterial color="#A9AFC0" roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[2.2, 0.45, 1.2]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 0.9, 16]} />
        <meshStandardMaterial color="#687084" roughness={0.76} metalness={0.04} />
      </mesh>

      <RoundedBox
        args={[0.5, 0.48, 0.95]}
        radius={0.1}
        smoothness={4}
        position={[3.2, 0.95, -0.2]}
        castShadow
        onClick={() => {
          console.log('Telescope interaction')
        }}
      >
        <meshStandardMaterial color="#454E63" roughness={0.72} metalness={0.06} />
      </RoundedBox>
    </group>
  )
}
