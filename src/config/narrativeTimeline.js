export const SCROLL_PAGES = 8

export const CAMPUS_PATH = Object.freeze({
  centerX: 8,
  groundY: -10,
  characterZ: 3.42,
  walkStart: 0.2,
  walkEnd: 0.46,
  startX: 2,
  endX: 14,
})

export const CAMPUS_LANDMARKS = Object.freeze([
  Object.freeze({
    id: 'easel',
    worldX: 5.4,
    localX: -2.6,
    z: -0.82,
    proximityRadius: 1.55,
    bobSpeed: 1.55,
    bobPhase: 0,
    labelY: 2.15,
    text: 'I love designing visual experiences and practicing traditional art.',
  }),
  Object.freeze({
    id: 'badminton',
    worldX: 9.4,
    localX: 1.4,
    z: -0.72,
    proximityRadius: 1.55,
    bobSpeed: 1.7,
    bobPhase: 1.8,
    labelY: 2.15,
    text: 'When I need a break from coding, I enjoy staying active on the badminton court.',
  }),
  Object.freeze({
    id: 'skills',
    worldX: 13.2,
    localX: 5.2,
    z: -0.92,
    proximityRadius: 1.55,
    bobSpeed: 1.45,
    bobPhase: 3.4,
    labelY: 1.9,
    text: 'My laptop is where ideas become thoughtful, useful software.',
  }),
])

export const SCENES = [
  {
    id: 'playground',
    start: 0,
    end: 0.2,
    position: [0, 0, 0],
  },
  {
    id: 'campus',
    start: 0.2,
    end: 0.5,
    position: [CAMPUS_PATH.centerX, CAMPUS_PATH.groundY, 3.4],
  },
  {
    id: 'mountain',
    start: 0.5,
    end: 0.7,
    position: [CAMPUS_PATH.endX, CAMPUS_PATH.groundY, 18],
  },
  {
    id: 'summit',
    start: 0.7,
    end: 1,
    position: [CAMPUS_PATH.endX, -2, 34],
  },
]

const OVERLAY_FADE_LENGTH = 0.03

export const SCENE_RANGES = Object.fromEntries(
  SCENES.map((scene, index) => [
    scene.id,
    {
      start: scene.start,
      end: scene.end,
      fadeInEnd: index === 0 ? scene.start : scene.start + OVERLAY_FADE_LENGTH,
      fadeOutStart:
        index === SCENES.length - 1
          ? scene.end
          : scene.end - OVERLAY_FADE_LENGTH,
    },
  ]),
)

export const CHARACTER_KEYFRAMES = [
  { t: 0, position: [2, 2.28, -0.34], rotationY: 0 },
  { t: 0.08, position: [2, 0.91, 3.42], rotationY: 0 },
  {
    t: 0.19,
    position: [CAMPUS_PATH.startX, CAMPUS_PATH.groundY, CAMPUS_PATH.characterZ],
    rotationY: 0,
  },
  {
    t: CAMPUS_PATH.walkStart,
    position: [CAMPUS_PATH.startX, CAMPUS_PATH.groundY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: CAMPUS_PATH.walkEnd,
    position: [CAMPUS_PATH.endX, CAMPUS_PATH.groundY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: 0.5,
    position: [CAMPUS_PATH.endX, CAMPUS_PATH.groundY, 6],
    rotationY: 0,
  },
  { t: 0.53, position: [11.8, -9.67, 12], rotationY: -0.35 },
  { t: 0.57, position: [15.9, -9.17, 14.2], rotationY: 1.08 },
  { t: 0.61, position: [12.5, -8.67, 16.5], rotationY: -0.97 },
  { t: 0.66, position: [15.2, -8.17, 18.8], rotationY: 0.87 },
  { t: 0.7, position: [15.2, -7.7, 20], rotationY: 0 },
  { t: 0.74, position: [12.8, -6.4, 23], rotationY: -0.69 },
  { t: 0.78, position: [15.3, -5.2, 25.5], rotationY: 0.79 },
  { t: 0.82, position: [12.8, -4, 28], rotationY: -0.79 },
  { t: 0.86, position: [15, -2.7, 31], rotationY: 0.63 },
  { t: 0.9, position: [14, -1.2, 34], rotationY: 0 },
  { t: 1, position: [14, -1.2, 34], rotationY: 0 },
]

export const CAMERA_KEYFRAMES = [
  { t: 0, position: [1.5, 2.5, 6], target: [2, 1.55, 0.5], fov: 40 },
  { t: 0.08, position: [6, 2.5, 10], target: [2, 0.9, 3.42], fov: 48 },
  { t: 0.19, position: [3.6, -7, 12], target: [3.6, -9.4, 3.42], fov: 48 },
  { t: 0.2, position: [3.6, -7, 12], target: [3.6, -9.4, 3.42], fov: 48 },
  { t: 0.46, position: [15.6, -7, 12], target: [15.6, -9.4, 3.42], fov: 48 },
  { t: 0.48, position: [15.6, -7, 12], target: [15.6, -9.4, 3.42], fov: 48 },
  { t: 0.5, position: [14, -7, -1], target: [14, -9, 7], fov: 50 },
  { t: 0.58, position: [14, -6, 5], target: [14, -7.5, 15], fov: 50 },
  { t: 0.66, position: [14, -4.8, 9], target: [14, -6, 19], fov: 52 },
  { t: 0.7, position: [14, -3, 10], target: [14, -4, 24], fov: 52 },
  { t: 0.78, position: [14, -1.2, 16], target: [14, -3.5, 28], fov: 52 },
  { t: 0.86, position: [14, 0.8, 23], target: [14, -1.5, 34], fov: 53 },
  { t: 0.9, position: [14, 0.4, 27.5], target: [14, 0.4, 50], fov: 55 },
  { t: 1, position: [14, 0.4, 27.5], target: [14, 0.4, 50], fov: 55 },
]

export const SUMMIT_LOOK_AROUND = Object.freeze({
  start: 0.9,
  minYaw: -Math.PI / 2,
  maxYaw: Math.PI / 2,
  minPitch: 0,
  maxPitch: Math.PI / 6,
})

export const PLAYGROUND_MOTION_OFFSETS = Object.freeze({
  waveEnd: 0.03,
  slideEnd: 0.08,
  groundContact: 0.19,
  landingEnd: 0.2,
})

export const OUTFIT_TRANSITION_OFFSETS = Object.freeze({
  university: PLAYGROUND_MOTION_OFFSETS.groundContact,
  hiker: 0.535,
})

export const getCharacterOutfit = (offset) => {
  if (offset >= OUTFIT_TRANSITION_OFFSETS.hiker) return 'hiker'
  if (offset >= OUTFIT_TRANSITION_OFFSETS.university) return 'university'
  return 'school'
}

export const getCharacterXAtOffset = (offset) => {
  for (let index = 0; index < CHARACTER_KEYFRAMES.length - 1; index += 1) {
    const start = CHARACTER_KEYFRAMES[index]
    const end = CHARACTER_KEYFRAMES[index + 1]
    if (offset > end.t) continue

    const range = end.t - start.t
    const progress = range
      ? Math.max(0, Math.min(1, (offset - start.t) / range))
      : 0
    return start.position[0] + (end.position[0] - start.position[0]) * progress
  }

  return CHARACTER_KEYFRAMES[CHARACTER_KEYFRAMES.length - 1].position[0]
}

export const getCampusLandmarkProximity = (offset, landmark) => {
  if (offset < CAMPUS_PATH.walkStart || offset > CAMPUS_PATH.walkEnd) return 0

  const distance = Math.abs(getCharacterXAtOffset(offset) - landmark.worldX)
  const linearStrength = Math.max(
    0,
    Math.min(1, 1 - distance / landmark.proximityRadius),
  )
  return linearStrength * linearStrength * (3 - 2 * linearStrength)
}

export const getNearestCampusProximity = (offset) => {
  let strength = 0
  for (const landmark of CAMPUS_LANDMARKS) {
    strength = Math.max(strength, getCampusLandmarkProximity(offset, landmark))
  }
  return strength
}

export const CAMPUS_CAMERA_TRACKING = Object.freeze({
  start: SCENE_RANGES.campus.start,
  end: 0.48,
  characterFrameOffsetX: 1.6,
})

export const MOUNTAIN_INTERACTION_RANGE = Object.freeze({
  triggerStart: 0.59,
  triggerEnd: 0.62,
  resetStart: 0.55,
  resetEnd: 0.65,
})

export const isInMountainTriggerRange = (offset) =>
  offset >= MOUNTAIN_INTERACTION_RANGE.triggerStart &&
  offset <= MOUNTAIN_INTERACTION_RANGE.triggerEnd

export const hasExitedMountainInteractionRange = (offset) =>
  offset < MOUNTAIN_INTERACTION_RANGE.resetStart ||
  offset > MOUNTAIN_INTERACTION_RANGE.resetEnd
