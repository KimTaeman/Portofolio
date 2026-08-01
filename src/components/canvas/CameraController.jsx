import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAMPUS_CAMERA_TRACKING,
  CAMERA_KEYFRAMES,
  getCharacterPositionAtOffset,
  getNearestCampusProximity,
  getPlaygroundFallPositionAtOffset,
  getPlaygroundFallProgress,
  MOUNTAIN_PATH,
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
const trailingCameraPosition = new THREE.Vector3()
const trailingLookTarget = new THREE.Vector3()
const summitEntryCharacterPosition = new THREE.Vector3()
const summitCharacterPosition = new THREE.Vector3()
const summitEntryCameraPosition = new THREE.Vector3()
const summitFinalCameraPosition = new THREE.Vector3()
const summitOrbitTarget = new THREE.Vector3()
const fallCharacterPosition = new THREE.Vector3()
const fallCameraPosition = new THREE.Vector3()
const fallLookTarget = new THREE.Vector3()

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

export default function CameraController({ onScrollOffsetChange = () => {} }) {
  const scroll = useScroll()
  const { events, gl } = useThree()
  const [isLookAroundActive, setIsLookAroundActive] = useState(false)
  const isLookAroundActiveRef = useRef(false)
  const interactionElementRef = useRef(null)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
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
    const eventElement = interactionElementRef.current
    if (!eventElement) return undefined

    eventElement.style.cursor = isLookAroundActive ? 'grab' : ''
    eventElement.style.touchAction = isLookAroundActive ? 'pan-y' : ''

    return () => {
      eventElement.style.cursor = ''
      eventElement.style.touchAction = ''
    }
  }, [events.connected, gl, isLookAroundActive])

  useFrame((state, delta) => {
    const { camera } = state
    const offset = scroll.offset
    onScrollOffsetChange(offset)

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
      trailingCameraPosition.set(
        mountainCharacterPosition.x,
        mountainCharacterPosition.y + MOUNTAIN_PATH.cameraHeight,
        mountainCharacterPosition.z + MOUNTAIN_PATH.cameraDistance,
      )
      trailingLookTarget.set(
        mountainLookAheadPosition.x,
        mountainLookAheadPosition.y + MOUNTAIN_PATH.lookHeight,
        mountainLookAheadPosition.z,
      )
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
      setIsLookAroundActive(isLookAroundActive)

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

    const isMountainClimb =
      offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end
    const isSummitCinematic =
      offset >= SUMMIT_SEQUENCE.cameraPanStart &&
      offset < SUMMIT_LOOK_AROUND.start
    const isCinematicCamera =
      isPlaygroundFall || isMountainClimb || isSummitCinematic
    const positionDamping =
      1 - Math.exp(-(isCinematicCamera ? 3.08 : 7) * delta)
    const rotationDamping =
      1 - Math.exp(-(isCinematicCamera ? 4.2 : 8) * delta)
    camera.position.lerp(desiredCameraPosition, positionDamping)
    if (
      offset >= CAMPUS_CAMERA_TRACKING.start &&
      offset <= CAMPUS_CAMERA_TRACKING.end
    ) {
      camera.position.x = desiredCameraPosition.x
    }
    if (isCinematicCamera) {
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
