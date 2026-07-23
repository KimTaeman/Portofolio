import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character'
import { CHARACTER_KEYFRAMES } from '../../config/narrativeTimeline'

const currentPosition = new THREE.Vector3()
const nextPosition = new THREE.Vector3()
const SEATED_POSE_Y = -0.42
const SEATED_LEG_ROTATION_X = -1.22

const getSegment = (offset) => {
  for (let index = 0; index < CHARACTER_KEYFRAMES.length - 1; index += 1) {
    const start = CHARACTER_KEYFRAMES[index]
    const end = CHARACTER_KEYFRAMES[index + 1]
    if (offset <= end.t) return { start, end }
  }

  return {
    start: CHARACTER_KEYFRAMES[CHARACTER_KEYFRAMES.length - 2],
    end: CHARACTER_KEYFRAMES[CHARACTER_KEYFRAMES.length - 1],
  }
}

export default function JourneyCharacter({ outfit = 'school' }) {
  const characterRef = useRef()
  const poseRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const scroll = useScroll()

  useFrame((state) => {
    if (
      !characterRef.current ||
      !poseRef.current ||
      !leftArmRef.current ||
      !rightArmRef.current ||
      !leftLegRef.current ||
      !rightLegRef.current
    ) {
      return
    }

    const offset = scroll.offset
    const { start, end } = getSegment(offset)
    const range = end.t - start.t
    let progress = range
      ? THREE.MathUtils.clamp((offset - start.t) / range, 0, 1)
      : 0
    if (start.t === 0.1 && end.t === 0.18) progress *= progress

    currentPosition.fromArray(start.position)
    nextPosition.fromArray(end.position)
    characterRef.current.position.copy(currentPosition.lerp(nextPosition, progress))
    characterRef.current.rotation.y = THREE.MathUtils.lerp(
      start.rotationY,
      end.rotationY,
      progress,
    )

    let poseRotationX = 0
    let poseRotationZ = 0
    let posePositionY = 0
    let poseScaleX = 1
    let poseScaleY = 1
    let poseScaleZ = 1
    let leftArmX = 0
    let rightArmX = 0
    let leftArmZ = -0.08
    let rightArmZ = 0.08
    let leftLegX
    let rightLegX

    if (offset < 0.03) {
      posePositionY = SEATED_POSE_Y
      leftLegX = SEATED_LEG_ROTATION_X
      rightLegX = SEATED_LEG_ROTATION_X
      rightArmX = Math.sin(state.clock.elapsedTime * 7) * 0.42
      rightArmZ = 2.42
      poseRotationZ = Math.sin(state.clock.elapsedTime * 2.4) * 0.025
    } else if (offset < 0.1) {
      const slideProgress = THREE.MathUtils.smoothstep(offset, 0.03, 0.1)
      const waveRelease = THREE.MathUtils.smoothstep(offset, 0.03, 0.06)
      posePositionY = SEATED_POSE_Y
      poseRotationX = THREE.MathUtils.lerp(0, -0.22, slideProgress)
      leftArmX = THREE.MathUtils.lerp(0, -0.72, slideProgress)
      rightArmX = THREE.MathUtils.lerp(
        Math.sin(state.clock.elapsedTime * 7) * 0.42,
        -0.72,
        waveRelease,
      )
      leftArmZ = THREE.MathUtils.lerp(-0.08, -0.3, slideProgress)
      rightArmZ = THREE.MathUtils.lerp(2.42, 0.3, waveRelease)
      leftLegX = THREE.MathUtils.lerp(
        SEATED_LEG_ROTATION_X,
        -1.05,
        slideProgress,
      )
      rightLegX = leftLegX
    } else if (offset < 0.18) {
      const fallProgress = THREE.MathUtils.smoothstep(offset, 0.1, 0.18)
      posePositionY = THREE.MathUtils.lerp(
        SEATED_POSE_Y,
        0,
        fallProgress,
      )
      poseRotationX = THREE.MathUtils.lerp(-0.22, 0.16, fallProgress)
      poseRotationZ = Math.sin(fallProgress * Math.PI) * 0.08
      leftArmX = THREE.MathUtils.lerp(-0.72, 0.15, fallProgress)
      rightArmX = THREE.MathUtils.lerp(-0.72, -0.15, fallProgress)
      leftArmZ = THREE.MathUtils.lerp(-0.3, -2.25, fallProgress)
      rightArmZ = THREE.MathUtils.lerp(0.3, 2.25, fallProgress)
      leftLegX = THREE.MathUtils.lerp(-1.05, 0.24, fallProgress)
      rightLegX = THREE.MathUtils.lerp(-1.05, -0.24, fallProgress)
    } else if (offset < 0.2) {
      const landingProgress = THREE.MathUtils.smoothstep(offset, 0.18, 0.2)
      const impact = (1 - landingProgress) ** 3
      const hop = Math.sin(landingProgress * Math.PI) * 0.32

      characterRef.current.position.y += hop
      poseScaleX = 1 + impact * 0.16
      poseScaleY = 1 - impact * 0.28
      poseScaleZ = 1 + impact * 0.12
      poseRotationX = THREE.MathUtils.lerp(0.16, 0, landingProgress)
      leftArmZ = THREE.MathUtils.lerp(-2.25, -0.08, landingProgress)
      rightArmZ = THREE.MathUtils.lerp(2.25, 0.08, landingProgress)
      leftLegX = THREE.MathUtils.lerp(0.38, 0, landingProgress)
      rightLegX = THREE.MathUtils.lerp(-0.38, 0, landingProgress)
    } else {
      const isWalking = offset < 0.5
      const isHiking = offset >= 0.5 && offset < 0.9
      const isMoving = isWalking || isHiking
      const stride = isHiking ? 0.72 : 0.56
      const motionOffset = isHiking ? offset - 0.5 : offset - 0.2
      const walkCycle = Math.sin(motionOffset * 170)
      const limbSwing = isMoving ? walkCycle * stride : 0

      leftArmX = limbSwing
      rightArmX = -limbSwing
      leftLegX = -limbSwing
      rightLegX = limbSwing
      if (isMoving) {
        characterRef.current.position.y += Math.abs(walkCycle) * 0.045
      }
    }

    poseRef.current.rotation.x = poseRotationX
    poseRef.current.rotation.z = poseRotationZ
    poseRef.current.position.y = posePositionY
    poseRef.current.scale.set(poseScaleX, poseScaleY, poseScaleZ)
    leftArmRef.current.rotation.set(leftArmX, 0, leftArmZ)
    rightArmRef.current.rotation.set(rightArmX, 0, rightArmZ)
    leftLegRef.current.rotation.x = leftLegX
    rightLegRef.current.rotation.x = rightLegX
  })

  return (
    <group ref={characterRef}>
      <group ref={poseRef}>
        <Character
          scale={0.38}
          userData={{ outfit }}
          partRefs={{
            leftArm: leftArmRef,
            rightArm: rightArmRef,
            leftLeg: leftLegRef,
            rightLeg: rightLegRef,
          }}
        />
      </group>
    </group>
  )
}
