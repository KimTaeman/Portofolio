import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

const lerp = (start, end, t) => start + (end - start) * t

export default function CameraController() {
  const scroll = useScroll()

  useFrame((state) => {
    const { camera } = state
    const t = scroll.offset

    camera.position.z = lerp(-20, 100, t)
    camera.position.y = lerp(5, 5.8, t)
    camera.lookAt(0, 1.2, camera.position.z + 12)
  })

  return null
}
