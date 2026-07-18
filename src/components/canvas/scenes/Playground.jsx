import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

function GumdropTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color="#77DD77" />
      </mesh>
    </group>
  )
}

export default function Playground() {
  const characterRef = useRef()
  const scroll = useScroll()

  const slidePosition = { x: -2, y: 1.1, z: -1.5 }
  const slideRotationX = 0.35
  const slideSize = { thickness: 0.25, length: 4 }
  const characterHeight = 0.75

  const cos = Math.cos(slideRotationX)
  const sin = Math.sin(slideRotationX)
  const localY = slideSize.thickness / 2
  const topLocalZ = -slideSize.length / 2
  const bottomLocalZ = slideSize.length / 2
  const characterYOffset = characterHeight / 2

  const topPosition = {
    y: slidePosition.y + (localY * cos - topLocalZ * sin) + characterYOffset,
    z: slidePosition.z + (localY * sin + topLocalZ * cos),
  }
  const bottomPosition = {
    y: slidePosition.y + (localY * cos - bottomLocalZ * sin) + characterYOffset,
    z: slidePosition.z + (localY * sin + bottomLocalZ * cos),
  }

  useFrame(() => {
    if (!characterRef.current) return

    const progress = scroll.range(0, 0.15)
    characterRef.current.position.x = slidePosition.x
    characterRef.current.position.y = THREE.MathUtils.lerp(
      topPosition.y,
      bottomPosition.y,
      progress,
    )
    characterRef.current.position.z = THREE.MathUtils.lerp(
      topPosition.z,
      bottomPosition.z,
      progress,
    )
  })

  return (
    <>
      <color attach="background" args={['#FDF6E3']} />

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 24]} />
          <meshStandardMaterial color="#FDF6E3" />
        </mesh>

        <mesh
          position={[slidePosition.x, slidePosition.y, slidePosition.z]}
          rotation={[slideRotationX, 0, 0]}
        >
          <boxGeometry args={[1, 0.25, 4]} />
          <meshStandardMaterial color="#FFB380" />
        </mesh>

        <GumdropTree position={[2.4, 0, -2.2]} />
        <GumdropTree position={[3.7, 0, 0.7]} />

        <mesh
          ref={characterRef}
          position={[slidePosition.x, topPosition.y, topPosition.z]}
        >
          <boxGeometry args={[0.45, 0.75, 0.45]} />
          <meshStandardMaterial color="#AEC6CF" />
        </mesh>
      </group>
    </>
  )
}