export default function Mountain({ position = [0, 0, 0], outfit = 'uniform' }) {
  const isHikerVisible = outfit === 'hiker'

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

      <mesh position={[-0.8, 0.65, -2.1]}>
        <sphereGeometry args={[0.8, 20, 20]} />
        <meshStandardMaterial color="#7C5A3A" />
      </mesh>

      <mesh position={[-1.4, 0.95, -2.6]} visible={!isHikerVisible}>
        <boxGeometry args={[0.45, 0.75, 0.45]} />
        <meshStandardMaterial color="#AEC6CF" />
      </mesh>

      <mesh position={[-1.4, 0.95, -2.6]} visible={isHikerVisible}>
        <boxGeometry args={[0.45, 0.75, 0.45]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
    </group>
  )
}
