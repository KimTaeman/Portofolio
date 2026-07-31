import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  CAMPUS_CAMERA_TRACKING,
  CAMERA_KEYFRAMES,
  getCharacterPositionAtOffset,
  getNearestCampusProximity,
  MOUNTAIN_PATH,
  SUMMIT_LOOK_AROUND,
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
const lookDirection = new THREE.Vector3()
const mountainCharacterPosition = new THREE.Vector3()
const trailingCameraPosition = new THREE.Vector3()
const trailingLookTarget = new THREE.Vector3()

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

      lookYawRef.current = THREE.MathUtils.clamp(
        lookYawRef.current - deltaX * 0.005,
        SUMMIT_LOOK_AROUND.minYaw,
        SUMMIT_LOOK_AROUND.maxYaw,
      )
      lookPitchRef.current = THREE.MathUtils.clamp(
        lookPitchRef.current - deltaY * 0.004,
        SUMMIT_LOOK_AROUND.minPitch,
        SUMMIT_LOOK_AROUND.maxPitch,
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
    const desiredFov = THREE.MathUtils.lerp(start.fov, end.fov, segmentT)

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
      trailingCameraPosition.set(
        mountainCharacterPosition.x,
        mountainCharacterPosition.y + MOUNTAIN_PATH.cameraHeight,
        mountainCharacterPosition.z + MOUNTAIN_PATH.cameraDistance,
      )
      trailingLookTarget.set(
        mountainCharacterPosition.x,
        mountainCharacterPosition.y + MOUNTAIN_PATH.lookHeight,
        mountainCharacterPosition.z - MOUNTAIN_PATH.lookAhead,
      )
      desiredCameraPosition.lerp(trailingCameraPosition, cameraBlend)
      desiredLookTarget.lerp(trailingLookTarget, cameraBlend)
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
      const cosPitch = Math.cos(lookPitchRef.current)
      lookDirection.set(
        Math.sin(lookYawRef.current) * cosPitch,
        Math.sin(lookPitchRef.current),
        -Math.cos(lookYawRef.current) * cosPitch,
      )
      desiredLookTarget
        .copy(desiredCameraPosition)
        .addScaledVector(lookDirection, 30)
    } else {
      desiredCameraPosition.x += pointerRef.current.x * 0.32
      desiredCameraPosition.y += pointerRef.current.y * 0.18
      desiredCameraPosition.z -= getNearestCampusProximity(offset) * 0.65
    }

    const isMountainClimb =
      offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end
    const positionDamping =
      1 - Math.exp(-(isMountainClimb ? 3.1 : 7) * delta)
    const rotationDamping =
      1 - Math.exp(-(isMountainClimb ? 4.2 : 8) * delta)
    camera.position.lerp(desiredCameraPosition, positionDamping)
    if (
      offset >= CAMPUS_CAMERA_TRACKING.start &&
      offset <= CAMPUS_CAMERA_TRACKING.end
    ) {
      camera.position.x = desiredCameraPosition.x
    }
    lookAtMatrix.lookAt(camera.position, desiredLookTarget, worldUp)
    desiredQuaternion.setFromRotationMatrix(lookAtMatrix)
    camera.quaternion.slerp(desiredQuaternion, rotationDamping)
    camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 9, delta)
    camera.updateProjectionMatrix()
  })

  return null
}
