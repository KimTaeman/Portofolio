import { RoundedBox } from '@react-three/drei'

function ClayMaterial({ color }) {
  return <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
}

function GumdropTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
        <ClayMaterial color="#8B6348" />
      </mesh>
      <mesh position={[0, 1.15, 0]} scale={[0.72, 0.62, 0.68]} castShadow>
        <sphereGeometry args={[1, 24, 24]} />
        <ClayMaterial color="#7FCB7B" />
      </mesh>
      <mesh position={[0.34, 1.28, 0.05]} scale={0.42} castShadow>
        <sphereGeometry args={[1, 20, 20]} />
        <ClayMaterial color="#91DB84" />
      </mesh>
    </group>
  )
}

export default function Playground() {
  const slidePosition = { x: -2, y: 1.1, z: -1.5 }
  const slideRotationX = -0.35

  return (
    <>
      <color attach="background" args={['#FDF6E3']} />

      <group rotation={[0, Math.PI, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 8]} />
          <ClayMaterial color="#F8EEDB" />
        </mesh>

        <RoundedBox
          args={[1, 0.25, 4]}
          radius={0.12}
          smoothness={5}
          position={[slidePosition.x, slidePosition.y, slidePosition.z]}
          rotation={[slideRotationX, 0, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color="#F39A55" />
        </RoundedBox>

        <mesh
          position={[-2.48, 1.42, -1.5]}
          rotation={[Math.PI / 2 + slideRotationX, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.055, 0.055, 4, 12]} />
          <ClayMaterial color="#F6C078" />
        </mesh>
        <mesh
          position={[-1.52, 1.42, -1.5]}
          rotation={[Math.PI / 2 + slideRotationX, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.055, 0.055, 4, 12]} />
          <ClayMaterial color="#F6C078" />
        </mesh>

        <GumdropTree position={[2.4, 0, -2.2]} />
        <GumdropTree position={[3.7, 0, 0.7]} />
      </group>
    </>
  )
}
