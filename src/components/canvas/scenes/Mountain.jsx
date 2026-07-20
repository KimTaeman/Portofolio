import { RoundedBox } from '@react-three/drei'

const TRAIL_STEPS = [
  [-2.2, 0.2, -6],
  [1.9, 0.7, -3.8],
  [-1.5, 1.2, -1.5],
  [1.2, 1.7, 0.8],
  [-1.2, 3.48, 5],
  [1.3, 4.68, 7.5],
  [-1.2, 5.88, 10],
  [1, 7.18, 13],
]

function ClayMaterial({ color, flatShading = false }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.94}
      metalness={0}
      flatShading={flatShading}
    />
  )
}

export default function Mountain({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[8, 5, 7]} />
        <ClayMaterial color="#6FAF72" flatShading />
      </mesh>

      {TRAIL_STEPS.map(([x, y, z], index) => (
        <RoundedBox
          key={`${x}-${z}`}
          args={[2.2, 0.25, 1.2]}
          radius={0.1}
          smoothness={4}
          position={[x, y, z]}
          rotation={[0, index % 2 ? -0.08 : 0.08, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={index < 4 ? '#AED39A' : '#D6C19B'} />
        </RoundedBox>
      ))}

      <RoundedBox
        args={[0.55, 0.38, 0.38]}
        radius={0.08}
        smoothness={4}
        position={[1.2, 2.1, 1.6]}
        castShadow
      >
        <ClayMaterial color="#293042" />
      </RoundedBox>

      <mesh position={[-1.4, 0.65, -5.3]} scale={[1.15, 0.8, 1]} castShadow>
        <dodecahedronGeometry args={[0.8, 1]} />
        <ClayMaterial color="#8C6A50" flatShading />
      </mesh>
    </group>
  )
}
