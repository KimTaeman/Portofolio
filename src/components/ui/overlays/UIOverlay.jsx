import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  SCENES,
  SCENE_RANGES,
  SUMMIT_LOOK_AROUND,
} from '../../../config/narrativeTimeline'

const SCENE_CONTENT = {
  playground: {
    headline: "Hi, I'm [Your Name]! Welcome to my world.",
    body: "I'm a developer who believes every great project starts with curiosity.",
  },
  campus: {
    headline: 'I spent my time learning, growing, and building my foundation.',
  },
  mountain: {
    headline: "I put my skills to the test. Here's what I've built and where I've been.",
  },
  summit: {
    headline: "Ready to explore the next peak. Let's build something amazing together.",
  },
}

const SCENE_LABELS = {
  playground: '01 CURIOSITY',
  campus: '02 LEARNING',
  mountain: '03 EXPERIENCE',
  summit: '04 THE NEXT PEAK',
}

const getActiveScene = (offset) => {
  const scene = SCENES.find(({ id }) => offset < SCENE_RANGES[id].end)
  return scene?.id ?? SCENES[SCENES.length - 1].id
}

const scrollRange = (offset, start, length) => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(1, (offset - start) / length))
}

const getSceneOpacity = (scene, offset) => {
  const range = SCENE_RANGES[scene]
  const fadeInLength = range.fadeInEnd - range.start
  const fadeOutLength = range.end - range.fadeOutStart
  const fadeIn = fadeInLength
    ? scrollRange(offset, range.start, fadeInLength)
    : 1
  const fadeOut = fadeOutLength
    ? 1 - scrollRange(offset, range.fadeOutStart, fadeOutLength)
    : 1

  return Math.min(fadeIn, fadeOut)
}

export default function UIOverlay({ scrollOffset = 0 }) {
  const activeScene = getActiveScene(scrollOffset)
  const opacity = getSceneOpacity(activeScene, scrollOffset)
  const prefersReducedMotion = useReducedMotion()
  const content = SCENE_CONTENT[activeScene]
  const entranceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1, ease: [0.22, 1, 0.36, 1] }

  return (
    <div className="relative z-10 h-full w-full">
      <div className="absolute left-[5%] top-1/2 w-[min(350px,90vw)] -translate-y-1/2">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeScene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity, y: 0 }}
            exit={{
              opacity: 0,
              y: -12,
              transition: { duration: 0 },
            }}
            transition={entranceTransition}
          >
            <p className="mb-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[#E07A5F]">
              {SCENE_LABELS[activeScene]}
            </p>
            <h1
              className="text-left font-serif text-[clamp(1.9rem,3.2vw,2.25rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-[#4A3B32]"
              style={{
                textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
              }}
            >
              {content.headline}
            </h1>
            {content.body && (
              <p
                className="mt-5 max-w-[330px] text-left text-base font-normal leading-relaxed text-[#5F4B40]"
                style={{
                  textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
                }}
              >
                {content.body}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {activeScene === 'summit' &&
            scrollOffset >= SUMMIT_LOOK_AROUND.start && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.75, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-6 inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4A3B32] shadow-[0_10px_30px_rgba(72,52,36,0.12)] backdrop-blur-md md:text-sm"
              >
                Drag to explore the 180° view. Drag upward to look at the sky.
              </motion.p>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
