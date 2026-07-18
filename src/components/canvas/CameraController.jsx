import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const FRONT_VIEW_POSITION = new THREE.Vector3(0, 2.2, 11)
const FRONT_VIEW_TARGET = new THREE.Vector3(-2, 1, -1.5)

const CAMPUS_SIDE_POSITION = new THREE.Vector3(-10, 2, 30)
const CAMPUS_SIDE_TARGET = new THREE.Vector3(0, 1, 30)

const desiredCameraPosition = new THREE.Vector3()
const desiredLookTarget = new THREE.Vector3()
const desiredQuaternion = new THREE.Quaternion()
const lookAtMatrix = new THREE.Matrix4()
const worldUp = new THREE.Vector3(0, 1, 0)

export default function CameraController({
  onScrollLock = () => {},
  onOutfitChange = () => {},
}) {
  const scroll = useScroll()
  const hasLockedRef = useRef(false)
  const outfitRef = useRef('uniform')

  useFrame((state) => {
    const { camera } = state
    const offset = scroll.offset
    let desiredFov = 50

    if (offset < 0.25) {
      desiredCameraPosition.copy(FRONT_VIEW_POSITION)
      desiredLookTarget.copy(FRONT_VIEW_TARGET)
    } else if (offset < 0.26) {
      const transitionProgress = (offset - 0.25) / 0.01
      const shakeAmplitude = THREE.MathUtils.lerp(0.22, 0, transitionProgress)
      const zoomPulse = Math.sin(transitionProgress * Math.PI) * 3

      desiredCameraPosition.copy(CAMPUS_SIDE_POSITION)
      desiredCameraPosition.x += Math.sin(state.clock.elapsedTime * 85) * shakeAmplitude
      desiredCameraPosition.y +=
        Math.cos(state.clock.elapsedTime * 120) * shakeAmplitude * 0.5
      desiredLookTarget.copy(CAMPUS_SIDE_TARGET)
      desiredFov = 50 - zoomPulse
    } else if (offset < 0.5) {
      const panProgress = (offset - 0.25) / 0.25
      desiredCameraPosition.set(THREE.MathUtils.lerp(-12, -4, panProgress), 2, 30)
      desiredLookTarget.set(THREE.MathUtils.lerp(-2, 4, panProgress), 1, 30)
    } else if (offset < 0.7) {
      const climbProgress = (offset - 0.5) / 0.2
      desiredCameraPosition.set(
        THREE.MathUtils.lerp(-3, -1.5, climbProgress),
        THREE.MathUtils.lerp(1.8, 2.6, climbProgress),
        THREE.MathUtils.lerp(52, 58, climbProgress),
      )
      desiredLookTarget.set(0, THREE.MathUtils.lerp(3.2, 4.8, climbProgress), 64)
    } else {
      const summitProgress = (offset - 0.7) / 0.3
      desiredCameraPosition.set(
        THREE.MathUtils.lerp(-1.2, 0, summitProgress),
        THREE.MathUtils.lerp(3.8, 14.5, summitProgress),
        THREE.MathUtils.lerp(84, 90, summitProgress),
      )
      desiredLookTarget.set(0, THREE.MathUtils.lerp(2.2, 1.2, summitProgress), 90)
    }

    const nextOutfit = offset >= 0.55 ? 'hiker' : 'uniform'
    if (nextOutfit !== outfitRef.current) {
      outfitRef.current = nextOutfit
      onOutfitChange(nextOutfit)
    }

    if (offset >= 0.6 && !hasLockedRef.current) {
      hasLockedRef.current = true
      onScrollLock()
    }
    if (offset < 0.59 && hasLockedRef.current) {
      hasLockedRef.current = false
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
