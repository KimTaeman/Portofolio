const DISTANT_PEAKS = [
  [-52, -9, -8, 12],
  [-30, -8, -42, 11],
  [-15, -10, -54, 15],
  [2, -11, -60, 18],
  [20, -9, -52, 14],
  [34, -8, -40, 10],
  [52, -9, -8, 12],
]

const CLOUDS = [
  [-38, -6, -10],
  [-24, -5, -24],
  [-9, -6, -34],
  [10, -5, -38],
  [27, -6, -28],
  [38, -6, -10],
]

const CITY_LIGHTS = [
  [-28, -3, -43],
  [-21, -4, -49],
  [-12, -5, -55],
  [-3, -4, -51],
  [7, -5, -57],
  [16, -4, -50],
  [25, -3, -45],
  [32, -4, -38],
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
  const cloudColor = isNight ? '#64748B' : '#F8FAFC'
  const distantPeakColor = isNight ? '#334155' : '#8FA8A0'

  return (
    <group position={position}>
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

      <mesh position={[-26, 20, -52]}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshBasicMaterial color={isNight ? '#F8FAFC' : '#FFE8A3'} />
      </mesh>
    </group>
  )
}
