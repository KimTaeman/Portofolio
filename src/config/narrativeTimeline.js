// Sixteen pages stretches the same normalized story timeline over roughly
// twice the physical wheel/touch distance of the previous eight-page setup.
export const SCROLL_PAGES = 16

export const PLAYGROUND_PLATEAU_Y = 20
export const PLAYGROUND_SLIDE_START = Object.freeze([
  2,
  PLAYGROUND_PLATEAU_Y + 2.28,
  -0.34,
])
export const PLAYGROUND_SLIDE_EXIT = Object.freeze([
  2,
  PLAYGROUND_PLATEAU_Y + 0.91,
  3.42,
])
export const PLAYGROUND_SLIDE_ROTATION_X = -0.35

export const CAMPUS_PATH = Object.freeze({
  centerX: 8,
  groundY: -10,
  surfaceY: -9.81,
  characterZ: 3.42,
  // A short, quiet entrance gives the Scene 2 copy time to settle before the
  // first interactive landmark enters the character's immediate space.
  walkStart: 0.21,
  walkEnd: 0.48,
  startX: -2,
  endX: 19,
})

const CAMPUS_CAMERA_FRAME_OFFSET_X = 1.6

export const MOUNTAIN_CORNER = Object.freeze({
  x: CAMPUS_PATH.endX,
  y: CAMPUS_PATH.surfaceY,
  z: CAMPUS_PATH.characterZ,
})

export const MOUNTAIN_ORIGIN_Z = -150
export const MOUNTAIN_CHARACTER_GROUND_OFFSET = 1.5

const MOUNTAIN_APPROACH_START = 0.5
const MOUNTAIN_TRAIL_START = 0.62
const MOUNTAIN_CLIMB_END = 0.82
const MOUNTAIN_SUMMIT_Z = -187
const TRAIL_START_LOCAL_Z = 20
const TRAIL_END_LOCAL_Z = MOUNTAIN_SUMMIT_Z + 6.8 - MOUNTAIN_ORIGIN_Z
const TRAIL_START_TOP = -4
const TRAIL_END_TOP = 19.85
const TRAIL_POINT_COUNT = 49
const smootherStep = (value) =>
  value * value * value * (value * (value * 6 - 15) + 10)
const smoothStep = (value) => value * value * (3 - 2 * value)

const TRANSITION_START_LOCAL_Z = MOUNTAIN_CORNER.z - MOUNTAIN_ORIGIN_Z
const TRANSITION_DISTANCE =
  TRANSITION_START_LOCAL_Z - TRAIL_START_LOCAL_Z
const TRANSITION_STONE_COUNT = Math.ceil(TRANSITION_DISTANCE / 2.1) + 1

export const MOUNTAIN_TRANSITION = Object.freeze({
  start: MOUNTAIN_APPROACH_START,
  end: MOUNTAIN_TRAIL_START,
  startWorldZ: MOUNTAIN_CORNER.z,
  endWorldZ: MOUNTAIN_ORIGIN_Z + TRAIL_START_LOCAL_Z,
  startLocalZ: TRANSITION_START_LOCAL_Z,
  endLocalZ: TRAIL_START_LOCAL_Z,
  startTopY: 0,
  endTopY: TRAIL_START_TOP,
  distance: TRANSITION_DISTANCE,
})

export const getMountainTransitionTopY = (progress) => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const descent = smootherStep(clampedProgress)
  const rollingProfile =
    Math.sin(clampedProgress * Math.PI * 3) *
    Math.sin(clampedProgress * Math.PI) *
    0.55

  return (
    MOUNTAIN_TRANSITION.startTopY +
    (MOUNTAIN_TRANSITION.endTopY - MOUNTAIN_TRANSITION.startTopY) *
      descent +
    rollingProfile
  )
}

export const getMountainTransitionX = (progress) => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  return (
    Math.sin(clampedProgress * Math.PI * 2) *
    Math.sin(clampedProgress * Math.PI) *
    1.15
  )
}

export const MOUNTAIN_TRANSITION_STONES = Object.freeze(
  Array.from({ length: TRANSITION_STONE_COUNT }, (_, index) => {
    const progress = index / (TRANSITION_STONE_COUNT - 1)
    return Object.freeze({
      progress,
      x: getMountainTransitionX(progress),
      topY: getMountainTransitionTopY(progress),
      z:
        TRANSITION_START_LOCAL_Z +
        (TRAIL_START_LOCAL_Z - TRANSITION_START_LOCAL_Z) * progress,
      rotationY: Math.sin(index * 0.91) * 0.08,
      scale: 0.9 + (index % 4) * 0.045,
    })
  }),
)

export const MOUNTAIN_SUMMIT = Object.freeze({
  y: CAMPUS_PATH.surfaceY + TRAIL_END_TOP + MOUNTAIN_CHARACTER_GROUND_OFFSET,
  z: MOUNTAIN_SUMMIT_Z,
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

export const MOUNTAIN_BRIDGE_RANGE = Object.freeze({
  startProgress: 0.43,
  endProgress: 0.57,
})

const getSCurveX = (progress) =>
  -12 *
  Math.sin(progress * Math.PI * 2) *
  Math.sin(progress * Math.PI)

const getSCurveTopY = (progress) => {
  const elevationEase = progress * progress * (3 - 2 * progress)
  const baseHeight =
    TRAIL_START_TOP + (TRAIL_END_TOP - TRAIL_START_TOP) * elevationEase
  const bridgeProgress =
    (progress - MOUNTAIN_BRIDGE_RANGE.startProgress) /
    (MOUNTAIN_BRIDGE_RANGE.endProgress -
      MOUNTAIN_BRIDGE_RANGE.startProgress)
  const bridgeSag =
    bridgeProgress > 0 && bridgeProgress < 1
      ? Math.sin(bridgeProgress * Math.PI) * 0.55
      : 0
  return baseHeight - bridgeSag
}

export const MOUNTAIN_TRAIL_STONES = Object.freeze(
  Array.from({ length: TRAIL_POINT_COUNT }, (_, index) => {
    const progress = index / (TRAIL_POINT_COUNT - 1)
    const sampleBefore = Math.max(0, progress - 0.002)
    const sampleAfter = Math.min(1, progress + 0.002)
    const x = getSCurveX(progress)
    const tangentX = getSCurveX(sampleAfter) - getSCurveX(sampleBefore)
    const tangentZ =
      (TRAIL_END_LOCAL_Z - TRAIL_START_LOCAL_Z) *
      (sampleAfter - sampleBefore)
    const isBridge =
      progress >= MOUNTAIN_BRIDGE_RANGE.startProgress &&
      progress <= MOUNTAIN_BRIDGE_RANGE.endProgress

    return Object.freeze({
      t:
        MOUNTAIN_TRAIL_START +
        progress * (MOUNTAIN_CLIMB_END - MOUNTAIN_TRAIL_START),
      progress,
      x,
      topY: getSCurveTopY(progress),
      z:
        TRAIL_START_LOCAL_Z +
        (TRAIL_END_LOCAL_Z - TRAIL_START_LOCAL_Z) * progress,
      rotationY: Math.atan2(tangentX, tangentZ),
      scale: 0.88 + (index % 4) * 0.055,
      phase: isBridge ? 'bridge' : 'stone',
    })
  }),
)

// Five evenly spaced discoveries leave breathing room at the trail entrance
// and summit while distributing projects consistently across the ascent.
export const MOUNTAIN_PROJECT_PROGRESS = Object.freeze([
  0.1,
  0.3,
  0.5,
  0.7,
  0.9,
])
export const MOUNTAIN_PROJECT_BADGE_HEIGHT = 4.15
const MOUNTAIN_PROJECT_PACING_POINTS = Object.freeze([
  0,
  ...MOUNTAIN_PROJECT_PROGRESS,
  1,
])

const getCheckpointEasedProgress = (progress, checkpoints) => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  for (let index = 0; index < checkpoints.length - 1; index += 1) {
    const start = checkpoints[index]
    const end = checkpoints[index + 1]
    if (clampedProgress > end) continue
    const localProgress = (clampedProgress - start) / (end - start)
    return start + (end - start) * smootherStep(localProgress)
  }
  return 1
}

// Shared by the rendered balloons and the camera controller so project
// framing cannot drift away from the actual interactive landmark positions.
export const MOUNTAIN_PROJECT_ANCHORS = Object.freeze(
  MOUNTAIN_PROJECT_PROGRESS.map((progress, index) => {
    const stone =
      MOUNTAIN_TRAIL_STONES[
        Math.round(progress * (MOUNTAIN_TRAIL_STONES.length - 1))
      ]
    const side = index % 2 ? 1 : -1
    const perpendicularX = Math.cos(stone.rotationY)
    const perpendicularZ = -Math.sin(stone.rotationY)
    const sideOffset = 7 + (index % 3) * 0.55

    return Object.freeze({
      progress,
      t:
        MOUNTAIN_TRAIL_START +
        progress * (MOUNTAIN_CLIMB_END - MOUNTAIN_TRAIL_START),
      triggerPosition: Object.freeze([
        stone.x,
        stone.topY + MOUNTAIN_CHARACTER_GROUND_OFFSET,
        stone.z,
      ]),
      basePosition: Object.freeze([
        stone.x + perpendicularX * sideOffset * side,
        stone.topY + 9.5 + (index % 2) * 0.9,
        stone.z + perpendicularZ * sideOffset * side,
      ]),
    })
  }),
)

export const CAMPUS_LANDMARKS = Object.freeze([
  Object.freeze({
    id: 'badminton',
    title: 'Off Screen, On Court',
    worldX: 3.2,
    localX: -4.8,
    // Sit just beyond the foreground edge of the stone path so the racket is
    // readable in silhouette and cannot be hidden by the rear lamp row.
    z: 1.6,
    proximityRadius: 1.55,
    bobSpeed: 1.7,
    bobPhase: 1.8,
    labelY: 2.15,
    text: "I love playing badminton. It's my favourite sport to clear my head and relax.",
  }),
  Object.freeze({
    id: 'easel',
    title: 'Quiet Focus',
    worldX: 8,
    localX: 0,
    z: -0.65,
    proximityRadius: 1.55,
    bobSpeed: 1.55,
    bobPhase: 0,
    labelY: 2.15,
    text: 'Drawing is my way to find calm. It teaches me patience and how to appreciate the small details, keeping me grounded when I return to the screen.',
  }),
  Object.freeze({
    id: 'skills',
    title: 'Where Ideas Take Shape',
    worldX: 14,
    localX: 6,
    z: -2.35,
    proximityRadius: 1.55,
    bobSpeed: 1.45,
    bobPhase: 3.4,
    labelY: 1.9,
    text: 'Code is my favorite tool for problem-solving. I spend most of my time building full-stack web solutions and mobile apps using my core stack:',
    techList: [
      'React & Express (Full-Stack Web)',
      'Flutter & Dart (Mobile)',
      'Java & C# (Foundations)',
    ],
  }),
])

export const SCENES = [
  {
    id: 'playground',
    start: 0,
    end: 0.2,
    position: [0, PLAYGROUND_PLATEAU_Y, 0],
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
  slopeStart: MOUNTAIN_TRAIL_START,
  trailStart: MOUNTAIN_TRAIL_START,
  originZ: MOUNTAIN_ORIGIN_Z,
  cameraTransitionStart: SCENE_RANGES.mountain.start,
  cameraTransitionEnd: 0.53,
  climbHeight: 18,
  cameraHeight: 7.5,
  cameraDistance: 12.5,
  lookHeight: 1.8,
  lookDistance: 14,
  subjectFrameHeight: 2.2,
  lookAheadOffset: 0.022,
})

export const CHARACTER_KEYFRAMES = [
  { t: 0, position: PLAYGROUND_SLIDE_START, rotationY: 0 },
  { t: 0.08, position: PLAYGROUND_SLIDE_EXIT, rotationY: 0 },
  {
    t: 0.19,
    position: [CAMPUS_PATH.startX, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: 0,
  },
  {
    t: CAMPUS_PATH.walkStart,
    position: [CAMPUS_PATH.startX, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: 0.285,
    position: [3.2, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: 0.36,
    position: [8, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: 0.43,
    position: [14, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: CAMPUS_PATH.walkEnd,
    position: [CAMPUS_PATH.endX, CAMPUS_PATH.surfaceY, CAMPUS_PATH.characterZ],
    rotationY: Math.PI / 2,
  },
  {
    t: 0.5,
    position: [MOUNTAIN_CORNER.x, MOUNTAIN_CORNER.y, MOUNTAIN_CORNER.z],
    rotationY: Math.PI,
  },
  {
    t: MOUNTAIN_CLIMB_END,
    position: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y,
      MOUNTAIN_SUMMIT.z + 6.8,
    ],
    rotationY: Math.PI,
  },
  {
    t: 0.85,
    position: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y,
      MOUNTAIN_SUMMIT.z + 4.6,
    ],
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
  {
    t: 0,
    position: [1.5, PLAYGROUND_PLATEAU_Y + 2.5, 6],
    target: [2, PLAYGROUND_PLATEAU_Y + 1.55, 0.5],
    fov: 40,
  },
  {
    t: 0.08,
    position: [5, PLAYGROUND_PLATEAU_Y + 3.11, 9.82],
    target: [2, PLAYGROUND_PLATEAU_Y + 0.7, 3.42],
    fov: 48,
  },
  {
    t: 0.19,
    position: [CAMPUS_PATH.startX + 2, -7.2, 9.82],
    target: [CAMPUS_PATH.startX + CAMPUS_CAMERA_FRAME_OFFSET_X, -9.4, 3.42],
    fov: 48,
  },
  {
    t: 0.2,
    position: [CAMPUS_PATH.startX + CAMPUS_CAMERA_FRAME_OFFSET_X, -7, 12],
    target: [CAMPUS_PATH.startX + CAMPUS_CAMERA_FRAME_OFFSET_X, -9.4, 3.42],
    fov: 48,
  },
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
    target: [CAMPUS_PATH.endX, -8.5, -22],
    fov: 48,
  },
  {
    t: 0.72,
    position: [CAMPUS_PATH.endX, 6.2, -144],
    target: [CAMPUS_PATH.endX, 2.4, -155],
    fov: 48,
  },
  {
    t: 0.79,
    position: [CAMPUS_PATH.endX + 4.4, 15.3, -161.7],
    target: [CAMPUS_PATH.endX + 2.7, 11.5, -173],
    fov: 49,
  },
  {
    t: MOUNTAIN_CLIMB_END,
    position: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + MOUNTAIN_PATH.cameraHeight,
      MOUNTAIN_SUMMIT.z + 17.8,
    ],
    target: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + MOUNTAIN_PATH.lookHeight,
      MOUNTAIN_SUMMIT.z + 6.8,
    ],
    fov: 50,
  },
  {
    t: 0.88,
    position: [
      CAMPUS_PATH.endX + 8,
      MOUNTAIN_SUMMIT.y + 3,
      MOUNTAIN_SUMMIT.z + 8,
    ],
    target: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + 1.2,
      MOUNTAIN_SUMMIT.z,
    ],
    fov: 50,
  },
  {
    t: 0.94,
    position: [
      CAMPUS_PATH.endX + 8,
      MOUNTAIN_SUMMIT.y + 3,
      MOUNTAIN_SUMMIT.z + 8,
    ],
    target: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + 1.2,
      MOUNTAIN_SUMMIT.z,
    ],
    fov: 50,
  },
  {
    t: 0.96,
    position: [
      CAMPUS_PATH.endX + 8,
      MOUNTAIN_SUMMIT.y + 3,
      MOUNTAIN_SUMMIT.z + 8,
    ],
    target: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + 1.2,
      MOUNTAIN_SUMMIT.z,
    ],
    fov: 50,
  },
  {
    t: 1,
    position: [
      CAMPUS_PATH.endX + 8,
      MOUNTAIN_SUMMIT.y + 3,
      MOUNTAIN_SUMMIT.z + 8,
    ],
    target: [
      CAMPUS_PATH.endX,
      MOUNTAIN_SUMMIT.y + 1.2,
      MOUNTAIN_SUMMIT.z,
    ],
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

export const getPlaygroundFallProgress = (offset) =>
  Math.max(
    0,
    Math.min(
      1,
      (offset - PLAYGROUND_MOTION_OFFSETS.slideEnd) /
        (PLAYGROUND_MOTION_OFFSETS.groundContact -
          PLAYGROUND_MOTION_OFFSETS.slideEnd),
    ),
  )

// This value nearly cancels the initial downward slope, so the character
// leaves the slide gently before constant gravity visibly takes over.
const PLAYGROUND_FALL_ARC_HEIGHT = 7.5
const PLAYGROUND_LANDING_CUSHION_START = 0.82

const getBallisticFallY = (progress) => {
  const startY = PLAYGROUND_SLIDE_EXIT[1]
  const endY = CAMPUS_PATH.surfaceY
  return (
    startY +
    (endY - startY) * progress +
    4 * PLAYGROUND_FALL_ARC_HEIGHT * progress * (1 - progress)
  )
}

const getBallisticFallSlope = (progress) =>
  CAMPUS_PATH.surfaceY -
  PLAYGROUND_SLIDE_EXIT[1] +
  4 * PLAYGROUND_FALL_ARC_HEIGHT * (1 - 2 * progress)

const getCushionedFallY = (progress) => {
  if (progress <= PLAYGROUND_LANDING_CUSHION_START) {
    return getBallisticFallY(progress)
  }

  // Cubic Hermite interpolation preserves the incoming downward velocity,
  // then eases it to zero exactly at the campus path surface.
  const start = PLAYGROUND_LANDING_CUSHION_START
  const duration = 1 - start
  const landingProgress = (progress - start) / duration
  const landingProgressSquared = landingProgress * landingProgress
  const landingProgressCubed = landingProgressSquared * landingProgress
  const startY = getBallisticFallY(start)
  const startSlope = getBallisticFallSlope(start) * duration
  const h00 = 2 * landingProgressCubed - 3 * landingProgressSquared + 1
  const h10 = landingProgressCubed - 2 * landingProgressSquared + landingProgress
  const h01 = -2 * landingProgressCubed + 3 * landingProgressSquared

  return h00 * startY + h10 * startSlope + h01 * CAMPUS_PATH.surfaceY
}

export const getPlaygroundFallPositionAtProgress = (progress, target) => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const travelProgress = smootherStep(clampedProgress)

  return target.set(
    PLAYGROUND_SLIDE_EXIT[0] +
      (CAMPUS_PATH.startX - PLAYGROUND_SLIDE_EXIT[0]) * travelProgress,
    getCushionedFallY(clampedProgress),
    PLAYGROUND_SLIDE_EXIT[2] +
      (CAMPUS_PATH.characterZ - PLAYGROUND_SLIDE_EXIT[2]) * travelProgress,
  )
}

export const getPlaygroundFallPositionAtOffset = (offset, target) =>
  getPlaygroundFallPositionAtProgress(
    getPlaygroundFallProgress(offset),
    target,
  )

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

    const progress = getCharacterKeyframeProgress(offset, start, end)
    return start.position[0] + (end.position[0] - start.position[0]) * progress
  }

  return CHARACTER_KEYFRAMES[CHARACTER_KEYFRAMES.length - 1].position[0]
}

export const getCharacterKeyframeProgress = (offset, start, end) => {
  const range = end.t - start.t
  let progress = range
    ? Math.max(0, Math.min(1, (offset - start.t) / range))
    : 0
  if (start.t === 0 && end.t === PLAYGROUND_MOTION_OFFSETS.slideEnd) {
    progress =
      offset <= PLAYGROUND_MOTION_OFFSETS.waveEnd
        ? 0
        : smootherStep(
            (offset - PLAYGROUND_MOTION_OFFSETS.waveEnd) /
              (PLAYGROUND_MOTION_OFFSETS.slideEnd -
                PLAYGROUND_MOTION_OFFSETS.waveEnd),
          )
  } else if (
    start.t >= CAMPUS_PATH.walkStart &&
    end.t <= CAMPUS_PATH.walkEnd
  ) {
    // Each campus segment eases to zero velocity at its landmark. The next
    // segment accelerates from rest, creating a readable pause without a
    // hard stop or a discontinuity in position.
    progress = smootherStep(progress)
  } else if (
    start.t === SUMMIT_SEQUENCE.haltStart &&
    end.t === SUMMIT_SEQUENCE.haltEnd
  ) {
    progress = smootherStep(progress)
  }
  return progress
}

export const getCharacterPositionAtOffset = (offset, target) => {
  if (
    offset >= PLAYGROUND_MOTION_OFFSETS.slideEnd &&
    offset <= PLAYGROUND_MOTION_OFFSETS.groundContact
  ) {
    return getPlaygroundFallPositionAtOffset(offset, target)
  }

  if (offset >= MOUNTAIN_PATH.start && offset <= MOUNTAIN_PATH.end) {
    return getMountainTrailPositionAtOffset(offset, target)
  }

  for (let index = 0; index < CHARACTER_KEYFRAMES.length - 1; index += 1) {
    const start = CHARACTER_KEYFRAMES[index]
    const end = CHARACTER_KEYFRAMES[index + 1]
    if (offset > end.t) continue

    const progress = getCharacterKeyframeProgress(offset, start, end)
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

export const getMountainTrailHeightAtZ = (worldZ) => {
  const localZ = worldZ - MOUNTAIN_ORIGIN_Z
  const progress = Math.max(
    0,
    Math.min(
      1,
      (localZ - TRAIL_START_LOCAL_Z) /
        (TRAIL_END_LOCAL_Z - TRAIL_START_LOCAL_Z),
    ),
  )
  return MOUNTAIN_CORNER.y + getSCurveTopY(progress)
}

export const getMountainTrailPositionAtOffset = (offset, target) => {
  if (offset < MOUNTAIN_TRAIL_START) {
    const approachProgress = Math.max(
      0,
      Math.min(
        1,
        (offset - MOUNTAIN_APPROACH_START) /
          (MOUNTAIN_TRAIL_START - MOUNTAIN_APPROACH_START),
      ),
    )
    // Cubic easing lowers the peak velocity on this long approach compared
    // with the previous quintic curve while retaining soft endpoints.
    const easedApproach = smoothStep(approachProgress)
    const transitionTopY = getMountainTransitionTopY(easedApproach)
    target.set(
      MOUNTAIN_CORNER.x + getMountainTransitionX(easedApproach),
      MOUNTAIN_CORNER.y +
        transitionTopY +
        MOUNTAIN_CHARACTER_GROUND_OFFSET * easedApproach,
      MOUNTAIN_CORNER.z +
        (MOUNTAIN_TRANSITION.endWorldZ - MOUNTAIN_CORNER.z) * easedApproach,
    )
    return target
  }

  const rawTrailProgress = Math.max(
    0,
    Math.min(
      1,
      (offset - MOUNTAIN_TRAIL_START) /
        (MOUNTAIN_CLIMB_END - MOUNTAIN_TRAIL_START),
    ),
  )
  const trailProgress = getCheckpointEasedProgress(
    rawTrailProgress,
    MOUNTAIN_PROJECT_PACING_POINTS,
  )
  return target.set(
    MOUNTAIN_CORNER.x + getSCurveX(trailProgress),
    MOUNTAIN_CORNER.y +
      getSCurveTopY(trailProgress) +
      MOUNTAIN_CHARACTER_GROUND_OFFSET,
    MOUNTAIN_ORIGIN_Z +
      TRAIL_START_LOCAL_Z +
      (TRAIL_END_LOCAL_Z - TRAIL_START_LOCAL_Z) * trailProgress,
  )
}

export const getMountainTrailHeadingAtOffset = (offset) => {
  if (offset < MOUNTAIN_TRAIL_START) return Math.PI

  const rawTrailProgress = Math.max(0, Math.min(1,
    (offset - MOUNTAIN_TRAIL_START) /
      (MOUNTAIN_CLIMB_END - MOUNTAIN_TRAIL_START),
  ))
  const trailProgress = getCheckpointEasedProgress(
    rawTrailProgress,
    MOUNTAIN_PROJECT_PACING_POINTS,
  )
  const sampleBefore = Math.max(0, trailProgress - 0.002)
  const sampleAfter = Math.min(1, trailProgress + 0.002)
  const tangentX = getSCurveX(sampleAfter) - getSCurveX(sampleBefore)
  const tangentZ =
    (TRAIL_END_LOCAL_Z - TRAIL_START_LOCAL_Z) *
    (sampleAfter - sampleBefore)
  return Math.atan2(tangentX, tangentZ)
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

export const getNearestMountainProjectLook = (offset) => {
  if (offset < MOUNTAIN_TRAIL_START || offset > MOUNTAIN_CLIMB_END) return 0

  const rawProgress = Math.max(
    0,
    Math.min(
      1,
      (offset - MOUNTAIN_TRAIL_START) /
        (MOUNTAIN_CLIMB_END - MOUNTAIN_TRAIL_START),
    ),
  )
  const trailProgress = getCheckpointEasedProgress(
    rawProgress,
    MOUNTAIN_PROJECT_PACING_POINTS,
  )
  let strongestLook = 0
  let strongestMagnitude = 0

  MOUNTAIN_PROJECT_PROGRESS.forEach((projectProgress, index) => {
    const distance = Math.abs(trailProgress - projectProgress)
    const linearStrength = Math.max(0, Math.min(1, 1 - distance / 0.065))
    const strength = smoothStep(linearStrength)
    if (strength <= strongestMagnitude) return
    strongestMagnitude = strength
    strongestLook = (index % 2 ? 1 : -1) * strength
  })

  return strongestLook
}

export const CAMPUS_CAMERA_TRACKING = Object.freeze({
  start: SCENE_RANGES.campus.start,
  end: 0.48,
  characterFrameOffsetX: CAMPUS_CAMERA_FRAME_OFFSET_X,
  // Aim through the character rather than at the path. This keeps the feet
  // near the lower quarter of the frame without filling the shot with grass.
  heightAbovePath: 3.6,
  lookHeightAbovePath: 1.55,
  fov: 45,
})
