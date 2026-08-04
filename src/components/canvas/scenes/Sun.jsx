import { Cone, Sphere } from '@react-three/drei'

const SUN_RAYS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2
  return {
    position: [Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0],
    rotationZ: angle - Math.PI / 2,
  }
})

function SunMaterial() {
  return (
    <meshStandardMaterial
      color="#FFD15C"
      roughness={1}
      metalness={0}
      emissive="#FFE58F"
      emissiveIntensity={0.4}
    />
  )
}

export default function Sun({
  position = [4.8, 4.35, -6],
  scale = 0.68,
}) {
  return (
    <group name="sun" position={position} scale={scale}>
      <Sphere args={[0.62, 28, 22]} scale={1.2}>
        <SunMaterial />
      </Sphere>

      {SUN_RAYS.map(({ position: rayPosition, rotationZ }, index) => (
        <Cone
          key={index}
          args={[0.3, 0.6, 4]}
          position={rayPosition}
          rotation={[0, 0, rotationZ]}
        >
          <SunMaterial />
        </Cone>
      ))}
    </group>
  )
}
