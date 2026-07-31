import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  getMountainMarkerProximity,
  MOUNTAIN_PROJECT_MARKERS,
} from '../../../config/narrativeTimeline'

const getNearbyMarker = (scrollOffset) => {
  let activeMarker = null
  let activeStrength = 0

  for (const marker of MOUNTAIN_PROJECT_MARKERS) {
    const strength = getMountainMarkerProximity(scrollOffset, marker)
    if (strength > activeStrength) {
      activeMarker = marker
      activeStrength = strength
    }
  }

  return activeStrength > 0.015 ? activeMarker : null
}

export default function MountainProjectOverlay({
  scrollOffset = 0,
  selectedMarkerId = null,
  onClose = () => {},
}) {
  const nearbyMarker = getNearbyMarker(scrollOffset)
  const selectedMarker = selectedMarkerId
    ? MOUNTAIN_PROJECT_MARKERS.find(
        (marker) => marker.id === selectedMarkerId,
      )
    : null
  const activeMarker = selectedMarker || nearbyMarker
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }

  return (
    <div
      className="pointer-events-none fixed bottom-16 left-1/2 z-30 w-[min(23rem,calc(100vw-2rem))] -translate-x-1/2 md:bottom-auto md:left-auto md:right-[6%] md:top-[30%] md:translate-x-0"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {activeMarker && (
          <motion.article
            key={activeMarker.id}
            initial={{ opacity: 0, x: 26, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, y: -10, scale: 0.97 }}
            transition={transition}
            className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-[#FFF9F4]/95 p-5 text-[#4A3B32] shadow-[0_24px_65px_rgba(71,63,45,0.22)]"
          >
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: activeMarker.accent }}
            />

            <div className="mb-4 flex items-center justify-between gap-4">
              <p
                className="text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: activeMarker.accent }}
              >
                {activeMarker.eyebrow}
              </p>
              {selectedMarker && (
                <button
                  type="button"
                  onClick={onClose}
                  className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-[#4A3B32]/8 text-sm font-semibold text-[#4A3B32] transition hover:bg-[#4A3B32]/15"
                  aria-label="Close project snapshot"
                >
                  ×
                </button>
              )}
            </div>

            <div className="mb-4 grid h-24 grid-cols-[1.2fr_0.8fr] gap-3 rounded-2xl bg-[#F3EBDD] p-3">
              <div
                className="rounded-xl"
                style={{ backgroundColor: activeMarker.accent }}
              />
              <div className="grid gap-2">
                <div className="rounded-lg bg-white/90" />
                <div className="rounded-lg bg-white/65" />
              </div>
            </div>

            <p className="font-serif text-base font-medium leading-relaxed">
              {activeMarker.text}
            </p>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
