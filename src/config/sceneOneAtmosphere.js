import * as THREE from 'three'

export const SCENE_ONE_ATMOSPHERE = Object.freeze({
  fadeInStart: 0.142,
  peakStart: 0.164,
  peakEnd: 0.172,
  fadeOutEnd: 0.196,
})

export const getSceneOneAtmosphereStrength = (offset) => {
  const { fadeInStart, peakStart, peakEnd, fadeOutEnd } =
    SCENE_ONE_ATMOSPHERE

  if (offset <= fadeInStart || offset >= fadeOutEnd) return 0
  if (offset < peakStart) {
    return THREE.MathUtils.smootherstep(offset, fadeInStart, peakStart)
  }
  if (offset <= peakEnd) return 1

  return 1 - THREE.MathUtils.smootherstep(offset, peakEnd, fadeOutEnd)
}
