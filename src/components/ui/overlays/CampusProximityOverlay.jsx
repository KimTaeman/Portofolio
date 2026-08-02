import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import useDayNight from '../../../hooks/useDayNight'
import {
  CAMPUS_LANDMARKS,
  getCampusLandmarkProximity,
} from '../../../config/narrativeTimeline'

const getActiveLandmark = (scrollOffset) => {
  let activeLandmark = null
  let activeStrength = 0

  for (const landmark of CAMPUS_LANDMARKS) {
    const strength = getCampusLandmarkProximity(scrollOffset, landmark)
    if (strength > activeStrength) {
      activeLandmark = landmark
      activeStrength = strength
    }
  }

  return activeStrength > 0.015 ? activeLandmark : null
}

export default function CampusProximityOverlay({ scrollOffset = 0 }) {
  const { isNightMode } = useDayNight()
  const activeLandmark = getActiveLandmark(scrollOffset)
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-1/2 z-30 w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 md:bottom-auto md:left-auto md:right-[7%] md:top-[26%] md:translate-x-0"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {activeLandmark && (
          <motion.div
            key={activeLandmark.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={transition}
            className={`max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border px-5 py-4 shadow-[0_20px_55px_rgba(15,23,42,0.28)] backdrop-blur-md transition-colors duration-500 sm:rounded-3xl sm:px-6 sm:py-5 ${isNightMode ? 'border-white/15 bg-[#1E293B]/90 text-[#F8FAFC]' : 'border-white/90 bg-[#FFF9F4]/95 text-[#3E2723]'}`}
          >
            <p className={`mb-2 font-serif text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${isNightMode ? 'text-[#94A3B8]' : 'text-[#8A817A]'}`}>
              {activeLandmark.title}
            </p>
            <p className="font-sans text-sm font-medium leading-relaxed sm:text-base">
              {activeLandmark.text}
            </p>
            {activeLandmark.techList?.length > 0 && (
              <ul
                className={`mt-3 list-inside list-disc space-y-1 font-sans text-sm font-medium transition-colors duration-500 ${isNightMode ? 'text-[#E2E8F0] marker:text-[#94A3B8]' : 'text-[#3E2723] marker:text-[#8A817A]'}`}
                aria-label="Core technologies"
              >
                {activeLandmark.techList.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
