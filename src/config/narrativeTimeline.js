export const SCROLL_PAGES = 4

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
    position: [10, -10, 3.4],
  },
  {
    id: 'mountain',
    start: 0.5,
    end: 0.7,
    position: [18, -10, 18],
  },
  {
    id: 'summit',
    start: 0.7,
    end: 1,
    position: [18, -2, 34],
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
  { t: 0.1, position: [2, 0.91, 3.42], rotationY: 0 },
  { t: 0.18, position: [2, -10, 3.42], rotationY: 0 },
  { t: 0.2, position: [2, -10, 3.42], rotationY: Math.PI / 2 },
  { t: 0.46, position: [18, -10, 3.42], rotationY: Math.PI / 2 },
  { t: 0.5, position: [18, -10, 6], rotationY: 0 },
  { t: 0.53, position: [15.8, -9.67, 12], rotationY: -0.35 },
  { t: 0.57, position: [19.9, -9.17, 14.2], rotationY: 1.08 },
  { t: 0.61, position: [16.5, -8.67, 16.5], rotationY: -0.97 },
  { t: 0.66, position: [19.2, -8.17, 18.8], rotationY: 0.87 },
  { t: 0.7, position: [19.2, -7.7, 20], rotationY: 0 },
  { t: 0.74, position: [16.8, -6.4, 23], rotationY: -0.69 },
  { t: 0.78, position: [19.3, -5.2, 25.5], rotationY: 0.79 },
  { t: 0.82, position: [16.8, -4, 28], rotationY: -0.79 },
  { t: 0.86, position: [19, -2.7, 31], rotationY: 0.63 },
  { t: 0.9, position: [18, -1.2, 34], rotationY: 0 },
  { t: 1, position: [18, -1.2, 34], rotationY: 0 },
]

export const CAMERA_KEYFRAMES = [
  { t: 0, position: [0, 3, 13], target: [2, 1.35, 1], fov: 48 },
  { t: 0.1, position: [6, 2.5, 10], target: [2, 0.9, 3.42], fov: 48 },
  { t: 0.18, position: [7, -7, 12], target: [2, -9, 3.42], fov: 50 },
  { t: 0.23, position: [3.85, -7, 12], target: [3.85, -9.4, 3.42], fov: 48 },
  { t: 0.46, position: [18, -7, 12], target: [18, -9.4, 3.42], fov: 48 },
  { t: 0.48, position: [24, -7, 6], target: [18, -9, 5], fov: 49 },
  { t: 0.5, position: [18, -7, -1], target: [18, -9, 7], fov: 50 },
  { t: 0.58, position: [18, -6, 5], target: [18, -7.5, 15], fov: 50 },
  { t: 0.66, position: [18, -4.8, 9], target: [18, -6, 19], fov: 52 },
  { t: 0.7, position: [18, -3, 10], target: [18, -4, 24], fov: 52 },
  { t: 0.78, position: [18, -1.2, 16], target: [18, -3.5, 28], fov: 52 },
  { t: 0.86, position: [18, 0.8, 23], target: [18, -1.5, 34], fov: 53 },
  { t: 0.9, position: [18, 0.4, 27.5], target: [18, 0.4, 50], fov: 55 },
  { t: 1, position: [18, 0.4, 27.5], target: [18, 0.4, 50], fov: 55 },
]

export const SUMMIT_LOOK_AROUND = Object.freeze({
  start: 0.9,
  minYaw: -Math.PI / 2,
  maxYaw: Math.PI / 2,
  minPitch: 0,
  maxPitch: Math.PI / 6,
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
