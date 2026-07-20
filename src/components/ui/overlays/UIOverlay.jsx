import { AnimatePresence, motion } from 'framer-motion'
import {
  SCENES,
  SCENE_RANGES,
  SUMMIT_LOOK_AROUND,
} from '../../../config/narrativeTimeline'

const SCENE_TEXT = {
  playground: "Hi, I'm [Your Name]! Welcome to my world. I'm a developer who believes every great project starts with curiosity.",
  campus: "I spent my time learning, growing, and building my foundation.",
  mountain: "I put my skills to the test. Here's what I've built and where I've been.",
  summit: "Ready to explore the next peak. Let's build something amazing together.",
}

const SCENE_LABELS = {
  playground: '01 · Curiosity',
  campus: '02 · Learning',
  mountain: '03 · Experience',
  summit: '04 · The next peak',
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

  return (
    <div className="flex h-full w-full items-center justify-start p-6 md:p-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <p className="mb-4 text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-[#E88C47] md:text-xs">
              {SCENE_LABELS[activeScene]}
            </p>
            <p className="text-left text-3xl font-black leading-[1.02] tracking-[-0.045em] text-[#18213D] drop-shadow-[0_2px_0_rgba(255,255,255,0.55)] md:text-6xl">
              {SCENE_TEXT[activeScene]}
            </p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {activeScene === 'summit' &&
            scrollOffset >= SUMMIT_LOOK_AROUND.start && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.75, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-6 inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#29324C] shadow-[0_10px_30px_rgba(72,52,36,0.12)] backdrop-blur-md md:text-sm"
              >
                Drag to explore the 180° view. Drag upward to look at the sky.
              </motion.p>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
