import * as THREE from 'three'

export default function Summit({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial color="#AEC6CF" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[6, 6, 0.8, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      <mesh position={[2.2, 1.1, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>
      <mesh position={[2.2, 0.45, 1.2]}>
        <cylinderGeometry args={[0.1, 0.18, 0.9, 16]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
    </group>
  )
}
