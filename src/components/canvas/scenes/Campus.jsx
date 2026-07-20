import { RoundedBox } from '@react-three/drei'

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

export default function Campus({ position = [0, 0, 0] }) {
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

      <CherryBlossomTree position={[-8, 0, 0]} />
      <CherryBlossomTree position={[0, 0, 3]} />
      <CherryBlossomTree position={[7, 0, -3]} />

      <RoundedBox
        args={[2.2, 0.2, 0.7]}
        radius={0.08}
        smoothness={4}
        position={[3.4, 0.35, 2.7]}
        castShadow
      >
        <ClayMaterial color="#A96F45" />
      </RoundedBox>
      <RoundedBox
        args={[0.55, 0.35, 0.4]}
        radius={0.06}
        smoothness={4}
        position={[3.4, 0.62, 2.7]}
        castShadow
      >
        <ClayMaterial color="#30364B" />
      </RoundedBox>
    </group>
  )
}
