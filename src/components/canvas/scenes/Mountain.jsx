export default function Mountain({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[8, 5, 4]} />
        <meshStandardMaterial color="#77DD77" />
      </mesh>

      <mesh position={[-2.2, 0.2, -6]}>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#9EE79E" />
      </mesh>
      <mesh position={[1.9, 0.7, -3.8]}>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#9EE79E" />
      </mesh>
      <mesh position={[-1.5, 1.2, -1.5]}>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#9EE79E" />
      </mesh>
      <mesh position={[1.2, 1.7, 0.8]}>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <meshStandardMaterial color="#9EE79E" />
      </mesh>

      <mesh position={[1.2, 2.1, 1.6]}>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  )
}
