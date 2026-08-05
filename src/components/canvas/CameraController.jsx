import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAMPUS_CAMERA_TRACKING,
  CAMPUS_PATH,
  CAMERA_KEYFRAMES,
  getCharacterPositionAtOffset,
  getNearestCampusProximity,
  getPlaygroundFallPositionAtOffset,
  getPlaygroundFallProgress,
  MOUNTAIN_CORNER,
  MOUNTAIN_ORIGIN_Z,
  MOUNTAIN_PATH,
  MOUNTAIN_PROJECT_BADGE_HEIGHT,
  MOUNTAIN_PROJECT_ANCHORS,
  MOUNTAIN_PROJECT_MOBILE_DEPTH_STAGGER,
  MOUNTAIN_PROJECT_MOBILE_LATERAL_SPREAD,
  PLAYGROUND_MOTION_OFFSETS,
  SUMMIT_LOOK_AROUND,
  SUMMIT_SEQUENCE,
} from '../../config/narrativeTimeline'

const CAMERA_STOPS = CAMERA_KEYFRAMES.map(({ t, position, target, fov }) => ({
  t,
  position: new THREE.Vector3(...position),
  target: new THREE.Vector3(...target),
  fov,
}))

const desiredCameraPosition = new THREE.Vector3()
const desiredLookTarget = new THREE.Vector3()
const desiredQuaternion = new THREE.Quaternion()
const lookAtMatrix = new THREE.Matrix4()
const worldUp = new THREE.Vector3(0, 1, 0)
const mountainCharacterPosition = new THREE.Vector3()
const mountainLookAheadPosition = new THREE.Vector3()
const mountainForwardDirection = new THREE.Vector3()
const trailingCameraPosition = new THREE.Vector3()
const trailingLookTarget = new THREE.Vector3()
const projectBalloonWorldPosition = new THREE.Vector3()
const projectFramingTarget = new THREE.Vector3()
const summitEntryCharacterPosition = new THREE.Vector3()
const summitCharacterPosition = new THREE.Vector3()
const summitEntryCameraPosition = new THREE.Vector3()
const summitFinalCameraPosition = new THREE.Vector3()
const summitOrbitTarget = new THREE.Vector3()
const fallCharacterPosition = new THREE.Vector3()
const fallCameraPosition = new THREE.Vector3()
const fallLookTarget = new THREE.Vector3()
const stabilizedFallLookTarget = new THREE.Vector3()
const campusCharacterPosition = new THREE.Vector3()
const responsiveCameraOffset = new THREE.Vector3()
// Canvas transforms remain ref-driven every frame; React only receives a
// coarse UI snapshot so DOM overlays do not reconcile at render frequency.
const SCROLL_REPORT_INTERVAL_MS = 80
const PROJECT_CAMERA_HOLD_RADIUS = 0.009
const PROJECT_CAMERA_FALLOFF_RADIUS = 0.028
const PROJECT_CAMERA_TARGET_LIFT = MOUNTAIN_PROJECT_BADGE_HEIGHT * 0.58
const PROJECT_CAMERA_HEIGHT_LIFT = 1.05
const PROJECT_CAMERA_DISTANCE_LIFT = 3.25
const PROJECT_CAMERA_TARGET_BLEND = 0.48
const noop = () => {}

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

export default function CameraController({ onScrollOffsetChange = noop }) {
  const scroll = useScroll()
  const { events, gl } = useThree()
  const isLookAroundActiveRef = useRef(false)
  const latestScrollOffsetRef = useRef(0)
  const reportedScrollOffsetRef = useRef(-1)
  const interactionElementRef = useRef(null)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const isFallLookInitializedRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ isDragging: false, pointerId: null, x: 0, y: 0 })

  useEffect(() => {
    const eventElement = events.connected || gl.domElement
    interactionElementRef.current = eventElement
    const originalCursor = eventElement.style.cursor
    const originalTouchAction = eventElement.style.touchAction

    const handlePointerDown = (event) => {
      if (!isLookAroundActiveRef.current) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      if (event.pointerType !== 'touch') event.preventDefault()
      dragRef.current = {
        isDragging: true,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      }
      eventElement.setPointerCapture(event.pointerId)
      eventElement.style.cursor = 'grabbing'
    }

    const handlePointerMove = (event) => {
      const bounds = eventElement.getBoundingClientRect()
      pointerRef.current.x = THREE.MathUtils.clamp(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -1,
        1,
      )
      pointerRef.current.y = THREE.MathUtils.clamp(
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        -1,
        1,
      )

      const drag = dragRef.current
      if (!drag.isDragging || drag.pointerId !== event.pointerId) return

      if (event.pointerType !== 'touch') event.preventDefault()
      const deltaX = event.clientX - drag.x
      const deltaY = event.clientY - drag.y
      drag.x = event.clientX
      drag.y = event.clientY

      lookYawRef.current -= deltaX * 0.005
      if (Math.abs(lookYawRef.current) > Math.PI * 2) {
        lookYawRef.current %= Math.PI * 2
      }
      lookPitchRef.current = THREE.MathUtils.clamp(
        lookPitchRef.current - deltaY * 0.004,
        SUMMIT_LOOK_AROUND.minElevation - SUMMIT_LOOK_AROUND.baseElevation,
        SUMMIT_LOOK_AROUND.maxElevation - SUMMIT_LOOK_AROUND.baseElevation,
      )
    }

    const handlePointerLeave = () => {
      if (dragRef.current.isDragging) return
      pointerRef.current.x = 0
      pointerRef.current.y = 0
    }

    const handlePointerUp = (event) => {
      if (dragRef.current.pointerId !== event.pointerId) return
      dragRef.current.isDragging = false
      dragRef.current.pointerId = null
      eventElement.style.cursor = isLookAroundActiveRef.current
        ? 'grab'
        : originalCursor
      if (eventElement.hasPointerCapture(event.pointerId)) {
        eventElement.releasePointerCapture(event.pointerId)
      }
    }

    eventElement.addEventListener('pointerdown', handlePointerDown)
    eventElement.addEventListener('pointermove', handlePointerMove)
    eventElement.addEventListener('pointerup', handlePointerUp)
    eventElement.addEventListener('pointercancel', handlePointerUp)
    eventElement.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      eventElement.removeEventListener('pointerdown', handlePointerDown)
      eventElement.removeEventListener('pointermove', handlePointerMove)
      eventElement.removeEventListener('pointerup', handlePointerUp)
      eventElement.removeEventListener('pointercancel', handlePointerUp)
      eventElement.removeEventListener('pointerleave', handlePointerLeave)
      eventElement.style.cursor = originalCursor
      eventElement.style.touchAction = originalTouchAction
      if (interactionElementRef.current === eventElement) {
        interactionElementRef.current = null
      }
    }
  }, [events.connected, gl])

  useEffect(() => {
    const reportScrollOffset = () => {
      const nextOffset = latestScrollOffsetRef.current
      if (
        Math.abs(nextOffset - reportedScrollOffsetRef.current) < 0.0005
      ) {
        return
      }
      reportedScrollOffsetRef.current = nextOffset
      onScrollOffsetChange(nextOffset)
    }

    reportScrollOffset()
    const intervalId = window.setInterval(
      reportScrollOffset,
      SCROLL_REPORT_INTERVAL_MS,
    )
    return () => window.clearInterval(intervalId)
  }, [onScrollOffsetChange])

  useFrame((state, delta) => {
    const { camera } = state
    const offset = scroll.offset
    latestScrollOffsetRef.current = offset
    const viewportAspect = state.size.width / Math.max(state.size.height, 1)
    const isMobilePortrait =
      state.size.width < 768 && viewportAspect < 1
    const mobilePortraitAmount = isMobilePortrait
      ? THREE.MathUtils.clamp((1 - viewportAspect) / 0.5, 0.45, 1)
      : 0

    const { start, end } = getSegment(offset)
    const range = end.t - start.t
    const segmentT = range > 0 ? THREE.MathUtils.clamp((offset - start.t) / range, 0, 1) : 0
    desiredCameraPosition.copy(start.position).lerp(end.position, segmentT)
    desiredLookTarget.copy(start.target).lerp(end.target, segmentT)
    let desiredFov = THREE.MathUtils.lerp(start.fov, end.fov, segmentT)
    const isPlaygroundFall =
      offset >= PLAYGROUND_MOTION_OFFSETS.slideEnd &&
      offset <= PLAYGROUND_MOTION_OFFSETS.groundContact

    if (isPlaygroundFall) {
      const fallProgress = getPlaygroundFallProgress(offset)
      const landingEase = THREE.MathUtils.smoothstep(fallProgress, 0.72, 1)
      getPlaygroundFallPositionAtOffset(offset, fallCharacterPosition)
      fallCameraPosition.set(
        fallCharacterPosition.x +
          THREE.MathUtils.lerp(3, 2, landingEase),
        fallCharacterPosition.y + THREE.MathUtils.lerp(2.2, 2.8, fallProgress),
        fallCharacterPosition.z + 6.4,
      )
      fallLookTarget.set(
        fallCharacterPosition.x + 1.6 * landingEase,
        fallCharacterPosition.y +
          THREE.MathUtils.lerp(-0.21, 0.6, fallProgress),
        fallCharacterPosition.z,
      )
      desiredCameraPosition.copy(fallCameraPosition)
      desiredLookTarget.copy(fallLookTarget)
      desiredFov = 48 + Math.sin(fallProgress * Math.PI) * 2.5
      if (!isFallLookInitializedRef.current) {
        stabilizedFallLookTarget.copy(desiredLookTarget)
        isFallLookInitializedRef.current = true
      } else {
        stabilizedFallLookTarget.lerp(
          desiredLookTarget,
          1 - Math.exp(-9 * delta),
        )
      }
    } else {
      isFallLookInitializedRef.current = false
    }

    const isCampusTracking =
      offset >= CAMPUS_CAMERA_TRACKING.start &&
      offset <= CAMPUS_CAMERA_TRACKING.end
    if (isCampusTracking) {
      getCharacterPositionAtOffset(offset, campusCharacterPosition)
      desiredCameraPosition.x =
        campusCharacterPosition.x +
        CAMPUS_CAMERA_TRACKING.characterFrameOffsetX
      desiredLookTarget.x = desiredCameraPosition.x
      desiredCameraPosition.y =
        CAMPUS_PATH.surfaceY + CAMPUS_CAMERA_TRACKING.heightAbovePath
      desiredLookTarget.y =
        CAMPUS_PATH.surfaceY + CAMPUS_CAMERA_TRACKING.lookHeightAbovePath
      desiredFov = CAMPUS_CAMERA_TRACKING.fov
    }

    if (
      offset >= MOUNTAIN_PATH.cameraTransitionStart &&
      offset <= MOUNTAIN_PATH.end
    ) {
      const cameraBlend = THREE.MathUtils.smoothstep(
        offset,
        MOUNTAIN_PATH.cameraTransitionStart,
        MOUNTAIN_PATH.cameraTransitionEnd,
      )
      getCharacterPositionAtOffset(offset, mountainCharacterPosition)
      getCharacterPositionAtOffset(
        Math.min(offset + MOUNTAIN_PATH.lookAheadOffset, MOUNTAIN_PATH.end),
        mountainLookAheadPosition,
      )
      mountainForwardDirection.subVectors(
        mountainLookAheadPosition,
        mountainCharacterPosition,
      )
      mountainForwardDirection.y = 0
      if (mountainForwardDirection.lengthSq() < 0.0001) {
        getCharacterPositionAtOffset(
          Math.max(
            offset - MOUNTAIN_PATH.lookAheadOffset,
            MOUNTAIN_PATH.start,
          ),
          mountainLookAheadPosition,
        )
        mountainForwardDirection.subVectors(
          mountainCharacterPosition,
          mountainLookAheadPosition,
        )
        mountainForwardDirection.y = 0
      }
      mountainForwardDirection.normalize()
      trailingCameraPosition.set(
        mountainCharacterPosition.x,
        mountainCharacterPosition.y + MOUNTAIN_PATH.cameraHeight,
        mountainCharacterPosition.z + MOUNTAIN_PATH.cameraDistance,
      )
      trailingLookTarget.set(
        mountainCharacterPosition.x +
          mountainForwardDirection.x * MOUNTAIN_PATH.lookDistance,
        mountainCharacterPosition.y + MOUNTAIN_PATH.subjectFrameHeight,
        mountainCharacterPosition.z +
          mountainForwardDirection.z * MOUNTAIN_PATH.lookDistance,
      )

      projectFramingTarget.set(0, 0, 0)
      let projectFramingWeight = 0
      let projectFramingStrength = 0
      for (const [anchorIndex, anchor] of MOUNTAIN_PROJECT_ANCHORS.entries()) {
        const checkpointDistance = Math.abs(offset - anchor.t)
        const checkpointStrength =
          1 -
          THREE.MathUtils.smoothstep(
            checkpointDistance,
            PROJECT_CAMERA_HOLD_RADIUS,
            PROJECT_CAMERA_FALLOFF_RADIUS,
          )
        if (checkpointStrength <= 0) continue

        const balloonLateralSpread = THREE.MathUtils.lerp(
          1,
          MOUNTAIN_PROJECT_MOBILE_LATERAL_SPREAD,
          mobilePortraitAmount,
        )
        const balloonDepthStagger =
          (anchorIndex % 2 ? -1 : 1) *
          MOUNTAIN_PROJECT_MOBILE_DEPTH_STAGGER *
          mobilePortraitAmount
        projectBalloonWorldPosition.set(
          MOUNTAIN_CORNER.x +
            anchor.triggerPosition[0] +
            (anchor.basePosition[0] - anchor.triggerPosition[0]) *
              balloonLateralSpread,
          MOUNTAIN_CORNER.y + anchor.basePosition[1],
          MOUNTAIN_ORIGIN_Z +
            anchor.triggerPosition[2] +
            (anchor.basePosition[2] - anchor.triggerPosition[2]) *
              balloonLateralSpread +
            balloonDepthStagger,
        )
        projectFramingTarget.addScaledVector(
          projectBalloonWorldPosition,
          checkpointStrength,
        )
        projectFramingWeight += checkpointStrength
        projectFramingStrength = Math.max(
          projectFramingStrength,
          checkpointStrength,
        )
      }

      if (projectFramingWeight > 0) {
        projectFramingTarget.divideScalar(projectFramingWeight)
        // The DOM badge is anchored above the balloon mesh. Frame the upper
        // assembly instead of its sphere center so tall checkpoints retain
        // comfortable viewport headroom.
        projectFramingTarget.y +=
          PROJECT_CAMERA_TARGET_LIFT * projectFramingStrength
        trailingCameraPosition.y +=
          projectFramingStrength * PROJECT_CAMERA_HEIGHT_LIFT
        trailingCameraPosition.z +=
          projectFramingStrength * PROJECT_CAMERA_DISTANCE_LIFT
        trailingLookTarget.lerp(
          projectFramingTarget,
          projectFramingStrength * PROJECT_CAMERA_TARGET_BLEND,
        )
        desiredFov = THREE.MathUtils.lerp(
          desiredFov,
          52,
          projectFramingStrength,
        )
      }

      desiredCameraPosition.lerp(trailingCameraPosition, cameraBlend)
      desiredLookTarget.lerp(trailingLookTarget, cameraBlend)
    }

    if (offset >= SUMMIT_SEQUENCE.cameraPanStart) {
      const panProgress = THREE.MathUtils.smootherstep(
        offset,
        SUMMIT_SEQUENCE.cameraPanStart,
        SUMMIT_SEQUENCE.cameraPanEnd,
      )
      getCharacterPositionAtOffset(
        SUMMIT_SEQUENCE.cameraPanStart,
        summitEntryCharacterPosition,
      )
      getCharacterPositionAtOffset(offset, summitCharacterPosition)
      summitEntryCameraPosition.set(
        summitEntryCharacterPosition.x,
        summitEntryCharacterPosition.y + MOUNTAIN_PATH.cameraHeight,
        summitEntryCharacterPosition.z + MOUNTAIN_PATH.cameraDistance,
      )
      summitFinalCameraPosition.set(
        summitCharacterPosition.x + 8,
        summitCharacterPosition.y + 3,
        summitCharacterPosition.z + 8,
      )
      desiredCameraPosition
        .copy(summitEntryCameraPosition)
        .lerp(summitFinalCameraPosition, panProgress)
      desiredLookTarget.copy(summitCharacterPosition)
      desiredLookTarget.y += 1.2
      desiredFov = THREE.MathUtils.lerp(desiredFov, 50, panProgress)
    }

    const isLookAroundActive = offset >= SUMMIT_LOOK_AROUND.start
    if (isLookAroundActive !== isLookAroundActiveRef.current) {
      isLookAroundActiveRef.current = isLookAroundActive
      const eventElement = interactionElementRef.current
      if (eventElement) {
        eventElement.style.cursor = isLookAroundActive ? 'grab' : ''
        eventElement.style.touchAction = isLookAroundActive ? 'pan-y' : ''
      }

      if (!isLookAroundActive) {
        dragRef.current.isDragging = false
        lookYawRef.current = 0
        lookPitchRef.current = 0
      }
    }

    if (isLookAroundActive) {
      getCharacterPositionAtOffset(offset, summitCharacterPosition)
      summitOrbitTarget.copy(summitCharacterPosition)
      summitOrbitTarget.y += 1.2
      const elevation = THREE.MathUtils.clamp(
        SUMMIT_LOOK_AROUND.baseElevation + lookPitchRef.current,
        SUMMIT_LOOK_AROUND.minElevation,
        SUMMIT_LOOK_AROUND.maxElevation,
      )
      const azimuth = SUMMIT_LOOK_AROUND.baseAzimuth + lookYawRef.current
      const horizontalRadius =
        Math.cos(elevation) * SUMMIT_LOOK_AROUND.radius
      desiredCameraPosition.set(
        summitOrbitTarget.x + Math.sin(azimuth) * horizontalRadius,
        summitOrbitTarget.y + Math.sin(elevation) * SUMMIT_LOOK_AROUND.radius,
        summitOrbitTarget.z + Math.cos(azimuth) * horizontalRadius,
      )
      desiredLookTarget.copy(summitOrbitTarget)
    } else {
      desiredCameraPosition.x += pointerRef.current.x * 0.32
      desiredCameraPosition.y += pointerRef.current.y * 0.18
      desiredCameraPosition.z -= getNearestCampusProximity(offset) * 0.65
    }

    const portraitAmount = THREE.MathUtils.clamp(
      (0.9 - viewportAspect) / 0.45,
      0,
      1,
    )
    const responsiveAmount = Math.max(
      portraitAmount,
      mobilePortraitAmount,
    )
    if (responsiveAmount > 0) {
      responsiveCameraOffset
        .subVectors(desiredCameraPosition, desiredLookTarget)
        .multiplyScalar(1 + responsiveAmount * 0.48)
      desiredCameraPosition
        .copy(desiredLookTarget)
        .add(responsiveCameraOffset)
      desiredFov += responsiveAmount * 10
    }

    const isMountainClimb =
      offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end
    const isSummitCinematic =
      offset >= SUMMIT_SEQUENCE.cameraPanStart &&
      offset < SUMMIT_LOOK_AROUND.start
    const isCinematicCamera =
      isPlaygroundFall || isMountainClimb || isSummitCinematic
    const positionDamping =
      1 -
      Math.exp(
        -(isPlaygroundFall ? 7.2 : isCinematicCamera ? 5.2 : 9) * delta,
      )
    const rotationDamping =
      1 - Math.exp(-(isCinematicCamera ? 6.6 : 10) * delta)
    camera.position.lerp(desiredCameraPosition, positionDamping)
    if (isCampusTracking) {
      camera.position.x = desiredCameraPosition.x
    }
    if (isPlaygroundFall) {
      camera.lookAt(stabilizedFallLookTarget)
    } else if (isCinematicCamera) {
      camera.lookAt(desiredLookTarget)
    } else {
      lookAtMatrix.lookAt(camera.position, desiredLookTarget, worldUp)
      desiredQuaternion.setFromRotationMatrix(lookAtMatrix)
      camera.quaternion.slerp(desiredQuaternion, rotationDamping)
    }
    camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 9, delta)
    camera.updateProjectionMatrix()
  })

  return null
}
