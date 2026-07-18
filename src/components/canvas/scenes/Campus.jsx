function CherryBlossomTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.6, 16]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.85, 24, 24]} />
        <meshStandardMaterial color="#FFB7C5" />
      </mesh>
    </group>
  )
}

export default function Campus({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[10, 24]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>

      <CherryBlossomTree position={[-3.2, 0, -7]} />
      <CherryBlossomTree position={[3.1, 0, 0]} />
      <CherryBlossomTree position={[-3.4, 0, 7]} />

      <mesh position={[2.7, 0.35, 3.4]}>
        <boxGeometry args={[2.2, 0.2, 0.7]} />
        <meshStandardMaterial color="#A16207" />
      </mesh>
      <mesh position={[2.7, 0.6, 3.4]}>
        <boxGeometry args={[0.55, 0.35, 0.4]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  )
}
