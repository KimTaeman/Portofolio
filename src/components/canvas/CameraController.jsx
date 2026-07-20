import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const CAMERA_STOPS = [
  { t: 0.0, position: new THREE.Vector3(0, 2.2, 11), target: new THREE.Vector3(-2, 1, -1.5), fov: 50 },
  { t: 0.25, position: new THREE.Vector3(-12, 2, 30), target: new THREE.Vector3(-2, 1, 30), fov: 50 },
  { t: 0.5, position: new THREE.Vector3(-4, 2, 30), target: new THREE.Vector3(4, 1, 30), fov: 50 },
  { t: 0.7, position: new THREE.Vector3(-1.5, 2.6, 58), target: new THREE.Vector3(0, 4.8, 64), fov: 50 },
  { t: 1.0, position: new THREE.Vector3(0, 14.5, 90), target: new THREE.Vector3(0, 1.2, 90), fov: 52 },
]

const desiredCameraPosition = new THREE.Vector3()
const desiredLookTarget = new THREE.Vector3()
const desiredQuaternion = new THREE.Quaternion()
const lookAtMatrix = new THREE.Matrix4()
const worldUp = new THREE.Vector3(0, 1, 0)

const getSegment = (offset) => {
  for (let i = 0; i < CAMERA_STOPS.length - 1; i += 1) {
    const start = CAMERA_STOPS[i]
    const end = CAMERA_STOPS[i + 1]
    if (offset <= end.t) return { start, end }
  }
  return {
    start: CAMERA_STOPS[CAMERA_STOPS.length - 2],
    end: CAMERA_STOPS[CAMERA_STOPS.length - 1],
  }
}

export default function CameraController({
  onScrollLockChange = () => {},
  onOutfitChange = () => {},
  onScrollOffsetChange = () => {},
}) {
  const scroll = useScroll()
  const isLockZoneActiveRef = useRef(false)
  const outfitRef = useRef('uniform')

  useFrame((state) => {
    const { camera } = state
    const offset = scroll.offset
    onScrollOffsetChange(offset)

    const { start, end } = getSegment(offset)
    const range = end.t - start.t
    const segmentT = range > 0 ? THREE.MathUtils.clamp((offset - start.t) / range, 0, 1) : 0
    desiredCameraPosition.copy(start.position).lerp(end.position, segmentT)
    desiredLookTarget.copy(start.target).lerp(end.target, segmentT)
    const desiredFov = THREE.MathUtils.lerp(start.fov, end.fov, segmentT)

    const nextOutfit = offset >= 0.55 ? 'hiker' : 'uniform'
    if (nextOutfit !== outfitRef.current) {
      outfitRef.current = nextOutfit
      onOutfitChange(nextOutfit)
    }

    const inLockZone = offset >= 0.595 && offset <= 0.605
    if (inLockZone !== isLockZoneActiveRef.current) {
      isLockZoneActiveRef.current = inLockZone
      onScrollLockChange(inLockZone)
    }

    camera.position.lerp(desiredCameraPosition, 0.12)
    lookAtMatrix.lookAt(camera.position, desiredLookTarget, worldUp)
    desiredQuaternion.setFromRotationMatrix(lookAtMatrix)
    camera.quaternion.slerp(desiredQuaternion, 0.12)
    camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, 0.2)
    camera.updateProjectionMatrix()
  })

  return null
}
