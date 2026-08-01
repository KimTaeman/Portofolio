import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character'
import {
  CAMPUS_PATH,
  CHARACTER_KEYFRAMES,
  getPlaygroundFallPositionAtOffset,
  getMountainTrailHeadingAtOffset,
  getMountainTrailPositionAtOffset,
  getNearestCampusProximity,
  MOUNTAIN_PATH,
  PLAYGROUND_MOTION_OFFSETS,
  SUMMIT_SEQUENCE,
} from '../../config/narrativeTimeline'

const currentPosition = new THREE.Vector3()
const nextPosition = new THREE.Vector3()
// Calibrated against the top of the angled slide: the skirt/hip volume
// intersects the surface by a few millimetres instead of hovering above it.
const SEATED_POSE_Y = -0.65
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
  const torsoRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const rightForearmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const summitArrivalTimeRef = useRef(null)
  const scroll = useScroll()

  useFrame((state, delta) => {
    if (
      !characterRef.current ||
      !poseRef.current ||
      !torsoRef.current ||
      !headRef.current ||
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
    if (
      start.t === PLAYGROUND_MOTION_OFFSETS.slideEnd &&
      end.t === PLAYGROUND_MOTION_OFFSETS.groundContact
    ) {
      progress = THREE.MathUtils.smootherstep(progress, 0, 1)
    }
    if (
      start.t === SUMMIT_SEQUENCE.haltStart &&
      end.t === SUMMIT_SEQUENCE.haltEnd
    ) {
      progress = THREE.MathUtils.smootherstep(progress, 0, 1)
    }

    currentPosition.fromArray(start.position)
    nextPosition.fromArray(end.position)
    characterRef.current.position.copy(currentPosition.lerp(nextPosition, progress))
    const isPlaygroundFall =
      offset >= PLAYGROUND_MOTION_OFFSETS.slideEnd &&
      offset <= PLAYGROUND_MOTION_OFFSETS.groundContact
    if (isPlaygroundFall) {
      getPlaygroundFallPositionAtOffset(offset, currentPosition)
      characterRef.current.position.copy(currentPosition)
    }
    const isOnMountainPath =
      offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end
    if (isOnMountainPath) {
      getMountainTrailPositionAtOffset(offset, currentPosition)
      characterRef.current.position.copy(currentPosition)
    }
    const isApproachingMountainTurn =
      end.t === MOUNTAIN_PATH.start && offset < MOUNTAIN_PATH.start
    characterRef.current.rotation.y = isOnMountainPath
      ? getMountainTrailHeadingAtOffset(offset)
      : isApproachingMountainTurn
        ? start.rotationY
        : THREE.MathUtils.lerp(start.rotationY, end.rotationY, progress)

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
    let rightForearmX = 0
    let rightForearmZ = 0
    let rightForearmY = -0.32
    let leftLegX
    let rightLegX
    let summitHeadTargetY = null
    let torsoBreathScale = 1

    if (offset < SUMMIT_SEQUENCE.haltEnd) {
      summitArrivalTimeRef.current = null
    } else if (summitArrivalTimeRef.current === null) {
      summitArrivalTimeRef.current = state.clock.elapsedTime
    }

    if (offset < PLAYGROUND_MOTION_OFFSETS.waveEnd) {
      posePositionY = SEATED_POSE_Y
      leftLegX = SEATED_LEG_ROTATION_X
      rightLegX = SEATED_LEG_ROTATION_X
      rightArmX = Math.sin(state.clock.elapsedTime * 7) * 0.42
      rightArmZ = 2.42
      poseRotationZ = Math.sin(state.clock.elapsedTime * 2.4) * 0.025
    } else if (offset < PLAYGROUND_MOTION_OFFSETS.slideEnd) {
      const slideProgress = THREE.MathUtils.smoothstep(
        offset,
        PLAYGROUND_MOTION_OFFSETS.waveEnd,
        PLAYGROUND_MOTION_OFFSETS.slideEnd,
      )
      const waveRelease = THREE.MathUtils.smoothstep(
        offset,
        PLAYGROUND_MOTION_OFFSETS.waveEnd,
        0.055,
      )
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
    } else if (offset < PLAYGROUND_MOTION_OFFSETS.groundContact) {
      const fallProgress = THREE.MathUtils.smootherstep(
        offset,
        PLAYGROUND_MOTION_OFFSETS.slideEnd,
        PLAYGROUND_MOTION_OFFSETS.groundContact,
      )
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
    } else if (offset < PLAYGROUND_MOTION_OFFSETS.landingEnd) {
      const landingProgress = THREE.MathUtils.smoothstep(
        offset,
        PLAYGROUND_MOTION_OFFSETS.groundContact,
        PLAYGROUND_MOTION_OFFSETS.landingEnd,
      )
      const impact = (1 - landingProgress) ** 3

      characterRef.current.position.y = CAMPUS_PATH.surfaceY
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
      const isHiking =
        offset >= MOUNTAIN_PATH.start && offset < SUMMIT_SEQUENCE.haltEnd
      const isMoving = isWalking || isHiking
      const stride = isHiking ? 0.72 : 0.38
      const motionOffset = isHiking ? offset - 0.5 : offset - 0.2
      const walkCycle = Math.sin(motionOffset * (isHiking ? 170 : 52))
      const summitWalkFade = isHiking
        ? 1 -
          THREE.MathUtils.smoothstep(
            offset,
            SUMMIT_SEQUENCE.haltStart,
            SUMMIT_SEQUENCE.haltEnd,
          )
        : 1
      const limbSwing = isMoving ? walkCycle * stride * summitWalkFade : 0

      leftArmX = limbSwing
      rightArmX = -limbSwing
      leftLegX = -limbSwing
      rightLegX = limbSwing
      if (isWalking) {
        characterRef.current.position.y += Math.abs(walkCycle) * 0.045
      } else if (isHiking) {
        posePositionY = Math.abs(walkCycle) * 0.045 * summitWalkFade
      } else if (offset >= SUMMIT_SEQUENCE.haltEnd) {
        const summitElapsed =
          state.clock.elapsedTime - summitArrivalTimeRef.current

        if (summitElapsed < 2) {
          const victoryProgress = THREE.MathUtils.smootherstep(
            summitElapsed,
            0,
            2,
          )
          leftArmX = THREE.MathUtils.lerp(0, -0.18, victoryProgress)
          rightArmX = THREE.MathUtils.lerp(0, -0.18, victoryProgress)
          leftArmZ = THREE.MathUtils.lerp(-0.08, -2.3, victoryProgress)
          rightArmZ = THREE.MathUtils.lerp(0.08, 2.3, victoryProgress)
          summitHeadTargetY = 0
        } else {
          const idleBlend = THREE.MathUtils.smootherstep(
            summitElapsed,
            2,
            3.35,
          )
          const idleElapsed = summitElapsed - 2
          const armSway = Math.sin(idleElapsed * 0.72) * 0.045
          leftArmX = THREE.MathUtils.lerp(-0.18, armSway, idleBlend)
          rightArmX = THREE.MathUtils.lerp(-0.18, -armSway, idleBlend)
          leftArmZ = THREE.MathUtils.lerp(-2.3, -0.12, idleBlend)
          rightArmZ = THREE.MathUtils.lerp(2.3, 0.12, idleBlend)
          summitHeadTargetY =
            Math.sin(idleElapsed * 0.38) * 0.22 * idleBlend
          torsoBreathScale =
            1 + Math.sin(idleElapsed * 1.7) * 0.02 * idleBlend
          posePositionY =
            Math.sin(idleElapsed * 1.7) * 0.004 * idleBlend
          rightForearmX = THREE.MathUtils.lerp(
            rightForearmX,
            armSway * 0.35,
            idleBlend,
          )
          rightForearmZ = 0
          rightForearmY = -0.32
        }
      }
    }

    poseRef.current.rotation.x = poseRotationX
    poseRef.current.rotation.z = poseRotationZ
    const landmarkProximity = getNearestCampusProximity(offset)
    poseRef.current.rotation.y = THREE.MathUtils.damp(
      poseRef.current.rotation.y,
      landmarkProximity * 0.12,
      7,
      delta,
    )
    const isSummitIdle = offset >= SUMMIT_SEQUENCE.haltEnd
    const headTargetY = isSummitIdle
      ? (summitHeadTargetY ?? 0)
      : landmarkProximity * 0.34
    headRef.current.rotation.y = THREE.MathUtils.damp(
      headRef.current.rotation.y,
      headTargetY,
      9,
      delta,
    )
    headRef.current.rotation.x = THREE.MathUtils.damp(
      headRef.current.rotation.x,
      0,
      8,
      delta,
    )
    torsoRef.current.scale.set(1, torsoBreathScale, 1)
    poseRef.current.position.y = posePositionY
    poseRef.current.scale.set(poseScaleX, poseScaleY, poseScaleZ)
    leftArmRef.current.rotation.set(leftArmX, 0, leftArmZ)
    rightArmRef.current.rotation.set(rightArmX, 0, rightArmZ)
    if (rightForearmRef.current) {
      rightForearmRef.current.position.y = rightForearmY
      rightForearmRef.current.rotation.set(
        rightForearmX,
        0,
        rightForearmZ,
      )
    }
    leftLegRef.current.rotation.x = leftLegX
    rightLegRef.current.rotation.x = rightLegX
  })

  return (
    <group ref={characterRef}>
      <group ref={poseRef}>
        <Character
          outfit={outfit}
          scale={0.38}
          userData={{ outfit }}
          partRefs={{
            torso: torsoRef,
            head: headRef,
            leftArm: leftArmRef,
            rightArm: rightArmRef,
            rightForearm: rightForearmRef,
            leftLeg: leftLegRef,
            rightLeg: rightLegRef,
          }}
        />
      </group>
    </group>
  )
}
