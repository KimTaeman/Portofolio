export const SCROLL_PAGES = 8

export const CAMPUS_PATH = Object.freeze({
  centerX: 8,
  groundY: -10,
  characterZ: 3.42,
  walkStart: 0.2,
  walkEnd: 0.48,
  startX: 2,
  endX: 19,
})

export const MOUNTAIN_CORNER = Object.freeze({
  x: CAMPUS_PATH.endX,
  y: CAMPUS_PATH.groundY,
  z: CAMPUS_PATH.characterZ,
})

export const MOUNTAIN_ORIGIN_Z = -40
export const MOUNTAIN_CHARACTER_FOOT_OFFSET = 0.16
export const MOUNTAIN_CLIMB_CLEARANCE = 1.5
export const MOUNTAIN_CHARACTER_GROUND_OFFSET = 1.2

const MOUNTAIN_APPROACH_START = 0.5
const MOUNTAIN_APPROACH_END = 0.674
const MOUNTAIN_CLIMB_START = 0.68
const MOUNTAIN_CLIMB_END = 0.82
const MOUNTAIN_FINAL_SURFACE_HEIGHT = 18.35

export const MOUNTAIN_SUMMIT = Object.freeze({
  y:
    CAMPUS_PATH.groundY +
    MOUNTAIN_FINAL_SURFACE_HEIGHT +
    MOUNTAIN_CLIMB_CLEARANCE +
    MOUNTAIN_CHARACTER_GROUND_OFFSET,
  z: -77,
})

export const SUMMIT_SEQUENCE = Object.freeze({
  start: MOUNTAIN_CLIMB_END,
  haltStart: 0.85,
  haltEnd: 0.88,
  cameraPanStart: 0.84,
  cameraPanEnd: 0.94,
  uiRevealStart: 0.94,
  uiRevealEnd: 0.975,
  characterPosition: Object.freeze([
    CAMPUS_PATH.endX,
    MOUNTAIN_SUMMIT.y,
    MOUNTAIN_SUMMIT.z,
  ]),
})

const APPROACH_STONE_COUNT = 19
const APPROACH_LOCAL_Z = MOUNTAIN_CORNER.z - MOUNTAIN_ORIGIN_Z
const CLIMB_BASE_TOP =
  0.48 + MOUNTAIN_CLIMB_CLEARANCE

const APPROACH_TRAIL_STONES = Array.from(
  { length: APPROACH_STONE_COUNT },
  (_, index) => {
    const progress = index / (APPROACH_STONE_COUNT - 1)
    const foothillRise = progress ** 4
    return Object.freeze({
      t:
        MOUNTAIN_APPROACH_START +
        progress * (MOUNTAIN_APPROACH_END - MOUNTAIN_APPROACH_START),
      x: Math.sin(progress * Math.PI * 4) * 0.55,
      topY:
        MOUNTAIN_CHARACTER_FOOT_OFFSET +
        (CLIMB_BASE_TOP - MOUNTAIN_CHARACTER_FOOT_OFFSET) * foothillRise,
      z: APPROACH_LOCAL_Z * (1 - progress) + 1.5 * progress,
      rotationY: Math.sin(index * 1.7) * 0.18,
      scale: 0.84 + (index % 4) * 0.055,
      phase: 'approach',
    })
  },
)

const CLIMB_TRAIL_PROFILE = [
  [0, 0.48, 0, 0.08, 0.95],
  [-0.3, 1.3, -1.8, -0.15, 0.88],
  [-0.7, 2.15, -3.6, 0.18, 1.05],
  [-1.1, 3.05, -5.4, -0.12, 0.9],
  [-0.8, 4.05, -7.2, 0.22, 1],
  [-0.2, 5.15, -9, -0.16, 0.86],
  [0.6, 6.25, -10.8, 0.18, 1.02],
  [1.2, 7.45, -12.6, -0.08, 0.91],
  [1.6, 8.65, -14.4, 0.15, 1.05],
  [1.7, 9.85, -16.2, -0.2, 0.88],
  [1.3, 11.05, -18, 0.13, 1],
  [0.7, 12.25, -19.8, -0.1, 0.92],
  [-0.1, 13.45, -21.6, 0.2, 1.04],
  [-0.7, 14.65, -23.4, -0.15, 0.9],
  [-1, 15.65, -25.2, 0.1, 1],
  [-1.1, 16.65, -27, -0.18, 0.9],
  [-0.8, 17.55, -28.8, 0.14, 1.03],
  [0, 18.35, -30.2, -0.1, 0.92],
]

const CLIMB_TRAIL_STONES = CLIMB_TRAIL_PROFILE.map(
  ([x, surfaceY, z, rotationY, scale], index) =>
    Object.freeze({
      t:
        MOUNTAIN_CLIMB_START +
        (index / (CLIMB_TRAIL_PROFILE.length - 1)) *
          (MOUNTAIN_CLIMB_END - MOUNTAIN_CLIMB_START),
      x,
      topY: surfaceY + MOUNTAIN_CLIMB_CLEARANCE,
      z,
      rotationY,
      scale,
      phase: 'climb',
    }),
)

export const MOUNTAIN_TRAIL_STONES = Object.freeze([
  ...APPROACH_TRAIL_STONES,
  ...CLIMB_TRAIL_STONES,
])

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
    end: MOUNTAIN_CLIMB_END,
    position: [MOUNTAIN_CORNER.x, MOUNTAIN_CORNER.y, MOUNTAIN_ORIGIN_Z],
  },
  {
    id: 'summit',
    start: MOUNTAIN_CLIMB_END,
    end: 1,
    position: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y, MOUNTAIN_SUMMIT.z],
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

export const MOUNTAIN_PATH = Object.freeze({
  start: SCENE_RANGES.mountain.start,
  end: SCENE_RANGES.mountain.end,
  slopeStart: MOUNTAIN_CLIMB_START,
  originZ: MOUNTAIN_ORIGIN_Z,
  cameraTransitionStart: SCENE_RANGES.mountain.start,
  cameraTransitionEnd: 0.53,
  climbHeight: 18,
  cameraHeight: 0.8,
  cameraDistance: 6,
  lookHeight: 8,
  lookAhead: 20,
})

export const MOUNTAIN_PROJECT_MARKERS = Object.freeze([
  Object.freeze({
    id: 'csfd',
    triggerOffset: 0.725,
    revealRadius: 0.018,
    position: [2.2, 6.9, -9.8],
    accent: '#FFD15C',
    eyebrow: 'Project 01',
    text: 'CSFD - Full-stack React & Express application.',
  }),
  Object.freeze({
    id: 'unishare',
    triggerOffset: 0.765,
    revealRadius: 0.018,
    position: [3.2, 12.7, -18.6],
    accent: '#77DD77',
    eyebrow: 'Project 02',
    text: 'UniShare - Cross-platform Flutter community platform.',
  }),
  Object.freeze({
    id: 'leadership',
    triggerOffset: 0.798,
    revealRadius: 0.016,
    position: [-3, 17.3, -25.8],
    accent: '#FFB380',
    eyebrow: 'Community',
    text: 'FOSSASIA & NGO Leadership.',
  }),
])

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
    position: [MOUNTAIN_CORNER.x, MOUNTAIN_CORNER.y, MOUNTAIN_CORNER.z],
    rotationY: Math.PI,
  },
  {
    t: 0.65,
    position: [CAMPUS_PATH.endX, CAMPUS_PATH.groundY, -34],
    rotationY: Math.PI,
  },
  {
    t: MOUNTAIN_CLIMB_START,
    position: [
      CAMPUS_PATH.endX,
      CAMPUS_PATH.groundY + CLIMB_BASE_TOP + MOUNTAIN_CHARACTER_GROUND_OFFSET,
      MOUNTAIN_ORIGIN_Z,
    ],
    rotationY: Math.PI,
  },
  {
    t: 0.72,
    position: [CAMPUS_PATH.endX - 1.1, -5.7, -46],
    rotationY: 3.44,
  },
  {
    t: 0.755,
    position: [CAMPUS_PATH.endX + 1.2, -2.3, -52],
    rotationY: 2.6,
  },
  {
    t: 0.79,
    position: [CAMPUS_PATH.endX + 1.3, 1.9, -58],
    rotationY: 3.02,
  },
  {
    t: MOUNTAIN_CLIMB_END,
    position: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y, -70.2],
    rotationY: Math.PI,
  },
  {
    t: 0.85,
    position: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y, -72.4],
    rotationY: Math.PI,
  },
  {
    t: SUMMIT_SEQUENCE.haltEnd,
    position: SUMMIT_SEQUENCE.characterPosition,
    rotationY: Math.PI,
  },
  {
    t: 0.96,
    position: SUMMIT_SEQUENCE.characterPosition,
    rotationY: Math.PI,
  },
  {
    t: 1,
    position: SUMMIT_SEQUENCE.characterPosition,
    rotationY: Math.PI,
  },
]

export const CAMERA_KEYFRAMES = [
  { t: 0, position: [1.5, 2.5, 6], target: [2, 1.55, 0.5], fov: 40 },
  { t: 0.08, position: [6, 2.5, 10], target: [2, 0.9, 3.42], fov: 48 },
  { t: 0.19, position: [3.6, -7, 12], target: [3.6, -9.4, 3.42], fov: 48 },
  { t: 0.2, position: [3.6, -7, 12], target: [3.6, -9.4, 3.42], fov: 48 },
  {
    t: 0.46,
    position: [CAMPUS_PATH.endX + 0.4, -7, 12],
    target: [CAMPUS_PATH.endX + 0.4, -9.4, 3.42],
    fov: 48,
  },
  {
    t: 0.48,
    position: [CAMPUS_PATH.endX + 1.6, -7, 12],
    target: [CAMPUS_PATH.endX + 1.6, -9.4, 3.42],
    fov: 48,
  },
  {
    t: 0.5,
    position: [CAMPUS_PATH.endX + 1.6, -7, 12],
    target: [CAMPUS_PATH.endX, -9.4, 3.42],
    fov: 48,
  },
  {
    t: 0.53,
    position: [CAMPUS_PATH.endX, -9, -13],
    target: [CAMPUS_PATH.endX, -2, -34],
    fov: 48,
  },
  {
    t: 0.72,
    position: [CAMPUS_PATH.endX - 0.55, -7.6, -37],
    target: [CAMPUS_PATH.endX - 0.55, -0.6, -58],
    fov: 48,
  },
  {
    t: 0.79,
    position: [CAMPUS_PATH.endX + 1.25, -0.7, -50.3],
    target: [CAMPUS_PATH.endX + 1.25, 6.3, -71.3],
    fov: 49,
  },
  {
    t: MOUNTAIN_CLIMB_END,
    position: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 1, -64],
    target: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 8, -85],
    fov: 50,
  },
  {
    t: 0.88,
    position: [CAMPUS_PATH.endX + 8, MOUNTAIN_SUMMIT.y + 3, -69],
    target: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 1.2, -77],
    fov: 50,
  },
  {
    t: 0.94,
    position: [CAMPUS_PATH.endX + 8, MOUNTAIN_SUMMIT.y + 3, -69],
    target: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 1.2, -77],
    fov: 50,
  },
  {
    t: 0.96,
    position: [CAMPUS_PATH.endX + 8, MOUNTAIN_SUMMIT.y + 3, -69],
    target: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 1.2, -77],
    fov: 50,
  },
  {
    t: 1,
    position: [CAMPUS_PATH.endX + 8, MOUNTAIN_SUMMIT.y + 3, -69],
    target: [CAMPUS_PATH.endX, MOUNTAIN_SUMMIT.y + 1.2, -77],
    fov: 50,
  },
]

export const SUMMIT_LOOK_AROUND = Object.freeze({
  start: 0.96,
  radius: Math.sqrt(8 ** 2 + 8 ** 2 + 1.8 ** 2),
  baseAzimuth: Math.PI / 4,
  baseElevation: Math.atan2(1.8, Math.sqrt(8 ** 2 + 8 ** 2)),
  minElevation: 0,
  maxElevation:
    Math.atan2(1.8, Math.sqrt(8 ** 2 + 8 ** 2)) + Math.PI / 6,
})

export const PLAYGROUND_MOTION_OFFSETS = Object.freeze({
  waveEnd: 0.03,
  slideEnd: 0.08,
  groundContact: 0.19,
  landingEnd: 0.2,
})

export const OUTFIT_TRANSITION_OFFSETS = Object.freeze({
  university: PLAYGROUND_MOTION_OFFSETS.groundContact,
  hiker: SCENE_RANGES.mountain.start,
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

export const getCharacterPositionAtOffset = (offset, target) => {
  if (offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end) {
    return getMountainTrailPositionAtOffset(offset, target)
  }

  for (let index = 0; index < CHARACTER_KEYFRAMES.length - 1; index += 1) {
    const start = CHARACTER_KEYFRAMES[index]
    const end = CHARACTER_KEYFRAMES[index + 1]
    if (offset > end.t) continue

    const range = end.t - start.t
    let progress = range
      ? Math.max(0, Math.min(1, (offset - start.t) / range))
      : 0
    if (
      start.t === SUMMIT_SEQUENCE.haltStart &&
      end.t === SUMMIT_SEQUENCE.haltEnd
    ) {
      progress = smootherStep(progress)
    }
    target.set(
      start.position[0] + (end.position[0] - start.position[0]) * progress,
      start.position[1] + (end.position[1] - start.position[1]) * progress,
      start.position[2] + (end.position[2] - start.position[2]) * progress,
    )
    return target
  }

  const finalPosition =
    CHARACTER_KEYFRAMES[CHARACTER_KEYFRAMES.length - 1].position
  return target.set(...finalPosition)
}

const smootherStep = (value) =>
  value * value * value * (value * (value * 6 - 15) + 10)

export const getMountainTrailHeightAtZ = (worldZ) => {
  const localZ = worldZ - MOUNTAIN_ORIGIN_Z

  for (let index = 0; index < MOUNTAIN_TRAIL_STONES.length - 1; index += 1) {
    const start = MOUNTAIN_TRAIL_STONES[index]
    const end = MOUNTAIN_TRAIL_STONES[index + 1]
    if (localZ > start.z || localZ < end.z) continue

    const zRange = start.z - end.z
    const zProgress = zRange
      ? Math.max(0, Math.min(1, (start.z - localZ) / zRange))
      : 0
    return (
      MOUNTAIN_CORNER.y +
      start.topY +
      (end.topY - start.topY) * smootherStep(zProgress)
    )
  }

  const endpoint =
    localZ >= MOUNTAIN_TRAIL_STONES[0].z
      ? MOUNTAIN_TRAIL_STONES[0]
      : MOUNTAIN_TRAIL_STONES.at(-1)
  return MOUNTAIN_CORNER.y + endpoint.topY
}

export const getMountainTrailPositionAtOffset = (offset, target) => {
  for (let index = 0; index < MOUNTAIN_TRAIL_STONES.length - 1; index += 1) {
    const start = MOUNTAIN_TRAIL_STONES[index]
    const end = MOUNTAIN_TRAIL_STONES[index + 1]
    if (offset > end.t) continue

    const range = end.t - start.t
    const progress = range
      ? Math.max(0, Math.min(1, (offset - start.t) / range))
      : 0
    const worldZ =
      MOUNTAIN_ORIGIN_Z +
      start.z +
      (end.z - start.z) * progress
    const calculatedHeight = getMountainTrailHeightAtZ(worldZ)
    const clearanceProgress = Math.max(
      0,
      Math.min(
        1,
        (offset - MOUNTAIN_APPROACH_START) /
          (MOUNTAIN_CLIMB_START - MOUNTAIN_APPROACH_START),
      ),
    )
    const characterGroundOffset =
      -MOUNTAIN_CHARACTER_FOOT_OFFSET +
      (MOUNTAIN_CHARACTER_GROUND_OFFSET +
        MOUNTAIN_CHARACTER_FOOT_OFFSET) *
        smootherStep(clearanceProgress)
    target.set(
      MOUNTAIN_CORNER.x +
        start.x +
        (end.x - start.x) * progress,
      calculatedHeight + characterGroundOffset,
      worldZ,
    )
    return target
  }

  const finalStone = MOUNTAIN_TRAIL_STONES.at(-1)
  return target.set(
    MOUNTAIN_CORNER.x + finalStone.x,
    MOUNTAIN_CORNER.y +
      finalStone.topY +
      MOUNTAIN_CHARACTER_GROUND_OFFSET,
    MOUNTAIN_ORIGIN_Z + finalStone.z,
  )
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

export const getMountainMarkerProximity = (offset, marker) => {
  if (offset < MOUNTAIN_PATH.start || offset > MOUNTAIN_PATH.end) return 0

  const distance = Math.abs(offset - marker.triggerOffset)
  const linearStrength = Math.max(
    0,
    Math.min(1, 1 - distance / marker.revealRadius),
  )
  return linearStrength * linearStrength * (3 - 2 * linearStrength)
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
