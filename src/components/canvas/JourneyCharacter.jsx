import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character'
import useDayNight from '../../hooks/useDayNight'
import {
  CAMPUS_PATH,
  CHARACTER_KEYFRAMES,
  getCharacterKeyframeProgress,
  getPlaygroundSlideSeatPoint,
  getPlaygroundFallPositionAtProgress,
  getPlaygroundFallProgress,
  getMountainTrailHeadingAtOffset,
  getMountainTrailPositionAtOffset,
  getNearestCampusProximity,
  getNearestMountainProjectLook,
  MOUNTAIN_PATH,
  PLAYGROUND_MOTION_OFFSETS,
  PLAYGROUND_SLIDE_ROTATION_X,
  SUMMIT_SEQUENCE,
} from '../../config/narrativeTimeline'

const currentPosition = new THREE.Vector3()
const nextPosition = new THREE.Vector3()
const horizontalMovement = new THREE.Vector3()
// Keep the volumetric skirt and rotated legs above the wooden surface for the
// full seated sequence. A single contact height prevents the character from
// rising or sinking when the wave transitions into the slide.
const SLIDE_SEATED_POSE_Y = -0.24
const SEATED_LEG_ROTATION_X = -1.22
const WAVE_SHOULDER_ROTATION_Z = 1.28
const WAVE_ELBOW_BEND_Z = 1.62
const WAVE_ELBOW_SWING_Z = 0.34
const FALL_FOLLOW_DAMPING = 12
const LANDING_FOLLOW_DAMPING = 18
const CAMPUS_GAIT_CYCLE_LENGTH = 2.55
const MOUNTAIN_APPROACH_GAIT_CYCLE_LENGTH = 6.2
const MOUNTAIN_CLIMB_GAIT_CYCLE_LENGTH = 4.6

const dampAngle = (current, target, damping, delta) => {
  const shortestDelta = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  )
  return current + shortestDelta * (1 - Math.exp(-damping * delta))
}

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
  const { isNightMode } = useDayNight()
  const characterRef = useRef()
  const characterLightRef = useRef()
  const poseRef = useRef()
  const torsoRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const rightForearmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const summitArrivalTimeRef = useRef(null)
  const fallMotionProgressRef = useRef(0)
  const fallMotionInitializedRef = useRef(false)
  const gaitPhaseRef = useRef(0)
  const gaitMotionBlendRef = useRef(0)
  const gaitPreviousPositionRef = useRef(new THREE.Vector3())
  const gaitPreviousOffsetRef = useRef(0)
  const gaitInitializedRef = useRef(false)
  const headingPreviousPositionRef = useRef(new THREE.Vector3())
  const headingInitializedRef = useRef(false)
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
    const progress = getCharacterKeyframeProgress(offset, start, end)

    currentPosition.fromArray(start.position)
    nextPosition.fromArray(end.position)
    characterRef.current.position.copy(currentPosition.lerp(nextPosition, progress))
    if (offset < PLAYGROUND_MOTION_OFFSETS.slideEnd) {
      getPlaygroundSlideSeatPoint(progress, currentPosition)
      characterRef.current.position.copy(currentPosition)
    }
    const isPlaygroundFall =
      offset >= PLAYGROUND_MOTION_OFFSETS.slideEnd &&
      offset <= PLAYGROUND_MOTION_OFFSETS.groundContact
    if (isPlaygroundFall) {
      const targetFallProgress = getPlaygroundFallProgress(offset)
      if (!fallMotionInitializedRef.current) {
        fallMotionProgressRef.current = targetFallProgress
        fallMotionInitializedRef.current = true
      } else {
        fallMotionProgressRef.current = THREE.MathUtils.damp(
          fallMotionProgressRef.current,
          targetFallProgress,
          FALL_FOLLOW_DAMPING,
          delta,
        )
      }
      getPlaygroundFallPositionAtProgress(
        fallMotionProgressRef.current,
        currentPosition,
      )
      characterRef.current.position.copy(currentPosition)
    } else if (offset < PLAYGROUND_MOTION_OFFSETS.slideEnd) {
      fallMotionProgressRef.current = 0
      fallMotionInitializedRef.current = false
    }
    const isOnMountainPath =
      offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end
    if (isOnMountainPath) {
      getMountainTrailPositionAtOffset(offset, currentPosition)
      characterRef.current.position.copy(currentPosition)
    }

    const isWalking =
      offset >= CAMPUS_PATH.walkStart && offset < MOUNTAIN_PATH.start
    const isHiking =
      offset >= MOUNTAIN_PATH.start && offset < SUMMIT_SEQUENCE.haltEnd
    const isMoving = isWalking || isHiking
    const isMountainApproach =
      isHiking && offset < MOUNTAIN_PATH.slopeStart
    const isApproachingMountainTurn =
      end.t === MOUNTAIN_PATH.start && offset < MOUNTAIN_PATH.start
    let targetHeading = isOnMountainPath
      ? getMountainTrailHeadingAtOffset(offset)
      : isApproachingMountainTurn
        ? start.rotationY
        : THREE.MathUtils.lerp(start.rotationY, end.rotationY, progress)

    if (isMoving) {
      if (headingInitializedRef.current) {
        horizontalMovement.subVectors(
          characterRef.current.position,
          headingPreviousPositionRef.current,
        )
        horizontalMovement.y = 0
        if (horizontalMovement.lengthSq() > 0.0000001) {
          targetHeading = Math.atan2(
            horizontalMovement.x,
            horizontalMovement.z,
          )
        }
      } else {
        headingInitializedRef.current = true
      }
    } else {
      headingInitializedRef.current = false
    }
    headingPreviousPositionRef.current.copy(characterRef.current.position)
    characterRef.current.rotation.y = dampAngle(
      characterRef.current.rotation.y,
      targetHeading,
      12,
      delta,
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
    let rightForearmX = 0
    let rightForearmZ = 0
    let rightForearmY = -0.32
    let leftLegX
    let rightLegX
    let leftLegLift = 0
    let rightLegLift = 0
    let summitHeadTargetY = null
    let torsoBreathScale = 1

    if (offset < SUMMIT_SEQUENCE.haltEnd) {
      summitArrivalTimeRef.current = null
    } else if (summitArrivalTimeRef.current === null) {
      summitArrivalTimeRef.current = state.clock.elapsedTime
    }

    if (offset < PLAYGROUND_MOTION_OFFSETS.waveEnd) {
      // Hold the hips low and the legs forward: this is the dedicated seated
      // pose at the slide entrance, not the standing idle pose.
      posePositionY = SLIDE_SEATED_POSE_Y
      leftLegX = SEATED_LEG_ROTATION_X
      rightLegX = SEATED_LEG_ROTATION_X
      // Hold the upper arm beside the head and wave laterally from the elbow.
      // Keeping rotation.x nearly fixed removes the old lucky-cat depth swing.
      rightArmX = -0.08
      rightArmZ = WAVE_SHOULDER_ROTATION_Z
      rightForearmX = -0.12
      rightForearmZ =
        WAVE_ELBOW_BEND_Z +
        Math.sin(state.clock.elapsedTime * 6.4) * WAVE_ELBOW_SWING_Z
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
      const slideContactBlend = THREE.MathUtils.smootherstep(
        slideProgress,
        0,
        1,
      )
      posePositionY = SLIDE_SEATED_POSE_Y
      poseRotationX = THREE.MathUtils.lerp(
        0,
        PLAYGROUND_SLIDE_ROTATION_X,
        slideContactBlend,
      )
      leftArmX = THREE.MathUtils.lerp(0, -0.72, slideProgress)
      rightArmX = THREE.MathUtils.lerp(
        -0.08,
        -0.72,
        waveRelease,
      )
      leftArmZ = THREE.MathUtils.lerp(-0.08, -0.3, slideProgress)
      rightArmZ = THREE.MathUtils.lerp(
        WAVE_SHOULDER_ROTATION_Z,
        0.3,
        waveRelease,
      )
      rightForearmX = THREE.MathUtils.lerp(-0.12, 0, waveRelease)
      rightForearmZ = THREE.MathUtils.lerp(
        WAVE_ELBOW_BEND_Z +
          Math.sin(state.clock.elapsedTime * 6.4) * WAVE_ELBOW_SWING_Z,
        0,
        waveRelease,
      )
      leftLegX = THREE.MathUtils.lerp(
        SEATED_LEG_ROTATION_X,
        -1.05,
        slideProgress,
      )
      rightLegX = leftLegX
    } else if (offset < PLAYGROUND_MOTION_OFFSETS.groundContact) {
      const fallProgress = fallMotionProgressRef.current
      posePositionY = THREE.MathUtils.lerp(
        SLIDE_SEATED_POSE_Y,
        0,
        fallProgress,
      )
      poseRotationX = THREE.MathUtils.lerp(
        PLAYGROUND_SLIDE_ROTATION_X,
        0.16,
        fallProgress,
      )
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
      const impact = Math.sin(landingProgress * Math.PI)

      if (fallMotionInitializedRef.current) {
        fallMotionProgressRef.current = THREE.MathUtils.damp(
          fallMotionProgressRef.current,
          1,
          LANDING_FOLLOW_DAMPING,
          delta,
        )
        getPlaygroundFallPositionAtProgress(
          fallMotionProgressRef.current,
          currentPosition,
        )
        characterRef.current.position.copy(currentPosition)
      }

      posePositionY = Math.sin(landingProgress * Math.PI) * 0.04
      poseScaleX = 1 + impact * 0.1
      poseScaleY = 1 - impact * 0.16
      poseScaleZ = 1 + impact * 0.08
      poseRotationX = THREE.MathUtils.lerp(0.16, 0, landingProgress)
      leftArmZ = THREE.MathUtils.lerp(-2.25, -0.08, landingProgress)
      rightArmZ = THREE.MathUtils.lerp(2.25, 0.08, landingProgress)
      leftLegX = THREE.MathUtils.lerp(0.38, 0, landingProgress)
      rightLegX = THREE.MathUtils.lerp(-0.38, 0, landingProgress)
    } else {
      const gaitCycleLength = isWalking
        ? CAMPUS_GAIT_CYCLE_LENGTH
        : isMountainApproach
          ? MOUNTAIN_APPROACH_GAIT_CYCLE_LENGTH
          : MOUNTAIN_CLIMB_GAIT_CYCLE_LENGTH
      let movementTarget = 0

      if (isMoving) {
        if (!gaitInitializedRef.current) {
          gaitPreviousPositionRef.current.copy(characterRef.current.position)
          gaitPreviousOffsetRef.current = offset
          gaitInitializedRef.current = true
        } else {
          const travelledDistance = characterRef.current.position.distanceTo(
            gaitPreviousPositionRef.current,
          )
          const scrollDirection = Math.sign(
            offset - gaitPreviousOffsetRef.current,
          )
          if (scrollDirection !== 0 && travelledDistance > 0.00001) {
            gaitPhaseRef.current +=
              scrollDirection *
              travelledDistance *
              ((Math.PI * 2) / gaitCycleLength)
          }
          const worldSpeed = travelledDistance / Math.max(delta, 1 / 120)
          movementTarget = THREE.MathUtils.smoothstep(
            worldSpeed,
            0.04,
            0.5,
          )
          gaitPreviousPositionRef.current.copy(characterRef.current.position)
          gaitPreviousOffsetRef.current = offset
        }
      } else {
        gaitInitializedRef.current = false
      }

      gaitMotionBlendRef.current = THREE.MathUtils.damp(
        gaitMotionBlendRef.current,
        movementTarget,
        movementTarget > gaitMotionBlendRef.current ? 10 : 7,
        delta,
      )
      const walkCycle = Math.sin(gaitPhaseRef.current)
      const summitWalkFade = isHiking
        ? 1 -
          THREE.MathUtils.smoothstep(
            offset,
            SUMMIT_SEQUENCE.haltStart,
            SUMMIT_SEQUENCE.haltEnd,
          )
        : 1
      const movementBlend = gaitMotionBlendRef.current * summitWalkFade
      const stride = isWalking ? 0.34 : isMountainApproach ? 0.34 : 0.4
      const limbSwing = isMoving ? walkCycle * stride * movementBlend : 0
      const legLift = isWalking ? 0.1 : isMountainApproach ? 0.11 : 0.14

      leftArmX = limbSwing
      rightArmX = -limbSwing
      leftLegX = -limbSwing
      rightLegX = limbSwing
      leftLegLift = Math.max(0, -walkCycle) * legLift * movementBlend
      rightLegLift = Math.max(0, walkCycle) * legLift * movementBlend
      if (isWalking) {
        characterRef.current.position.y +=
          Math.abs(walkCycle) * 0.035 * movementBlend
      } else if (isHiking) {
        posePositionY = Math.abs(walkCycle) * 0.045 * movementBlend
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
    const mountainProjectLook = getNearestMountainProjectLook(offset)
    poseRef.current.rotation.y = THREE.MathUtils.damp(
      poseRef.current.rotation.y,
      landmarkProximity * 0.12 + mountainProjectLook * 0.1,
      7,
      delta,
    )
    const isSummitIdle = offset >= SUMMIT_SEQUENCE.haltEnd
    const headTargetY = isSummitIdle
      ? (summitHeadTargetY ?? 0)
      : landmarkProximity * 0.34 + mountainProjectLook * 0.42
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
    const legBaseY = outfit === 'hiker' ? 1.55 : 1.15
    leftLegRef.current.position.y = legBaseY + leftLegLift
    rightLegRef.current.position.y = legBaseY + rightLegLift

    if (characterLightRef.current) {
      characterLightRef.current.intensity = THREE.MathUtils.damp(
        characterLightRef.current.intensity,
        isNightMode ? 0.7 : 0,
        2,
        delta,
      )
    }
  })

  return (
    <group ref={characterRef}>
      <pointLight
        ref={characterLightRef}
        name="characterMoonlightFill"
        color="#A3C2FF"
        intensity={0}
        distance={9}
        decay={2}
        position={[0, 2, 2]}
      />
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
